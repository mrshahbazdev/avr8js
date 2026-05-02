// SPDX-License-Identifier: MIT
// Advanced AVR8js Simulator - Single File React App
// All code consolidated into one file: utilities, AVR runner, compiler, and UI

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import {
  avrInstruction,
  AVRIOPort,
  AVRTimer,
  AVRUSART,
  CPU,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config,
  PinState,
} from 'avr8js';

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function loadHex(source, target) {
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substr(7, 2) === '00') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
      }
    }
  }
}

function formatTime(seconds) {
  const ms = Math.floor(seconds * 1000) % 1000;
  const secs = Math.floor(seconds % 60);
  const mins = Math.floor(seconds / 60);
  const pad = (v, l) => v.toString().padStart(l, '0');
  return `${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms, 3)}`;
}

class MicroTaskScheduler {
  constructor() {
    this.channel = new MessageChannel();
    this.executionQueue = [];
    this.stopped = true;
  }
  start() {
    if (this.stopped) {
      this.stopped = false;
      this.channel.port2.onmessage = () => {
        const job = this.executionQueue.shift();
        if (job) job();
      };
    }
  }
  stop() {
    this.stopped = true;
    this.executionQueue.length = 0;
    this.channel.port2.onmessage = null;
  }
  postTask(fn) {
    if (!this.stopped) {
      this.executionQueue.push(fn);
      this.channel.port1.postMessage(null);
    }
  }
}

class CPUPerformance {
  constructor(cpu, MHZ) {
    this.cpu = cpu;
    this.MHZ = MHZ;
    this.prevTime = 0;
    this.prevCycles = 0;
    this.samples = new Float32Array(64);
    this.sampleIndex = 0;
  }
  reset() {
    this.prevTime = 0;
    this.prevCycles = 0;
    this.sampleIndex = 0;
  }
  update() {
    if (this.prevTime) {
      const delta = performance.now() - this.prevTime;
      const deltaCycles = this.cpu.cycles - this.prevCycles;
      const deltaCpuMillis = 1000 * (deltaCycles / this.MHZ);
      const factor = deltaCpuMillis / delta;
      if (!this.sampleIndex) this.samples.fill(factor);
      this.samples[this.sampleIndex++ % this.samples.length] = factor;
    }
    this.prevCycles = this.cpu.cycles;
    this.prevTime = performance.now();
    return this.samples.reduce((x, y) => x + y) / this.samples.length;
  }
}

const STORAGE_KEY = 'AVR8JS_EDITOR_HISTORY';
const editorHistory = {
  save: (code) => {
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  },
  load: () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  },
  clear: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  },
};

/* ═══════════════════════════════════════════════════════════════
   AVR RUNNER
   ═══════════════════════════════════════════════════════════════ */

const FLASH = 0x8000;
const MHZ = 16000000;

class AVRRunner {
  constructor(hex) {
    this.program = new Uint16Array(FLASH);
    loadHex(hex, new Uint8Array(this.program.buffer));
    this.cpu = new CPU(this.program);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.usart = new AVRUSART(this.cpu, usart0Config, 16e6);
    this.speed = 16e6;
    this.workUnitCycles = 500000;
    this.taskScheduler = new MicroTaskScheduler();
    this.taskScheduler.start();
    this.cpuPerf = new CPUPerformance(this.cpu, MHZ);
  }
  execute(callback) {
    const cyclesToRun = this.cpu.cycles + this.workUnitCycles;
    while (this.cpu.cycles < cyclesToRun) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    callback(this.cpu, this.cpuPerf.update());
    this.taskScheduler.postTask(() => this.execute(callback));
  }
  stop() {
    this.taskScheduler.stop();
  }
}

/* ═══════════════════════════════════════════════════════════════
   COMPILER API
   ═══════════════════════════════════════════════════════════════ */

const COMPILE_URL = 'https://hexi.wokwi.com';

async function buildHex(source) {
  const resp = await fetch(`${COMPILE_URL}/build`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sketch: source }),
  });
  return await resp.json();
}

/* ═══════════════════════════════════════════════════════════════
   EXAMPLE SKETCHES
   ═══════════════════════════════════════════════════════════════ */

