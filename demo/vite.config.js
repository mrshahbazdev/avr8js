import { join } from 'path';
import react from '@vitejs/plugin-react';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  base: '',
  plugins: [react()],
  resolve: {
    alias: { avr8js: join(__dirname, '../src') },
  },
  server: {
    open: true,
  },
};

export default config;
