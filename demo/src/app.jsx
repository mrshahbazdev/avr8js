import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Copy, Check, Image as ImageIcon, Loader2,
  Smartphone, MessageSquare,
  RefreshCw, Download, Palette, History, X,
  FileCode, Layout, Zap, Eye,
  Settings, Files, Plus, Trash2, Play, Globe,
  ChevronRight, AlertCircle, Monitor, Tablet,
  Undo2, Redo2, Maximize2, Minimize2, Search,
  Upload, Star, Layers, Wand2, Sparkles,
  Moon, Sun, Bell, Share2, FolderOpen,
  LayoutGrid, Code2, SlidersHorizontal, Cpu,
  Wifi, Battery, Signal, Clock, ChevronDown,
  Hash, TrendingUp, Users, Home, Heart,
  ShoppingCart, User, LogIn, CreditCard,
  Map, Camera, Music, Film, BookOpen,
  Shield, Headphones, Gift, Megaphone,
} from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────
const DEFAULT_MODEL = 'gemini-2.5-flash-preview-09-2025';
const apiKey = '';
// ───────────────────────────────────────────────────────────────────

// ─── PRESETS (TrendUp Social/Crypto Focused + General) ─────────────
const PRESETS = [
  { id: 'splash', emoji: '🚀', label: 'Splash Screen', cat: 'core', prompt: 'Premium splash/loading screen with app logo centered, animated gradient background, subtle loading indicator at bottom.' },
  { id: 'onboarding', emoji: '👋', label: 'Onboarding', cat: 'core', prompt: '3-step mobile onboarding with smooth transitions, crypto/social illustrations, skip button, and dot indicators.' },
  { id: 'login', emoji: '🔑', label: 'Login/Register', cat: 'core', prompt: 'Secure login and registration mobile screen with social auth (Google, Apple), field validation styles, forgot password link, and biometric login option.' },
  { id: 'home', emoji: '🏠', label: 'Home Feed', cat: 'social', prompt: 'Social media home feed with stories row at top, post cards with user avatar/name/timestamp, like/comment/share actions, floating compose button.' },
  { id: 'profile', emoji: '👤', label: 'Profile', cat: 'social', prompt: 'User profile screen with cover photo, avatar, stats (posts/followers/following), bio section, tab bar for posts/media/likes, and edit profile button.' },
  { id: 'chat', emoji: '💬', label: 'Chat', cat: 'social', prompt: 'Chat/messaging screen with conversation list showing avatars, last message preview, timestamps, unread badges, online indicators, and search bar.' },
  { id: 'chatroom', emoji: '🗨️', label: 'Chat Room', cat: 'social', prompt: 'Individual chat room with message bubbles (sent/received), timestamps, typing indicator, attachment options, emoji picker button, and voice message.' },
  { id: 'discover', emoji: '🔍', label: 'Discover/Explore', cat: 'social', prompt: 'Discover/explore screen with search bar, trending hashtags, category chips, featured users grid, and trending posts section.' },
  { id: 'notifications', emoji: '🔔', label: 'Notifications', cat: 'social', prompt: 'Notifications screen with categorized tabs (All/Mentions/Likes), notification items with avatar, action description, timestamp, and unread indicators.' },
  { id: 'wallet', emoji: '💰', label: 'Crypto Wallet', cat: 'crypto', prompt: 'Crypto wallet screen with total balance card, send/receive/swap action buttons, token list with prices and 24h change percentages, mini chart sparklines.' },
  { id: 'market', emoji: '📊', label: 'Market Dashboard', cat: 'crypto', prompt: 'Crypto market dashboard with top movers, price charts, market cap rankings, volume bars, watchlist toggle stars, and search filter.' },
  { id: 'trading', emoji: '📈', label: 'Trading', cat: 'crypto', prompt: 'Trading screen with candlestick chart, buy/sell toggle, order type selector, amount input with max button, order book depth, and recent trades.' },
  { id: 'nft', emoji: '🖼️', label: 'NFT Gallery', cat: 'crypto', prompt: 'NFT gallery/marketplace with grid of NFT cards showing image, name, creator, price in ETH/SOL, buy/bid button, and collection filters.' },
  { id: 'voting', emoji: '🗳️', label: 'Voting/Polls', cat: 'crypto', prompt: 'Governance voting screen with active proposals, vote progress bars (Yes/No), timer countdown, voting power display, and proposal details.' },
  { id: 'staking', emoji: '🔒', label: 'Staking', cat: 'crypto', prompt: 'Staking screen with APY display, staked amount, rewards earned, stake/unstake buttons, lock period selector, and validator list.' },
  { id: 'liveforum', emoji: '📡', label: 'Live Forum', cat: 'social', prompt: 'Live forum/discussion board with topic threads, live indicator, reply count, pinned posts, category tags, and real-time message stream.' },
  { id: 'karma', emoji: '⭐', label: 'Karma/Rewards', cat: 'social', prompt: 'Gamification/karma screen with user level, XP progress bar, achievement badges grid, daily tasks checklist, leaderboard preview, and reward history.' },
  { id: 'settings', emoji: '⚙️', label: 'Settings', cat: 'core', prompt: 'Settings screen with grouped sections (Account, Privacy, Notifications, Appearance, Security), toggle switches, disclosure arrows, and logout button at bottom.' },
  { id: 'videofeed', emoji: '🎬', label: 'Video Feed', cat: 'social', prompt: 'TikTok-style vertical video feed with full-screen video, user info overlay, like/comment/share side buttons, music info at bottom, and swipe indicators.' },
  { id: 'checkout', emoji: '🛒', label: 'Checkout', cat: 'ecommerce', prompt: 'Mobile cart and payment summary with item list, quantity controls, promo code input, payment method cards, and place order button with total.' },
];