const EXAMPLES = {
  'Blink': `// Blink LED on pin 13
void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  Serial.println("Blink!");
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}`,

  'Dual LED': `// Alternating LEDs on pins 12 and 13
void setup() {
  Serial.begin(115200);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  Serial.println("LED 13 ON");
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  delay(300);
  Serial.println("LED 12 ON");
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  delay(300);
}`,

  'LED Chase': `// Chase effect across pins 8-13
void setup() {
  Serial.begin(115200);
  for (int i = 8; i <= 13; i++) {
    pinMode(i, OUTPUT);
  }
  Serial.println("LED Chase started!");
}

void loop() {
  for (int i = 8; i <= 13; i++) {
    digitalWrite(i, HIGH);
    delay(100);
    digitalWrite(i, LOW);
  }
  for (int i = 12; i >= 8; i--) {
    digitalWrite(i, HIGH);
    delay(100);
    digitalWrite(i, LOW);
  }
}`,

  'PWM Fade': `// Smooth fade on pin 9 (PWM) and pin 10 (PWM)
void setup() {
  Serial.begin(115200);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  Serial.println("PWM Fade started");
}

void loop() {
  for (int i = 0; i <= 255; i += 5) {
    analogWrite(9, i);
    analogWrite(10, 255 - i);
    delay(20);
  }
  for (int i = 255; i >= 0; i -= 5) {
    analogWrite(9, i);
    analogWrite(10, 255 - i);
    delay(20);
  }
}`,

  'Serial Echo': `// Echo back what you type in Serial
void setup() {
  Serial.begin(115200);
  Serial.println("=== Serial Echo ===");
  Serial.println("Type something and press Enter:");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    Serial.print("Echo: ");
    Serial.println(c);
  }
}`,

  'Counter': `// Simple counter with serial output
unsigned long count = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("Counter started!");
}

void loop() {
  count++;
  Serial.print("Count: ");
  Serial.println(count);
  digitalWrite(LED_BUILTIN, count % 2 == 0);
  delay(1000);
}`,

  'Traffic Light': `// Traffic light simulation on pins 10, 11, 12
// Red=12, Yellow=11, Green=10
void setup() {
  Serial.begin(115200);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(12, OUTPUT);
  Serial.println("Traffic Light Simulation");
}

void loop() {
  // Green
  Serial.println("GREEN - Go");
  digitalWrite(10, HIGH);
  digitalWrite(11, LOW);
  digitalWrite(12, LOW);
  delay(2000);

  // Yellow
  Serial.println("YELLOW - Caution");
  digitalWrite(10, LOW);
  digitalWrite(11, HIGH);
  digitalWrite(12, LOW);
  delay(1000);

  // Red
  Serial.println("RED - Stop");
  digitalWrite(10, LOW);
  digitalWrite(11, LOW);
  digitalWrite(12, HIGH);
  delay(2000);
}`,

  'Binary Counter': `// Binary counter displayed on pins 8-13
void setup() {
  Serial.begin(115200);
  for (int i = 8; i <= 13; i++) {
    pinMode(i, OUTPUT);
  }
  Serial.println("Binary Counter (6-bit)");
}

void loop() {
  for (int num = 0; num < 64; num++) {
    for (int bit = 0; bit < 6; bit++) {
      digitalWrite(8 + bit, (num >> bit) & 1);
    }
    Serial.print("Binary: ");
    for (int bit = 5; bit >= 0; bit--) {
      Serial.print((num >> bit) & 1);
    }
    Serial.print(" = ");
    Serial.println(num);
    delay(500);
  }
}`,
};

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */

const colors = {
  bg: '#0d1117',
  surface: '#161b22',
  surfaceLight: '#1c2333',
  border: '#30363d',
  borderLight: '#484f58',
  text: '#e6edf3',
  textMuted: '#8b949e',
  textDim: '#6e7681',
  accent: '#58a6ff',
  accentGlow: 'rgba(88, 166, 255, 0.3)',
  green: '#3fb950',
  greenGlow: 'rgba(63, 185, 80, 0.4)',
  red: '#f85149',
  redGlow: 'rgba(248, 81, 73, 0.4)',
  yellow: '#d29922',
  yellowGlow: 'rgba(210, 153, 34, 0.4)',
  orange: '#db6d28',
  purple: '#bc8cff',
};

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: colors.bg,
    color: colors.text,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%)`,
    borderBottom: `1px solid ${colors.border}`,
    zIndex: 10,
    minHeight: 48,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: `linear-gradient(90deg, ${colors.accent}, ${colors.purple})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: 0.5,
  },
  logoVersion: {
    fontSize: 11,
    color: colors.textDim,
    marginLeft: 4,
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mainArea: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${colors.border}`,
    minWidth: 0,
  },
  editorToolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    gap: 8,
    background: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    flexWrap: 'wrap',
  },
  editorContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  rightPane: {
    width: 340,
    display: 'flex',
    flexDirection: 'column',
    background: colors.surface,
    overflow: 'hidden',
    flexShrink: 0,
  },
  section: {
    borderBottom: `1px solid ${colors.border}`,
    padding: '12px 14px',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceLight,
    color: colors.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap',
  },
  btnPrimary: {
    background: `linear-gradient(135deg, #238636, #2ea043)`,
    borderColor: '#2ea043',
    color: '#fff',
  },
  btnDanger: {
    background: `linear-gradient(135deg, ${colors.red}, #da3633)`,
    borderColor: colors.red,
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  select: {
    padding: '5px 10px',
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceLight,
    color: colors.text,
    fontSize: 12,
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  },
  ledGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 16px',
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    fontSize: 11,
    color: colors.textMuted,
    gap: 20,
    justifyContent: 'space-between',
    minHeight: 28,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dot: (active, color) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: active ? color : colors.textDim,
    boxShadow: active ? `0 0 6px ${color}` : 'none',
    transition: 'all 0.2s ease',
  }),
  serialContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  serialOutput: {
    flex: 1,
    padding: '8px 12px',
    overflowY: 'auto',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'inherit',
    color: colors.green,
    background: 'rgba(0,0,0,0.3)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  serialInput: {
    display: 'flex',
    borderTop: `1px solid ${colors.border}`,
  },
  serialInputField: {
    flex: 1,
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.4)',
    border: 'none',
    color: colors.text,
    fontSize: 12,
    fontFamily: 'inherit',
    outline: 'none',
  },
  tab: (active) => ({
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? colors.surfaceLight : 'transparent',
    color: active ? colors.text : colors.textMuted,
    borderBottom: active ? `2px solid ${colors.accent}` : '2px solid transparent',
    transition: 'all 0.15s ease',
  }),
  tabBar: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  compilerOutput: {
    flex: 1,
    padding: '8px 12px',
    overflowY: 'auto',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'inherit',
    color: colors.textMuted,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  pinRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 0',
  },
  pinLabel: {
    fontSize: 11,
    color: colors.textMuted,
    width: 32,
    textAlign: 'right',
    fontWeight: 600,
  },
  pinBar: (active) => ({
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: active
      ? `linear-gradient(90deg, ${colors.accent}, ${colors.purple})`
      : colors.border,
    transition: 'all 0.15s ease',
    boxShadow: active ? `0 0 8px ${colors.accentGlow}` : 'none',
  }),
  pinState: (active) => ({
    fontSize: 10,
    fontWeight: 700,
    color: active ? colors.green : colors.textDim,
    width: 28,
  }),
  registerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4px 8px',
    fontSize: 11,
  },
  registerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2px 4px',
    borderRadius: 3,
    background: 'rgba(0,0,0,0.2)',
  },
  regName: {
    color: colors.textMuted,
    fontWeight: 600,
  },
  regVal: {
    color: colors.accent,
    fontFamily: 'inherit',
  },
};

/* ═══════════════════════════════════════════════════════════════
   LED COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const LED_COLORS = {
  green: { on: '#3fb950', glow: 'rgba(63, 185, 80, 0.6)', off: '#1a3a1a' },
  red: { on: '#f85149', glow: 'rgba(248, 81, 73, 0.6)', off: '#3a1a1a' },
  yellow: { on: '#d29922', glow: 'rgba(210, 153, 34, 0.6)', off: '#3a2e1a' },
  blue: { on: '#58a6ff', glow: 'rgba(88, 166, 255, 0.6)', off: '#1a2a3a' },
  orange: { on: '#db6d28', glow: 'rgba(219, 109, 40, 0.6)', off: '#3a261a' },
  purple: { on: '#bc8cff', glow: 'rgba(188, 140, 255, 0.6)', off: '#2a1a3a' },
  white: { on: '#ffffff', glow: 'rgba(255, 255, 255, 0.5)', off: '#2a2a2a' },
  cyan: { on: '#39d2c0', glow: 'rgba(57, 210, 192, 0.6)', off: '#1a3a36' },
};

const LED_COLOR_ORDER = ['green', 'red', 'yellow', 'blue', 'orange', 'purple', 'white', 'cyan'];

function LEDComponent({ on, color = 'green', label }) {
  const c = LED_COLORS[color] || LED_COLORS.green;
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          margin: '0 auto 4px',
          background: on
            ? `radial-gradient(circle at 35% 35%, ${c.on}, ${c.on}88)`
            : c.off,
          boxShadow: on
            ? `0 0 12px ${c.glow}, 0 0 24px ${c.glow}, inset 0 -2px 4px rgba(0,0,0,0.3)`
            : 'inset 0 2px 4px rgba(0,0,0,0.4)',
          border: `2px solid ${on ? c.on + '88' : colors.border}`,
          transition: 'all 0.15s ease',
        }}
      />
      <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PIN VIEWER
   ═══════════════════════════════════════════════════════════════ */