const PRESET_CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'core', label: 'Core', icon: Layers },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'crypto', label: 'Crypto', icon: TrendingUp },
  { id: 'ecommerce', label: 'Shop', icon: ShoppingCart },
];

// ─── THEME PRESETS ─────────────────────────────────────────────────
const THEME_PRESETS = [
  { id: 'trendup', name: 'TrendUp Dark', primary: '#22C55E', bg: '#0F1419', surface: '#1A1F2E', text: '#E5E7EB', font: 'Inter' },
  { id: 'midnight', name: 'Midnight Blue', primary: '#6366F1', bg: '#0A0A1A', surface: '#12122B', text: '#E0E7FF', font: 'Inter' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', bg: '#1A0A00', surface: '#2D1800', text: '#FFF7ED', font: 'Plus Jakarta Sans' },
  { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', bg: '#0A1628', surface: '#0F2340', text: '#E0F2FE', font: 'DM Sans' },
  { id: 'rose', name: 'Rose Gold', primary: '#F43F5E', bg: '#1A0A0F', surface: '#2D1219', text: '#FFE4E6', font: 'Outfit' },
  { id: 'neon', name: 'Neon Green', primary: '#10B981', bg: '#020C07', surface: '#041F14', text: '#D1FAE5', font: 'Space Grotesk' },
  { id: 'light', name: 'Clean White', primary: '#6366F1', bg: '#FFFFFF', surface: '#F3F4F6', text: '#1F2937', font: 'Inter' },
  { id: 'gold', name: 'Crypto Gold', primary: '#FBBF24', bg: '#0F0D08', surface: '#1F1B0E', text: '#FEF3C7', font: 'Montserrat' },
];

// ─── DEVICE FRAMES ─────────────────────────────────────────────────
const DEVICES = [
  { id: 'iphone15', name: 'iPhone 15 Pro', w: 393, h: 852, radius: 55, bezel: 0, notch: 'island' },
  { id: 'iphone_se', name: 'iPhone SE', w: 375, h: 667, radius: 40, bezel: 0, notch: 'none' },
  { id: 'android', name: 'Android', w: 412, h: 915, radius: 30, bezel: 0, notch: 'punch' },
  { id: 'ipad', name: 'iPad Mini', w: 744, h: 1133, radius: 24, bezel: 0, notch: 'none' },
];

// ─── SYSTEM PROMPT BUILDER ─────────────────────────────────────────
function buildSystemPrompt(brand, allPages, currentPageName, logoBase64) {
  const masterPage = allPages[0];
  const referenceCode = masterPage && masterPage.html
    ? `\nMASTER REFERENCE STYLE (Follow this EXACT style):\n${masterPage.html.substring(0, 3000)}`
    : '';
  const existingPages = allPages.map(p => p.name).join(', ');

  const logoHtml = logoBase64
    ? `\n6. LOGO: MUST include this logo image at the top/header of every screen: <img src="${logoBase64}" alt="${brand.name} Logo" style="height:36px;object-fit:contain;" />`
    : '';

  return `You are a World-Class Mobile App UI/UX Designer specialized in premium dark-themed social and crypto apps.
Generate a COMPLETE, production-ready HTML string for the "${currentPageName}" mobile screen.

DESIGN REFERENCE: The app style is inspired by trenduplive.com - a dark-themed social Web3 crypto community platform.

STRICT DESIGN RULES:
1. MOBILE FIRST: Optimize for 375x812 viewport. All content must fit mobile width.
2. BRAND IDENTITY:
   - App Name: ${brand.name}
   - Primary Accent: ${brand.primary}
   - Background: ${brand.bg || '#0F1419'}
   - Surface/Cards: ${brand.surface || '#1A1F2E'}
   - Text: ${brand.text || '#E5E7EB'}
   - Font: ${brand.font || 'Inter'}
3. DARK THEME: Deep dark backgrounds (#0F1419), slightly lighter card surfaces (#1A1F2E), green accents for CTAs.
4. CONSISTENCY: ${referenceCode}
5. NAVIGATION: Pages available: ${existingPages}. Use consistent bottom tab bar or navigation pattern across screens.${logoHtml}
7. STYLE GUIDELINES:
   - Rounded corners (rounded-2xl to rounded-3xl)
   - Soft shadows and glassmorphism where appropriate
   - Lucide icons or FontAwesome 6 icons
   - Gradient accents on primary buttons
   - Subtle hover/active states
   - Smooth transitions
   - Status bar area at top (time, signal, battery)
   - Bottom navigation bar with active indicator
8. INCLUDE: Tailwind CSS (CDN), FontAwesome 6 (CDN), Google Font (${brand.font || 'Inter'}).
9. Make it look like a REAL production app - not a wireframe.

Output ONLY the raw HTML string. No markdown code blocks. No explanations.`;
}

// ─── TOAST SYSTEM ──────────────────────────────────────────────────
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, addToast: add };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-xl border animate-in slide-in-from-right duration-300
          ${t.type === 'success' ? 'bg-emerald-600/90 border-emerald-500/30 text-white' :
            t.type === 'error' ? 'bg-red-600/90 border-red-500/30 text-white' :
            'bg-slate-800/90 border-white/10 text-slate-200'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── HISTORY (UNDO/REDO) ──────────────────────────────────────────
function useHistory(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);

  const set = useCallback((val) => {
    setPast(prev => [...prev, present]);
    setPresent(typeof val === 'function' ? val(present) : val);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture(prev => [present, ...prev]);
    setPresent(past[past.length - 1]);
    setPast(prev => prev.slice(0, -1));
  }, [past, present]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast(prev => [...prev, present]);
    setPresent(future[0]);
    setFuture(prev => prev.slice(1));
  }, [future, present]);

  return { value: present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
function App() {
  // ── Brand state ──
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('v2ui_brand_v3');
      return saved ? JSON.parse(saved) : {
        name: 'TrendUp',
        logo: '',
        primary: '#22C55E',
        bg: '#0F1419',
        surface: '#1A1F2E',
        text: '#E5E7EB',
        font: 'Inter',
      };
    } catch { return { name: 'TrendUp', logo: '', primary: '#22C55E', bg: '#0F1419', surface: '#1A1F2E', text: '#E5E7EB', font: 'Inter' }; }
  });

  // ── Pages with history ──
  const pagesHistory = useHistory(() => {
    try {
      const saved = localStorage.getItem('v2ui_pages_v3');
      return saved ? JSON.parse(saved) : [{ id: '1', name: 'Home Feed', html: '' }];
    } catch { return [{ id: '1', name: 'Home Feed', html: '' }]; }
  });
  const pages = typeof pagesHistory.value === 'function' ? pagesHistory.value() : pagesHistory.value;

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [inputMode, setInputMode] = useState('prompt');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeDevice, setActiveDevice] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presetFilter, setPresetFilter] = useState('all');
  const [presetSearch, setPresetSearch] = useState('');
  const [showThemes, setShowThemes] = useState(false);
  const [genStats, setGenStats] = useState({ count: 0, lastTime: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [logoBase64, setLogoBase64] = useState(() => {
    try { return localStorage.getItem('v2ui_logo_v3') || ''; } catch { return ''; }
  });

  const { toasts, addToast } = useToasts();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // ── Persistence ──
  useEffect(() => { try { localStorage.setItem('v2ui_brand_v3', JSON.stringify(brand)); } catch {} }, [brand]);
  useEffect(() => { try { localStorage.setItem('v2ui_pages_v3', JSON.stringify(pages)); } catch {} }, [pages]);
  useEffect(() => { try { localStorage.setItem('v2ui_logo_v3', logoBase64); } catch {} }, [logoBase64]);

  const currentPage = pages[activePageIndex] || pages[0];
  const device = DEVICES[activeDevice];

  // ── Filtered presets ──
  const filteredPresets = useMemo(() => {
    let list = PRESETS;
    if (presetFilter !== 'all') list = list.filter(p => p.cat === presetFilter);
    if (presetSearch) list = list.filter(p => p.label.toLowerCase().includes(presetSearch.toLowerCase()));
    return list;
  }, [presetFilter, presetSearch]);

  // ── Handlers ──
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(URL.createObjectURL(file));
        setBase64Image(reader.result.split(',')[1]);
        addToast('Reference image uploaded', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result;
        setLogoBase64(b64);
        setBrand(prev => ({ ...prev, logo: b64 }));
        addToast('Logo uploaded! It will appear on all generated screens.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPage = (e) => {
    e?.preventDefault();
    if (newPageName.trim()) {
      const cleanName = newPageName.trim().replace(/[^a-zA-Z0-9 ]/g, '');
      const newPage = { id: Date.now().toString(), name: cleanName, html: '' };
      pagesHistory.set([...pages, newPage]);
      setActivePageIndex(pages.length);
      setNewPageName('');
      setShowAddPageModal(false);
      addToast(`"${cleanName}" screen added`, 'success');
    }
  };

  const deletePage = (index) => {
    if (pages.length === 1) { addToast('Cannot delete the last screen', 'error'); return; }
    const name = pages[index].name;
    pagesHistory.set(pages.filter((_, i) => i !== index));
    if (activePageIndex >= index && activePageIndex > 0) setActivePageIndex(prev => prev - 1);
    addToast(`"${name}" deleted`, 'info');
  };

  const generatePage = async (retryCount = 0) => {
    setIsLoading(true);
    const startTime = Date.now();
    const parts = [{ text: `Task: Create the "${currentPage.name}" mobile screen.\nInstructions: ${prompt || `Design a beautiful ${currentPage.name} screen that matches the app style.`}` }];
    if (base64Image && inputMode === 'convert') {
      parts.push({ inlineData: { mimeType: 'image/png', data: base64Image } });
    }

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            systemInstruction: { parts: [{ text: buildSystemPrompt(brand, pages, currentPage.name, logoBase64) }] },
          }),
        }
      );

      if (!resp.ok) throw new Error(`AI Error: ${resp.status}`);

      const data = await resp.json();
      const html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = html.replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();

      const upd = [...pages];
      upd[activePageIndex] = { ...upd[activePageIndex], html: cleaned };
      pagesHistory.set(upd);
      setPreviewKey(k => k + 1);
      setActiveTab('preview');

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setGenStats(prev => ({ count: prev.count + 1, lastTime: parseFloat(elapsed) }));
      addToast(`"${currentPage.name}" generated in ${elapsed}s`, 'success');
    } catch (e) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        addToast(`Retrying... (${retryCount + 1}/3)`, 'info');
        setTimeout(() => generatePage(retryCount + 1), delay);
        return;
      }
      addToast('Generation failed. Check API key and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const refinePage = async () => {
    if (!currentPage.html) { addToast('Generate a design first, then refine it.', 'error'); return; }
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Current HTML of "${currentPage.name}" screen:\n${currentPage.html}\n\nRefine this design with these changes: ${prompt || 'Make it more polished, premium, and production-ready. Improve spacing, colors, and add micro-interactions.'}` }] }],
            systemInstruction: { parts: [{ text: buildSystemPrompt(brand, pages, currentPage.name, logoBase64) }] },
          }),
        }
      );

      if (!resp.ok) throw new Error(`AI Error: ${resp.status}`);
      const data = await resp.json();
      const html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = html.replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();

      const upd = [...pages];
      upd[activePageIndex] = { ...upd[activePageIndex], html: cleaned };
      pagesHistory.set(upd);
      setPreviewKey(k => k + 1);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      addToast(`Refined in ${elapsed}s`, 'success');
    } catch {
      addToast('Refinement failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSinglePage = () => {
    if (!currentPage.html) { addToast('No design to download', 'error'); return; }
    const blob = new Blob([currentPage.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`${currentPage.name}.html downloaded`, 'success');
  };

  const downloadAllPages = () => {
    const combined = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${brand.name} – Full Prototype</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=${brand.font?.replace(/\s+/g, '+') || 'Inter'}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'${brand.font || 'Inter'}',sans-serif;background:#050507;color:#fff;min-height:100vh}
.header{padding:50px 20px;text-align:center;background:linear-gradient(180deg,#111 0%,#050507 100%);border-bottom:1px solid #1a1a1e}
.header h1{font-size:36px;font-weight:900;letter-spacing:-1px}
.header p{color:#666;margin-top:8px;font-size:14px}
.grid{display:flex;flex-wrap:wrap;gap:50px;padding:50px;justify-content:center}
.device-wrap{display:flex;flex-direction:column;align-items:center;gap:16px}
.device-label{font-size:11px;font-weight:800;text-transform:uppercase;color:${brand.primary};letter-spacing:3px}
.mockup{width:393px;height:852px;background:#fff;border:10px solid #1a1a1e;border-radius:55px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6);position:relative}
.island{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:126px;height:37px;background:#1a1a1e;border-radius:20px;z-index:10}
iframe{width:100%;height:100%;border:none}
.footer{text-align:center;padding:40px;color:#333;font-size:11px;border-top:1px solid #111}
</style></head><body>
<div class="header">
${logoBase64 ? `<img src="${logoBase64}" alt="${brand.name}" style="height:50px;margin-bottom:16px;object-fit:contain"/>` : ''}
<h1>${brand.name}</h1>
<p>${pages.length} Screen${pages.length > 1 ? 's' : ''} • Mobile App Prototype</p>
</div>
<div class="grid">
${pages.filter(p => p.html).map(p => `<div class="device-wrap"><div class="device-label">${p.name}</div><div class="mockup"><div class="island"></div><iframe srcdoc="${p.html.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" loading="lazy"></iframe></div></div>`).join('\n')}
</div>
<div class="footer">Built with V2UI • ${brand.name} Prototype</div>
</body></html>`;

    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.name.replace(/\s+/g, '_')}_Prototype.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Full prototype downloaded!', 'success');
  };

  const copyCode = () => {
    if (!currentPage?.html) { addToast('No code to copy', 'error'); return; }
    navigator.clipboard.writeText(currentPage.html).then(() => {
      setCopied(true);
      addToast('HTML copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = currentPage.html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const applyTheme = (theme) => {
    setBrand(prev => ({
      ...prev,
      primary: theme.primary,
      bg: theme.bg,
      surface: theme.surface,
      text: theme.text,
      font: theme.font,
    }));
    setShowThemes(false);
    addToast(`Applied "${theme.name}" theme`, 'success');
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); pagesHistory.undo(); addToast('Undo', 'info'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); pagesHistory.redo(); addToast('Redo', 'info'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); generatePage(); }
      if (e.key === 'Escape') { setIsFullscreen(false); setShowSettings(false); setShowAddPageModal(false); setShowThemes(false); setShowExport(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pagesHistory]);

  // ── Counts ──
  const designedCount = pages.filter(p => p.html).length;

  // ═════════════════════════════════════════════════════════════════
  // FULLSCREEN PREVIEW
  // ═════════════════════════════════════════════════════════════════
  if (isFullscreen && currentPage?.html) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-xl border border-white/10">
          <Minimize2 size={20} />
        </button>
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          {DEVICES.map((d, i) => (
            <button key={d.id} onClick={() => setActiveDevice(i)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeDevice === i ? 'bg-white/20 text-white border border-white/20' : 'text-white/40 hover:text-white/60'}`}>
              {d.name}
            </button>
          ))}
        </div>
        <div style={{ width: device.w, height: device.h, borderRadius: device.radius, border: '10px solid #1a1a1e', overflow: 'hidden', boxShadow: '0 60px 120px rgba(0,0,0,0.8)' }}>
          {device.notch === 'island' && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, background: '#1a1a1e', borderRadius: 20, zIndex: 10 }} />}
          <iframe key={previewKey} srcDoc={currentPage.html} style={{ width: '100%', height: '100%', border: 'none' }} title="Fullscreen Preview" />
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 flex flex-col font-sans overflow-hidden" style={{ fontFamily: `'Inter', system-ui, sans-serif` }}>
      <ToastContainer toasts={toasts} />

      {/* ══════ HEADER ══════ */}
      <header className="h-14 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl flex items-center justify-between px-5 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}99)` }}>
            {logoBase64 ? (
              <img src={logoBase64} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Smartphone size={18} className="text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black tracking-tight text-[15px]">V2UI <span style={{ color: brand.primary }}>Studio</span></span>
              <span className="px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-widest" style={{ color: brand.primary, borderColor: brand.primary + '30', background: brand.primary + '10' }}>Pro</span>
            </div>
            <p className="text-[9px] text-slate-600 font-bold tracking-wide mt-0.5">{brand.name} • {designedCount}/{pages.length} screens</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { pagesHistory.undo(); }} disabled={!pagesHistory.canUndo} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-20 transition-all" title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
          <button onClick={() => { pagesHistory.redo(); }} disabled={!pagesHistory.canRedo} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-20 transition-all" title="Redo (Ctrl+Shift+Z)"><Redo2 size={15} /></button>
          <div className="w-px h-5 bg-white/5 mx-1" />
          <button onClick={() => setShowThemes(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Theme Presets"><Palette size={15} /></button>
          <button onClick={() => setShowExport(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all flex items-center gap-1.5 text-[10px] font-bold" title="Export"><Download size={15} /></button>
          <button onClick={copyCode} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all"><Settings size={15} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ══════ SIDEBAR ══════ */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-[#0a0a0c] border-r border-white/5 flex flex-col shrink-0 transition-all duration-300`}>
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-1.5">
                <Files size={10} /> Screens ({pages.length})
              </span>
            )}
            <div className="flex gap-1">
              {!sidebarCollapsed && (
                <button onClick={() => setShowAddPageModal(true)} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-95 text-white" style={{ background: brand.primary }} title="Add Screen">
                  <Plus size={14} />
                </button>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-600 transition-all">
                <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5 scrollbar-thin">
            {pages.map((p, i) => (
              <div key={p.id} className="group relative">
                <button
                  onClick={() => { setActivePageIndex(i); setPreviewKey(k => k + 1); }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-lg text-[11px] font-semibold transition-all text-left
                    ${activePageIndex === i ? 'text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                  style={activePageIndex === i ? { background: brand.primary + '15', border: `1px solid ${brand.primary}30` } : { border: '1px solid transparent' }}
                  title={p.name}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.html ? '' : 'bg-slate-700'}`} style={p.html ? { background: brand.primary, boxShadow: `0 0 6px ${brand.primary}60` } : {}} />
                    {!sidebarCollapsed && <span className="truncate">{p.name}</span>}
                  </div>
                  {!sidebarCollapsed && activePageIndex === i && <ChevronRight size={11} className="shrink-0 opacity-60" />}
                </button>
                {!sidebarCollapsed && pages.length > 1 && (
                  <button onClick={() => deletePage(i)} className="absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all rounded">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            {sidebarCollapsed && (
              <button onClick={() => setShowAddPageModal(true)} className="w-full flex justify-center py-2.5 text-slate-600 hover:text-white transition-all">
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Logo Upload Section */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-black/40 border-t border-white/5">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Upload size={9} /> App Logo
              </div>
              <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/5 transition-all group">
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                {logoBase64 ? (
                  <>
                    <img src={logoBase64} alt="Logo" className="w-8 h-8 object-contain rounded-md bg-white/10 p-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-300 truncate">Logo uploaded</p>
                      <p className="text-[8px] text-slate-600">Shown on all screens</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-slate-400">
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">Upload logo</p>
                      <p className="text-[8px] text-slate-700">Shows on all pages</p>
                    </div>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-md border border-white/10 shadow-sm" style={{ background: brand.primary }} />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 truncate">{brand.font}</p>
                  <p className="text-[8px] text-slate-700 truncate">{brand.name}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ══════ MAIN WORKSPACE ══════ */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Workspace toolbar */}
          <div className="h-11 border-b border-white/5 flex items-center justify-between px-5 bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Eye size={11} /> Preview
                </button>
                <button onClick={() => setActiveTab('code')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Code2 size={11} /> Code
                </button>
              </div>

              <div className="h-4 w-px bg-white/5" />
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                <Smartphone size={12} style={{ color: brand.primary }} /> {currentPage?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Device switcher */}
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                {DEVICES.map((d, i) => (
                  <button key={d.id} onClick={() => setActiveDevice(i)} className={`p-1.5 rounded-md transition-all ${activeDevice === i ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`} title={d.name}>
                    {d.id === 'ipad' ? <Tablet size={12} /> : d.id === 'android' ? <Monitor size={12} /> : <Smartphone size={12} />}
                  </button>
                ))}
              </div>

              {currentPage?.html && (
                <>
                  <button onClick={() => setIsFullscreen(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Fullscreen (Esc to exit)">
                    <Maximize2 size={13} />
                  </button>
                  <button onClick={() => setPreviewKey(k => k + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Refresh Preview">
                    <RefreshCw size={13} />
                  </button>
                </>
              )}

              {genStats.count > 0 && (
                <span className="text-[9px] text-slate-600 font-bold ml-1">{genStats.count} gen{genStats.count > 1 ? 's' : ''} • {genStats.lastTime}s</span>
              )}
            </div>
          </div>

          {/* Preview / Code Area */}
          <div className="flex-1 relative flex items-center justify-center p-6 bg-[#08080a] overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-md">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: brand.primary }} />
                  <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={20} style={{ color: brand.primary }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white mt-5 animate-pulse">Generating Design...</span>
                <span className="text-[9px] text-slate-600 mt-1">Powered by Gemini AI</span>
              </div>
            )}

            {activeTab === 'code' ? (
              <div className="w-full h-full bg-[#0a0a0c] rounded-2xl overflow-auto border border-white/5 relative">
                <div className="sticky top-0 bg-[#0a0a0c] border-b border-white/5 px-4 py-2 flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><FileCode size={11} /> {currentPage?.name}.html</span>
                  <span className="text-[9px] text-slate-700">{currentPage?.html ? `${currentPage.html.length.toLocaleString()} chars` : 'Empty'}</span>
                </div>
                <pre className="p-5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: brand.primary + 'cc' }}>
                  {currentPage?.html ? currentPage.html.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="inline-block w-10 text-right pr-4 text-slate-700 select-none shrink-0 text-[10px]">{i + 1}</span>
                      <span className="flex-1">{line || ' '}</span>
                    </div>
                  )) : <span className="text-slate-700 italic">No code yet. Generate a design first.</span>}
                </pre>
              </div>
            ) : (
              <div
                className="transition-all duration-500 relative overflow-hidden bg-white"
                style={{
                  width: Math.min(device.w, 500),
                  height: Math.min(device.h, 680),
                  borderRadius: device.radius,
                  border: '10px solid #1a1a1e',
                  boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)`,
                }}
              >
                {device.notch === 'island' && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#1a1a1e] rounded-[14px] z-50 flex items-center justify-center">
                    <div className="w-8 h-[3px] bg-slate-800 rounded-full" />
                  </div>
                )}
                {device.notch === 'punch' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1e] rounded-full z-50" />
                )}

                {currentPage?.html ? (
                  <iframe key={`${previewKey}-${activePageIndex}-${activeDevice}`} srcDoc={currentPage.html} className="w-full h-full border-none" title="Preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-10" style={{ background: brand.bg }}>
                    <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5" style={{ background: brand.primary + '15' }}>
                      {logoBase64 ? (
                        <img src={logoBase64} alt="Logo" className="w-10 h-10 object-contain" />
                      ) : (
                        <Smartphone size={30} style={{ color: brand.primary + '60' }} />
                      )}
                    </div>
                    <h3 className="text-base font-black text-white italic tracking-tight">Empty Canvas</h3>
                    <p className="text-[10px] mt-2 max-w-[200px] leading-relaxed font-semibold" style={{ color: brand.text + '60' }}>
                      Describe what "{currentPage?.name}" should look like
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════ BUILDER CONTROLS ══════ */}
          <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl shrink-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {/* Mode + Category + Presets */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/5 shrink-0">
                  <button onClick={() => setInputMode('prompt')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${inputMode === 'prompt' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'prompt' ? { background: brand.primary } : {}}>Prompt</button>
                  <button onClick={() => setInputMode('convert')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${inputMode === 'convert' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'convert' ? { background: brand.primary } : {}}>Vision</button>
                </div>

                <div className="h-4 w-px bg-white/5" />

                {/* Category filters */}
                <div className="flex gap-1 shrink-0">
                  {PRESET_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setPresetFilter(cat.id)} className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all flex items-center gap-1 ${presetFilter === cat.id ? 'text-white bg-white/10' : 'text-slate-600 hover:text-slate-400'}`}>
                        <Icon size={10} /> {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div className="h-4 w-px bg-white/5" />

                {/* Preset pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
                  {filteredPresets.map(p => (
                    <button key={p.id} onClick={() => setPrompt(p.prompt)} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-white hover:border-white/10 transition-all whitespace-nowrap shrink-0">
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input row */}
              <div className="flex gap-3 items-center">
                {inputMode === 'convert' && (
                  <button onClick={() => fileInputRef.current?.click()} className={`w-12 h-12 shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {image ? <img src={image} className="w-8 h-8 object-contain rounded" alt="Ref" /> : <ImageIcon size={18} className="text-slate-600" />}
                  </button>
                )}

                <div className="flex-1 relative">
                  <input
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generatePage(); } }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 pr-[200px] text-sm text-white outline-none transition-all placeholder:text-slate-700"
                    style={{ '--tw-ring-color': brand.primary }}
                    placeholder={`Describe the "${currentPage?.name}" screen design...`}
                  />
                  <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                    {currentPage?.html && (
                      <button onClick={refinePage} disabled={isLoading} className="h-9 px-4 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 border border-white/5">
                        <Sparkles size={11} /> Refine
                      </button>
                    )}
                    <button onClick={() => generatePage()} disabled={isLoading} className="h-9 px-5 rounded-lg text-[10px] uppercase font-bold tracking-wider text-white transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-lg" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}cc)`, boxShadow: `0 4px 15px ${brand.primary}30` }}>
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="white" />} Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="flex items-center justify-center gap-4 text-[9px] text-slate-700">
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Enter</kbd> Generate</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Z</kbd> Undo</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         MODALS
         ══════════════════════════════════════════════════════════════ */}

      {/* Add Screen Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddPageModal(false)} />
          <form onSubmit={handleAddPage} className="w-[420px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: brand.primary + '20', color: brand.primary }}><Plus size={22} /></div>
              <div>
                <h2 className="text-lg font-black text-white leading-none">New Screen</h2>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Add to your mobile app structure</p>
              </div>
            </div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Screen Name</label>
            <input autoFocus type="text" value={newPageName} onChange={e => setNewPageName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-white/20 transition-all" placeholder="e.g. Profile, Wallet, Chat..." />

            {/* Quick add buttons */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['Home', 'Profile', 'Wallet', 'Chat', 'Settings', 'Discover', 'Notifications', 'Market'].map(name => (
                <button key={name} type="button" onClick={() => setNewPageName(name)} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-white transition-all">{name}</button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowAddPageModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-400 font-bold text-xs hover:bg-white/10 transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold text-xs transition-all active:scale-95 shadow-lg" style={{ background: brand.primary, boxShadow: `0 4px 15px ${brand.primary}30` }}>Add Screen</button>
            </div>
          </form>
        </div>
      )}

      {/* Brand Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettings(false)} />
          <div className="w-[480px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2.5"><Settings size={20} style={{ color: brand.primary }} /> Project Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">App Name</label>
                <input type="text" value={brand.name} onChange={e => setBrand({ ...brand, name: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-white/20" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">App Logo</label>
                <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/8 transition-all">
                  {logoBase64 ? (
                    <>
                      <img src={logoBase64} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1" />
                      <div>
                        <p className="text-xs font-bold text-white">Logo uploaded</p>
                        <p className="text-[10px] text-slate-500">Click to change • Shows on all screens</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-slate-600"><Upload size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">Upload your logo</p>
                        <p className="text-[10px] text-slate-600">Will appear on every generated screen</p>
                      </div>
                    </>
                  )}
                </button>
                {logoBase64 && (
                  <button onClick={() => { setLogoBase64(''); setBrand(prev => ({ ...prev, logo: '' })); addToast('Logo removed', 'info'); }} className="mt-2 text-[10px] text-red-400 hover:text-red-300 font-bold">Remove logo</button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.primary} onChange={e => setBrand({ ...brand, primary: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                    <input type="text" value={brand.primary} onChange={e => setBrand({ ...brand, primary: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Font</label>
                  <select value={brand.font} onChange={e => setBrand({ ...brand, font: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none">
                    {['Inter', 'Plus Jakarta Sans', 'Outfit', 'Montserrat', 'DM Sans', 'Space Grotesk', 'Poppins', 'Nunito'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.bg || '#0F1419'} onChange={e => setBrand({ ...brand, bg: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                    <input type="text" value={brand.bg || '#0F1419'} onChange={e => setBrand({ ...brand, bg: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Surface</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.surface || '#1A1F2E'} onChange={e => setBrand({ ...brand, surface: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                    <input type="text" value={brand.surface || '#1A1F2E'} onChange={e => setBrand({ ...brand, surface: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">AI Model</label>
                <input type="text" value={DEFAULT_MODEL} readOnly className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-slate-400 font-mono" />
              </div>
            </div>

            <button onClick={() => { setShowSettings(false); addToast('Settings saved', 'success'); }} className="w-full mt-6 py-3 rounded-xl text-white font-bold text-xs transition-all active:scale-[0.98] shadow-lg" style={{ background: brand.primary, boxShadow: `0 4px 15px ${brand.primary}30` }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Theme Presets Modal */}
      {showThemes && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowThemes(false)} />
          <div className="w-[500px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2.5"><Palette size={18} style={{ color: brand.primary }} /> Theme Presets</h2>
              <button onClick={() => setShowThemes(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEME_PRESETS.map(theme => (
                <button key={theme.id} onClick={() => applyTheme(theme)} className="p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all text-left group" style={{ background: theme.bg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: theme.primary }} />
                    <span className="text-xs font-bold" style={{ color: theme.text }}>{theme.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-8 h-4 rounded" style={{ background: theme.surface }} />
                    <div className="flex-1 h-4 rounded" style={{ background: theme.primary + '30' }} />
                  </div>
                  <p className="text-[9px] mt-2 font-semibold" style={{ color: theme.text + '60' }}>{theme.font}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowExport(false)} />
          <div className="w-[420px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2.5"><Download size={18} style={{ color: brand.primary }} /> Export</h2>
              <button onClick={() => setShowExport(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { downloadSinglePage(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left disabled:opacity-30 flex items-center gap-3">
                <FileCode size={20} style={{ color: brand.primary }} />
                <div>
                  <p className="text-xs font-bold text-white">Current Screen HTML</p>
                  <p className="text-[10px] text-slate-500">Download {currentPage?.name}.html</p>
                </div>
              </button>
              <button onClick={() => { downloadAllPages(); setShowExport(false); }} disabled={designedCount === 0} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left disabled:opacity-30 flex items-center gap-3">
                <Layers size={20} style={{ color: brand.primary }} />
                <div>
                  <p className="text-xs font-bold text-white">Full Prototype</p>
                  <p className="text-[10px] text-slate-500">All {designedCount} screens in device mockups</p>
                </div>
              </button>
              <button onClick={() => { copyCode(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left disabled:opacity-30 flex items-center gap-3">
                <Copy size={20} style={{ color: brand.primary }} />
                <div>
                  <p className="text-xs font-bold text-white">Copy HTML to Clipboard</p>
                  <p className="text-[10px] text-slate-500">Paste anywhere you need</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        input:focus, select:focus { border-color: ${brand.primary}50 !important; }
        @keyframes slide-in-from-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-in { animation: slide-in-from-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════════════════
const root = createRoot(document.getElementById('root'));
root.render(<App />);