function PinViewer({ pinStates }) {
  return (
    <div>
      {pinStates.map(({ pin, state }) => (
        <div key={pin} style={styles.pinRow}>
          <span style={styles.pinLabel}>D{pin}</span>
          <div style={styles.pinBar(state)} />
          <span style={styles.pinState(state)}>{state ? 'HIGH' : 'LOW'}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGISTER VIEWER
   ═══════════════════════════════════════════════════════════════ */

function RegisterViewer({ cpu }) {
  if (!cpu) return <div style={{ color: colors.textDim, fontSize: 12 }}>No CPU data</div>;
  const regs = [];
  for (let i = 0; i < 32; i++) {
    regs.push({ name: `R${i}`, value: cpu.data[i] || 0 });
  }
  const sp = (cpu.data[0x5e] << 8) | cpu.data[0x5d];
  const sreg = cpu.data[0x5f];
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 6 }}>
          <span><span style={{ color: colors.textMuted }}>PC:</span>{' '}
            <span style={{ color: colors.accent }}>0x{(cpu.pc * 2).toString(16).toUpperCase().padStart(4, '0')}</span>
          </span>
          <span><span style={{ color: colors.textMuted }}>SP:</span>{' '}
            <span style={{ color: colors.accent }}>0x{sp.toString(16).toUpperCase().padStart(4, '0')}</span>
          </span>
          <span><span style={{ color: colors.textMuted }}>SREG:</span>{' '}
            <span style={{ color: colors.accent }}>0x{sreg.toString(16).toUpperCase().padStart(2, '0')}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
          {['I', 'T', 'H', 'S', 'V', 'N', 'Z', 'C'].map((flag, i) => (
            <span
              key={flag}
              style={{
                padding: '1px 5px',
                borderRadius: 3,
                background: (sreg >> (7 - i)) & 1 ? colors.accent + '33' : 'rgba(0,0,0,0.3)',
                color: (sreg >> (7 - i)) & 1 ? colors.accent : colors.textDim,
                fontWeight: 700,
              }}
            >
              {flag}
            </span>
          ))}
        </div>
      </div>
      <div style={styles.registerGrid}>
        {regs.slice(0, 16).map(({ name, value }) => (
          <div key={name} style={styles.registerItem}>
            <span style={styles.regName}>{name}</span>
            <span style={styles.regVal}>{value.toString(16).toUpperCase().padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const [code, setCode] = useState(editorHistory.load() || EXAMPLES['Blink']);
  const [running, setRunning] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compilerOutput, setCompilerOutput] = useState('');
  const [serialOutput, setSerialOutput] = useState('');
  const [serialInput, setSerialInput] = useState('');
  const [simTime, setSimTime] = useState('00:00.000');
  const [cpuSpeed, setCpuSpeed] = useState(0);
  const [activeTab, setActiveTab] = useState('serial');
  const [selectedExample, setSelectedExample] = useState('');
  const [cpuSnapshot, setCpuSnapshot] = useState(null);
  const [rightTab, setRightTab] = useState('hardware');

  const [ledStates, setLedStates] = useState(
    Array.from({ length: 8 }, () => false)
  );
  const [pinStates, setPinStates] = useState(
    Array.from({ length: 14 }, (_, i) => ({ pin: i, state: false }))
  );

  const runnerRef = useRef(null);
  const serialRef = useRef(null);
  const editorRef = useRef(null);

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const updatePinStates = useCallback((runner) => {
    const newLeds = Array.from({ length: 8 }, (_, i) =>
      runner.portB.pinState(i) === PinState.High
    );
    setLedStates(newLeds);

    const pins = [];
    for (let i = 0; i < 8; i++) {
      pins.push({ pin: i, state: runner.portD.pinState(i) === PinState.High });
    }
    for (let i = 0; i < 6; i++) {
      pins.push({ pin: 8 + i, state: runner.portB.pinState(i) === PinState.High });
    }
    setPinStates(pins);
  }, []);

  const stopSimulation = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.stop();
      runnerRef.current = null;
    }
    setRunning(false);
  }, []);

  const runSimulation = useCallback((hex) => {
    const runner = new AVRRunner(hex);
    runnerRef.current = runner;

    runner.portB.addListener(() => updatePinStates(runner));
    runner.portD.addListener(() => updatePinStates(runner));

    runner.usart.onByteTransmit = (value) => {
      setSerialOutput((prev) => prev + String.fromCharCode(value));
    };

    runner.execute((cpu, speed) => {
      const time = formatTime(cpu.cycles / MHZ);
      setSimTime(time);
      setCpuSpeed(speed);
      setCpuSnapshot({
        pc: cpu.pc,
        data: new Uint8Array(cpu.data.slice(0, 256)),
        cycles: cpu.cycles,
      });
    });

    setRunning(true);
  }, [updatePinStates]);

  const handleCompileAndRun = useCallback(async () => {
    stopSimulation();
    setSerialOutput('');
    setCompilerOutput('');
    setCompiling(true);
    setLedStates(Array.from({ length: 8 }, () => false));
    setPinStates(Array.from({ length: 14 }, (_, i) => ({ pin: i, state: false })));

    const currentCode = editorRef.current?.getValue() || code;
    editorHistory.save(currentCode);

    try {
      setCompilerOutput('Compiling...\n');
      const result = await buildHex(currentCode);
      const output = result.stderr || result.stdout || '';
      setCompilerOutput(output);

      if (result.hex) {
        setCompilerOutput(output + '\nCompilation successful! Running...\n');
        setActiveTab('serial');
        runSimulation(result.hex);
      } else {
        setCompilerOutput(output + '\nCompilation failed.\n');
        setActiveTab('compiler');
      }
    } catch (err) {
      setCompilerOutput(`Build error: ${err.message || err}\n`);
      setActiveTab('compiler');
    } finally {
      setCompiling(false);
    }
  }, [code, stopSimulation, runSimulation]);

  const handleStop = useCallback(() => {
    stopSimulation();
  }, [stopSimulation]);

  const handleExampleChange = useCallback((e) => {
    const name = e.target.value;
    setSelectedExample(name);
    if (name && EXAMPLES[name]) {
      const exCode = EXAMPLES[name];
      setCode(exCode);
      editorRef.current?.setValue(exCode);
      editorHistory.save(exCode);
    }
  }, []);

  const handleSerialSend = useCallback(() => {
    if (!serialInput || !runnerRef.current) return;
    for (const ch of serialInput) {
      runnerRef.current.usart.writeByte(ch.charCodeAt(0));
    }
    runnerRef.current.usart.writeByte(10); // newline
    setSerialOutput((prev) => prev + `> ${serialInput}\n`);
    setSerialInput('');
  }, [serialInput]);

  const handleSerialKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSerialSend();
  }, [handleSerialSend]);

  const handleClearSerial = useCallback(() => {
    setSerialOutput('');
  }, []);

  useEffect(() => {
    if (serialRef.current) {
      serialRef.current.scrollTop = serialRef.current.scrollHeight;
    }
  }, [serialOutput]);

  useEffect(() => {
    return () => {
      if (runnerRef.current) runnerRef.current.stop();
    };
  }, []);

  const exampleNames = useMemo(() => Object.keys(EXAMPLES), []);

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>A8</div>
          <span style={styles.logoText}>AVR8js Simulator</span>
          <span style={styles.logoVersion}>v2.0</span>
        </div>
        <div style={styles.headerControls}>
          <button
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              ...(compiling || running ? styles.btnDisabled : {}),
            }}
            onClick={handleCompileAndRun}
            disabled={compiling || running}
          >
            {compiling ? 'Compiling...' : 'Compile & Run'}
          </button>
          <button
            style={{
              ...styles.btn,
              ...styles.btnDanger,
              ...(!running ? styles.btnDisabled : {}),
            }}
            onClick={handleStop}
            disabled={!running}
          >
            Stop
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={styles.mainArea}>
        {/* LEFT: EDITOR */}
        <div style={styles.editorPane}>
          <div style={styles.editorToolbar}>
            <select
              style={styles.select}
              value={selectedExample}
              onChange={handleExampleChange}
            >
              <option value="">-- Load Example --</option>
              {exampleNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: colors.textDim }}>
              Arduino C++ | ATmega328P
            </span>
          </div>
          <div style={styles.editorContainer}>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 8 },
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* BOTTOM TABS: Compiler / Serial */}
          <div style={{ height: 200, display: 'flex', flexDirection: 'column', borderTop: `1px solid ${colors.border}` }}>
            <div style={styles.tabBar}>
              <div style={styles.tab(activeTab === 'serial')} onClick={() => setActiveTab('serial')}>
                Serial Monitor
              </div>
              <div style={styles.tab(activeTab === 'compiler')} onClick={() => setActiveTab('compiler')}>
                Compiler Output
              </div>
              <div style={{ flex: 1 }} />
              {activeTab === 'serial' && (
                <div
                  style={{ ...styles.tab(false), cursor: 'pointer', color: colors.textDim }}
                  onClick={handleClearSerial}
                >
                  Clear
                </div>
              )}
            </div>

            {activeTab === 'serial' ? (
              <div style={styles.serialContainer}>
                <div style={styles.serialOutput} ref={serialRef}>
                  {serialOutput || (
                    <span style={{ color: colors.textDim }}>
                      Serial output will appear here...
                    </span>
                  )}
                </div>
                <div style={styles.serialInput}>
                  <input
                    style={styles.serialInputField}
                    placeholder="Type to send serial data..."
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    onKeyDown={handleSerialKeyDown}
                    disabled={!running}
                  />
                  <button
                    style={{ ...styles.btn, borderRadius: 0, ...((!running) ? styles.btnDisabled : {}) }}
                    onClick={handleSerialSend}
                    disabled={!running}
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.compilerOutput}>
                {compilerOutput || (
                  <span style={{ color: colors.textDim }}>
                    Compiler output will appear here...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE */}
        <div style={styles.rightPane}>
          {/* Right pane tabs */}
          <div style={styles.tabBar}>
            <div style={styles.tab(rightTab === 'hardware')} onClick={() => setRightTab('hardware')}>
              Hardware
            </div>
            <div style={styles.tab(rightTab === 'registers')} onClick={() => setRightTab('registers')}>
              CPU Registers
            </div>
          </div>

          {rightTab === 'hardware' ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* LEDs Section */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span>PORTB LEDs (D8-D13)</span>
                </div>
                <div style={styles.ledGrid}>
                  {ledStates.slice(0, 6).map((on, i) => (
                    <LEDComponent
                      key={i}
                      on={on}
                      color={LED_COLOR_ORDER[i % LED_COLOR_ORDER.length]}
                      label={`D${8 + i}`}
                    />
                  ))}
                </div>
              </div>

              {/* Pin States Section */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span>Digital Pin States</span>
                </div>
                <PinViewer pinStates={pinStates} />
              </div>

              {/* Simulation Info */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span>Simulation Info</span>
                </div>
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>Status</span>
                    <span style={{
                      color: running ? colors.green : colors.textDim,
                      fontWeight: 700,
                    }}>
                      {running ? 'RUNNING' : compiling ? 'COMPILING' : 'STOPPED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>Sim Time</span>
                    <span style={{ color: colors.accent }}>{simTime}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>CPU Speed</span>
                    <span style={{ color: colors.accent }}>{(cpuSpeed * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>Clock</span>
                    <span style={{ color: colors.textMuted }}>16 MHz</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>MCU</span>
                    <span style={{ color: colors.textMuted }}>ATmega328P</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  <span>CPU State</span>
                </div>
                <RegisterViewer cpu={cpuSnapshot} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={styles.statusBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={styles.statusItem}>
            <div style={styles.dot(running, colors.green)} />
            <span>{running ? 'Simulating' : 'Idle'}</span>
          </div>
          <div style={styles.statusItem}>
            <span>Time: {simTime}</span>
          </div>
          <div style={styles.statusItem}>
            <span>Speed: {(cpuSpeed * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>AVR8js Simulator</span>
          <span>ATmega328P @ 16MHz</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOUNT
   ═══════════════════════════════════════════════════════════════ */

const root = createRoot(document.getElementById('root'));
root.render(<App />);
