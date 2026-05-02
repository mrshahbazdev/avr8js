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
  Bookmark, Award, Flame, Compass, Send,
  BarChart3, PieChart, Activity, Wallet,
  QrCode, Scan, ArrowUpDown, Coins,
  Vote, Radio, Mic, Video, Phone,
  Calendar, Tag, Percent, Store,
  Navigation, Lightbulb, Rocket, Crown,
  Gem, Trophy, Target, Ticket,
  Import, Link, Type, PanelRightOpen, PanelRightClose,
  Columns, CopyPlus, RotateCw, Paintbrush, MousePointer,
  Glasses, PanelLeft, ArrowRight, CircleDot, Rows3,
} from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────
const DEFAULT_MODEL = "gemini-2.5-flash-preview-09-2025";
const apiKey = "";
// ───────────────────────────────────────────────────────────────────

// ─── 55 PRESETS ────────────────────────────────────────────────────
const PRESETS = [
  { id: 'splash', emoji: '🚀', label: 'Splash Screen', cat: 'core', prompt: 'Premium splash/loading screen with animated app logo centered, gradient background with brand colors, circular progress indicator at bottom, version number.' },
  { id: 'onboarding1', emoji: '👋', label: 'Onboarding Intro', cat: 'core', prompt: '3-step mobile onboarding with illustration on top half, title + subtitle text, dot indicators, Skip and Next buttons. Step 1: Welcome to app concept.' },
  { id: 'onboarding2', emoji: '📱', label: 'Onboarding Features', cat: 'core', prompt: 'Onboarding step 2 showing key app features with icons grid, brief descriptions, animated transitions feel, Continue button.' },
  { id: 'login', emoji: '🔑', label: 'Login', cat: 'core', prompt: 'Login screen with app logo at top, email and password fields with icons, "Forgot Password?" link, Login button with gradient, "OR" divider, social auth buttons (Google, Apple, Facebook), "Don\'t have account? Sign Up" at bottom.' },
  { id: 'register', emoji: '📝', label: 'Register', cat: 'core', prompt: 'Registration screen with full name, email, phone, password fields, terms checkbox, "Create Account" gradient button, social signup options, "Already have account? Login" link.' },
  { id: 'forgotpass', emoji: '🔒', label: 'Forgot Password', cat: 'core', prompt: 'Forgot password screen with lock icon illustration, instruction text, email input field, "Send Reset Link" button, "Back to Login" link.' },
  { id: 'otp', emoji: '🔢', label: 'OTP Verification', cat: 'core', prompt: 'OTP verification screen with 6-digit code input boxes, timer countdown, "Resend Code" link, phone number display with mask, Verify button.' },
  { id: 'settings', emoji: '⚙️', label: 'Settings', cat: 'core', prompt: 'Settings screen with grouped sections: Account, Privacy, Notifications toggles, Appearance (dark mode), Security, About, Logout button in red.' },
  { id: 'homefeed', emoji: '🏠', label: 'Home Feed', cat: 'social', prompt: 'Social home feed with stories row at top, post cards with user avatar/name/timestamp, post text, image, like/comment/share/bookmark action bar, floating compose FAB.' },
  { id: 'foryou', emoji: '🔥', label: 'For You Feed', cat: 'social', prompt: 'Algorithmic "For You" feed with trending badges, recommended posts, category chips (Trending, Latest, Popular).' },
  { id: 'following', emoji: '👥', label: 'Following Feed', cat: 'social', prompt: 'Following-only feed showing posts from followed accounts, chronological order, pull-to-refresh.' },
  { id: 'profile', emoji: '👤', label: 'My Profile', cat: 'social', prompt: 'User profile with cover photo, avatar, display name, @username, bio, stats row (Posts, Followers, Following), Edit Profile button, tabs (Posts, Media, Likes).' },
  { id: 'otherprofile', emoji: '🧑', label: 'User Profile', cat: 'social', prompt: 'Other user profile with Follow button, message icon, cover photo, avatar, bio, mutual followers, stats, content tabs.' },
  { id: 'editprofile', emoji: '✏️', label: 'Edit Profile', cat: 'social', prompt: 'Edit profile with camera on avatar/cover, fields: Display Name, Username, Bio (char count), Website, Location. Save button.' },
  { id: 'chatlist', emoji: '💬', label: 'Chat List', cat: 'social', prompt: 'Messaging with search bar, conversation list, avatars, last message preview, timestamps, unread badges, online indicators.' },
  { id: 'chatroom', emoji: '🗨️', label: 'Chat Room', cat: 'social', prompt: 'Chat with message bubbles (sent=right, received=left), timestamps, ticks, typing dots, input bar with attachment/emoji/camera/mic/send.' },
  { id: 'discover', emoji: '🔍', label: 'Discover', cat: 'social', prompt: 'Discover with search bar, trending hashtags, "Suggested for You" user cards, trending topics, category grid.' },
  { id: 'findpeople', emoji: '🔎', label: 'Find People', cat: 'social', prompt: 'Find people with search, contact sync, suggested users with Follow button, "Invite Friends" option.' },
  { id: 'notifications', emoji: '🔔', label: 'Notifications', cat: 'social', prompt: 'Notifications with tabs (All, Mentions, Likes, Follows), avatar, action text, timestamp, grouped by Today/Week/Earlier, unread dot.' },
  { id: 'stories', emoji: '📸', label: 'Story Viewer', cat: 'social', prompt: 'Full-screen story viewer with progress bars, user info at top, reply input at bottom, share and like buttons.' },
  { id: 'createpost', emoji: '📝', label: 'Create Post', cat: 'social', prompt: 'Create post with avatar, text area, media attachment bar (Photo, Video, GIF, Poll, Location), character count, Post button.' },
  { id: 'comments', emoji: '💭', label: 'Comments', cat: 'social', prompt: 'Comments thread with nested replies, user avatar/name/timestamp, like button, reply action, input bar at bottom.' },
  { id: 'liveforum', emoji: '📡', label: 'Live Forum', cat: 'social', prompt: 'Live forum with LIVE badge, topic title, real-time messages, participant count, pinned message, reaction emojis.' },
  { id: 'wallet', emoji: '💰', label: 'Crypto Wallet', cat: 'crypto', prompt: 'Crypto wallet with total balance card, 24h change, Send/Receive/Swap/Buy buttons, token list with icons, amounts, sparklines.' },
  { id: 'walletdetail', emoji: '📋', label: 'Token Detail', cat: 'crypto', prompt: 'Token detail with price chart (1H,1D,1W,1M,1Y tabs), current price, 24h stats, Buy/Sell buttons, transaction history.' },
  { id: 'sendcrypto', emoji: '📤', label: 'Send Crypto', cat: 'crypto', prompt: 'Send crypto with recipient address (paste + QR), token selector, amount input with MAX, network fee, Review button.' },
  { id: 'receivecrypto', emoji: '📥', label: 'Receive Crypto', cat: 'crypto', prompt: 'Receive crypto with large QR code, wallet address with copy, token/network selector, Share Address button.' },
  { id: 'swap', emoji: '🔄', label: 'Swap Tokens', cat: 'crypto', prompt: 'Token swap with From/To selectors, amounts, swap arrow, exchange rate, slippage setting, price impact, Swap button.' },
  { id: 'market', emoji: '📊', label: 'Market Overview', cat: 'crypto', prompt: 'Market dashboard with search, sort options, top gainers/losers scroll, coin list with rank, icon, price, 24h change, mini chart.' },
  { id: 'trading', emoji: '📈', label: 'Trading', cat: 'crypto', prompt: 'Trading with candlestick chart, timeframe tabs, Buy/Sell toggle, order type, price/amount inputs, order book depth, Place Order.' },
  { id: 'orderbook', emoji: '📕', label: 'Order Book', cat: 'crypto', prompt: 'Order book with bid/ask columns, volume bars, spread indicator, last trade price, depth chart.' },
  { id: 'portfolio', emoji: '🥧', label: 'Portfolio', cat: 'crypto', prompt: 'Portfolio with donut chart, total value, 24h P&L, asset list with allocation %, performance.' },
  { id: 'nft', emoji: '🖼️', label: 'NFT Gallery', cat: 'crypto', prompt: 'NFT gallery masonry grid, each with name, collection, price in ETH/SOL, creator avatar, filter tabs.' },
  { id: 'nftdetail', emoji: '🎨', label: 'NFT Detail', cat: 'crypto', prompt: 'NFT detail with large image, name, collection, owner/creator, price, Bid/Buy buttons, Properties, Activity tabs.' },
  { id: 'voting', emoji: '🗳️', label: 'Voting/Governance', cat: 'crypto', prompt: 'DAO governance with proposals, status badges, Yes/No vote bars, time remaining, voting power, Vote button.' },
  { id: 'staking', emoji: '🔒', label: 'Staking', cat: 'crypto', prompt: 'Staking with APY, total staked, rewards with claim, Stake/Unstake, amount input, lock periods, validators.' },
  { id: 'defi', emoji: '🏦', label: 'DeFi Dashboard', cat: 'crypto', prompt: 'DeFi dashboard with TVL, yield farming pools, liquidity pools, Supply/Borrow tabs, health factor.' },
  { id: 'txhistory', emoji: '📜', label: 'Transaction History', cat: 'crypto', prompt: 'Transaction history with filter chips, items with type icon, amount, USD value, status badge, date.' },
  { id: 'cryptonews', emoji: '📰', label: 'Crypto News', cat: 'crypto', prompt: 'News feed with featured article banner, news list with thumbnails, category tabs: All, Bitcoin, DeFi, NFT.' },
  { id: 'karma', emoji: '⭐', label: 'Karma/XP', cat: 'gamify', prompt: 'Gamification with level badge, XP bar, karma points, streak, achievement badges grid, daily tasks with rewards.' },
  { id: 'leaderboard', emoji: '🏆', label: 'Leaderboard', cat: 'gamify', prompt: 'Leaderboard with top 3 podium, rank list with avatar/name/XP/level. Tabs: Daily, Weekly, All Time.' },
  { id: 'rewards', emoji: '🎁', label: 'Rewards Store', cat: 'gamify', prompt: 'Rewards store with points balance, redeemable items: NFTs, merch, premium features. Image, title, cost, Redeem.' },
  { id: 'dailytasks', emoji: '✅', label: 'Daily Tasks', cat: 'gamify', prompt: 'Daily tasks with reset timer, task list with icon, description, XP reward, progress, claim button.' },
  { id: 'achievements', emoji: '🏅', label: 'Achievements', cat: 'gamify', prompt: 'Achievements grid with badges, name, progress, rarity (Common/Rare/Epic/Legendary), locked badges grayed.' },
  { id: 'referral', emoji: '🤝', label: 'Referral Program', cat: 'gamify', prompt: 'Referral with code/link, copy and share, rewards earned, tier system, referred users list.' },
  { id: 'shop', emoji: '🛍️', label: 'Shop/Store', cat: 'ecommerce', prompt: 'Shop with search, category chips, featured banner, product grid with image, name, price, rating, Add to Cart.' },
  { id: 'productdetail', emoji: '📦', label: 'Product Detail', cat: 'ecommerce', prompt: 'Product detail with image carousel, name, price, rating, size/color selectors, quantity, Add to Cart, Buy Now.' },
  { id: 'cart', emoji: '🛒', label: 'Shopping Cart', cat: 'ecommerce', prompt: 'Cart with item list (thumbnail, name, price, quantity controls, remove), promo code, price breakdown, Checkout.' },
  { id: 'checkout', emoji: '💳', label: 'Checkout', cat: 'ecommerce', prompt: 'Checkout with steps (Address > Payment > Review), shipping address, payment methods, order summary, Place Order.' },
  { id: 'orders', emoji: '📋', label: 'My Orders', cat: 'ecommerce', prompt: 'Orders with tabs (Active, Completed, Cancelled), order cards with date, ID, thumbnails, status, Track/Reorder.' },
  { id: 'videofeed', emoji: '🎬', label: 'Video Feed', cat: 'media', prompt: 'TikTok-style fullscreen video with user info overlay, action column (like, comment, share, bookmark, sound).' },
  { id: 'livevideo', emoji: '🔴', label: 'Live Stream', cat: 'media', prompt: 'Live stream with video, LIVE badge, viewer count, floating chat, reactions, gift button, comment input.' },
  { id: 'podcast', emoji: '🎙️', label: 'Podcast/Spaces', cat: 'media', prompt: 'Audio spaces with host avatar, co-hosts row, listeners grid, hand raise, mute, leave, topic title.' },
  { id: 'musicplayer', emoji: '🎵', label: 'Music Player', cat: 'media', prompt: 'Music player with album art, song title, artist, progress bar, play/skip controls, volume, like, lyrics.' },
  { id: 'gallery', emoji: '🖼️', label: 'Photo Gallery', cat: 'media', prompt: 'Photo gallery grid (1x1 and 2x1 tiles), select mode, album tabs, upload FAB, action bar for selected.' },
];

const PRESET_CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'core', label: 'Core', icon: Layers },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'crypto', label: 'Crypto', icon: TrendingUp },
  { id: 'gamify', label: 'Gamify', icon: Trophy },
  { id: 'ecommerce', label: 'Shop', icon: ShoppingCart },
  { id: 'media', label: 'Media', icon: Film },
];

const SUGGESTED_SETS = [
  { name: '🚀 TrendUp Complete', desc: 'Full social crypto app', pages: ['Splash Screen','Login','Home Feed','For You Feed','Discover','Chat List','Chat Room','My Profile','Notifications','Crypto Wallet','Market Overview','Trading','NFT Gallery','Voting','Karma XP','Live Forum','Settings'] },
  { name: '💰 Crypto Trading', desc: 'Wallet, trading, portfolio', pages: ['Splash Screen','Login','Crypto Wallet','Token Detail','Send Crypto','Receive Crypto','Swap Tokens','Market Overview','Trading','Order Book','Portfolio','Transaction History','Settings'] },
  { name: '📱 Social Media', desc: 'Instagram/Twitter style', pages: ['Splash Screen','Onboarding Intro','Login','Register','Home Feed','Discover','Create Post','My Profile','Edit Profile','Chat List','Chat Room','Notifications','Story Viewer','Comments','Settings'] },
  { name: '🎮 GameFi', desc: 'Gamified crypto with rewards', pages: ['Splash Screen','Login','Home Feed','Crypto Wallet','Karma XP','Leaderboard','Daily Tasks','Achievements','Rewards Store','Referral Program','NFT Gallery','Settings'] },
  { name: '🛍️ Crypto E-Commerce', desc: 'Shop with crypto payments', pages: ['Splash Screen','Login','Shop Store','Product Detail','Shopping Cart','Checkout','My Orders','Crypto Wallet','My Profile','Settings'] },
];

const THEME_PRESETS = [
  { id: 'trendup', name: 'TrendUp Dark', primary: '#22C55E', bg: '#0F1419', surface: '#1A1F2E', text: '#E5E7EB', font: 'Inter' },
  { id: 'midnight', name: 'Midnight Blue', primary: '#6366F1', bg: '#0A0A1A', surface: '#12122B', text: '#E0E7FF', font: 'Inter' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', bg: '#1A0A00', surface: '#2D1800', text: '#FFF7ED', font: 'Plus Jakarta Sans' },
  { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', bg: '#0A1628', surface: '#0F2340', text: '#E0F2FE', font: 'DM Sans' },
  { id: 'rose', name: 'Rose Gold', primary: '#F43F5E', bg: '#1A0A0F', surface: '#2D1219', text: '#FFE4E6', font: 'Outfit' },
  { id: 'neon', name: 'Neon Green', primary: '#10B981', bg: '#020C07', surface: '#041F14', text: '#D1FAE5', font: 'Space Grotesk' },
  { id: 'light', name: 'Clean White', primary: '#6366F1', bg: '#FFFFFF', surface: '#F3F4F6', text: '#1F2937', font: 'Inter' },
  { id: 'gold', name: 'Crypto Gold', primary: '#FBBF24', bg: '#0F0D08', surface: '#1F1B0E', text: '#FEF3C7', font: 'Montserrat' },
  { id: 'purple', name: 'Deep Purple', primary: '#A855F7', bg: '#0D0515', surface: '#1A0E2E', text: '#F3E8FF', font: 'Outfit' },
  { id: 'coral', name: 'Coral Red', primary: '#EF4444', bg: '#150505', surface: '#2B0E0E', text: '#FEE2E2', font: 'DM Sans' },
];

const DEVICES = [
  { id: 'iphone15', name: 'iPhone 15 Pro', w: 393, h: 852, radius: 55, notch: 'island' },
  { id: 'iphone_se', name: 'iPhone SE', w: 375, h: 667, radius: 40, notch: 'none' },
  { id: 'android', name: 'Android', w: 412, h: 915, radius: 30, notch: 'punch' },
  { id: 'ipad', name: 'iPad Mini', w: 744, h: 1133, radius: 24, notch: 'none' },
];

const SCREEN_STATES = [
  { id: 'default', label: 'Default', icon: '📱' },
  { id: 'empty', label: 'Empty State', icon: '📭', prompt: 'Show the EMPTY STATE version: no data, no items, friendly illustration, "Nothing here yet" message with a CTA button.' },
  { id: 'loading', label: 'Loading', icon: '⏳', prompt: 'Show the LOADING/SKELETON version: shimmer/skeleton placeholders for all content areas, subtle pulse animation feel.' },
  { id: 'error', label: 'Error', icon: '❌', prompt: 'Show the ERROR STATE version: error illustration, "Something went wrong" message, Retry button, support link.' },
];

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────
function buildSystemPrompt(brand, allPages, currentPageName, hasLogo, extraContext) {
  const masterPage = allPages.find(p => p.html);
  const referenceCode = masterPage?.html ? `\nMASTER REFERENCE (Follow EXACT style):\n${masterPage.html.substring(0, 2500)}` : '';
  const existingPages = allPages.map(p => p.name).join(', ');
  const defaultTabs = [
    { icon: 'fa-house', label: 'Home' }, { icon: 'fa-compass', label: 'Discover' },
    { icon: 'fa-wallet', label: 'Wallet' }, { icon: 'fa-comment', label: 'Chat' }, { icon: 'fa-user', label: 'Profile' },
  ];

  return `You are a World-Class Mobile App UI/UX Designer.
Generate a COMPLETE production-ready HTML for "${currentPageName}" mobile screen.
${extraContext || ''}
===== MANDATORY LAYOUT (EVERY SCREEN MUST FOLLOW) =====

PART 1 - FIXED TOP HEADER:
<div style="position:fixed;top:0;left:0;right:0;z-index:50;background:${brand.bg || '#0F1419'};border-bottom:1px solid rgba(255,255,255,0.06);">
  <div style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-size:12px;font-weight:600;color:${brand.text || '#E5E7EB'};">
    <span>9:41</span>
    <div style="display:flex;gap:5px;"><i class="fas fa-signal" style="font-size:12px"></i><i class="fas fa-wifi" style="font-size:12px"></i><i class="fas fa-battery-full" style="font-size:12px"></i></div>
  </div>
  <div style="height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;">
    <div style="display:flex;align-items:center;gap:10px;">
      ${hasLogo ? '<img src="{{APP_LOGO}}" alt="' + brand.name + '" style="height:28px;object-fit:contain;border-radius:6px" />' : ''}
      <span style="font-size:18px;font-weight:800;color:white;">${brand.name}</span>
    </div>
    <div style="display:flex;gap:12px;"><i class="fas fa-bell" style="font-size:18px;color:${brand.text || '#E5E7EB'}80"></i><i class="fas fa-search" style="font-size:18px;color:${brand.text || '#E5E7EB'}80"></i></div>
  </div>
</div>

PART 2 - CONTENT: padding-top:96px; padding-bottom:80px;

PART 3 - FIXED BOTTOM NAV:
<div style="position:fixed;bottom:0;left:0;right:0;z-index:50;background:${brand.bg || '#0F1419'};border-top:1px solid rgba(255,255,255,0.06);height:70px;display:flex;align-items:center;justify-content:space-around;padding-bottom:8px;">
  ${defaultTabs.map((t, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><i class="fas ${t.icon}" style="font-size:20px;color:${i === 0 ? brand.primary : (brand.text || '#E5E7EB') + '50'}"></i><span style="font-size:10px;font-weight:600;color:${i === 0 ? brand.primary : (brand.text || '#E5E7EB') + '50'}">${t.label}</span></div>`).join('\n  ')}
</div>
Highlight tab matching "${currentPageName}" as active (color: ${brand.primary}).
===== END LAYOUT =====

RULES:
- App: ${brand.name}, Accent: ${brand.primary}, BG: ${brand.bg || '#0F1419'}, Surface: ${brand.surface || '#1A1F2E'}, Text: ${brand.text || '#E5E7EB'}, Font: ${brand.font || 'Inter'}
- Dark theme, rounded corners, soft shadows, glassmorphism
- Pages: ${existingPages}
${hasLogo ? '- Logo via {{APP_LOGO}} placeholder in header.' : ''}
- CDNs: tailwindcss@2 CDN, FontAwesome 6.5, Google Font ${brand.font || 'Inter'}
- body: margin:0; font-family:'${brand.font || 'Inter'}',sans-serif; background:${brand.bg || '#0F1419'}; color:${brand.text || '#E5E7EB'};
- Header + bottom nav IDENTICAL on ALL screens. Only content changes.
${referenceCode}
Output ONLY raw HTML. No markdown. No code blocks.`;
}

// ─── HOOKS ─────────────────────────────────────────────────────────
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = ++toastId;
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, addToast: add };
}

function useHistory(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);
  const set = useCallback((val) => { setPast(p => [...p, present]); setPresent(typeof val === 'function' ? val(present) : val); setFuture([]); }, [present]);
  const undo = useCallback(() => { if (!past.length) return; setFuture(p => [present, ...p]); setPresent(past[past.length - 1]); setPast(p => p.slice(0, -1)); }, [past, present]);
  const redo = useCallback(() => { if (!future.length) return; setPast(p => [...p, present]); setPresent(future[0]); setFuture(p => p.slice(1)); }, [future, present]);
  return { value: present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (<div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    {toasts.map(t => (<div key={t.id} className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-xl border ${t.type === 'success' ? 'bg-emerald-600/90 border-emerald-500/30 text-white' : t.type === 'error' ? 'bg-red-600/90 border-red-500/30 text-white' : 'bg-slate-800/90 border-white/10 text-slate-200'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>{t.message}</div>))}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [brand, setBrand] = useState(() => {
    try { const s = localStorage.getItem('v2ui_brand_v5'); if (s) return JSON.parse(s); } catch {}
    return { name: 'TrendUp', logo: '', primary: '#22C55E', bg: '#0F1419', surface: '#1A1F2E', text: '#E5E7EB', font: 'Inter' };
  });

  const pagesHistory = useHistory(() => {
    try { const s = localStorage.getItem('v2ui_pages_v5'); if (s) return JSON.parse(s); } catch {}
    return [{ id: '1', name: 'Home Feed', html: '' }];
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
  const [showThemes, setShowThemes] = useState(false);
  const [genStats, setGenStats] = useState({ count: 0, lastTime: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutoGen, setShowAutoGen] = useState(false);
  const [autoGenRunning, setAutoGenRunning] = useState(false);
  const [autoGenProgress, setAutoGenProgress] = useState({ current: 0, total: 0, currentName: '' });
  const autoGenAbortRef = useRef(false);
  const [logoBase64, setLogoBase64] = useState(() => { try { return localStorage.getItem('v2ui_logo_v5') || ''; } catch { return ''; } });

  // ── NEW ADVANCED STATES ──
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importHtml, setImportHtml] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [prototypeMode, setPrototypeMode] = useState(false);
  const [protoPageIdx, setProtoPageIdx] = useState(0);
  const [multiDeviceView, setMultiDeviceView] = useState(false);
  const [screenState, setScreenState] = useState('default');
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const { toasts, addToast } = useToasts();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Persistence
  useEffect(() => { try { localStorage.setItem('v2ui_brand_v5', JSON.stringify(brand)); } catch {} }, [brand]);
  useEffect(() => { try { localStorage.setItem('v2ui_pages_v5', JSON.stringify(pages)); } catch {} }, [pages]);
  useEffect(() => { try { localStorage.setItem('v2ui_logo_v5', logoBase64); } catch {} }, [logoBase64]);

  const currentPage = pages[activePageIndex] || pages[0];
  const device = DEVICES[activeDevice];
  const filteredPresets = useMemo(() => presetFilter === 'all' ? PRESETS : PRESETS.filter(p => p.cat === presetFilter), [presetFilter]);
  const designedCount = pages.filter(p => p.html).length;

  // ── Smart Logo Injection ──
  const injectLogo = useCallback((html) => {
    if (!logoBase64 || !html) return html;
    const logoImg = `<img src="${logoBase64}" alt="${brand.name}" style="height:28px;width:28px;object-fit:contain;border-radius:6px;" />`;
    let r = html;
    if (r.includes('{{APP_LOGO}}')) return r.replace(/\{\{APP_LOGO\}\}/g, logoBase64);
    const np = new RegExp(`(>)(\\s*)(${brand.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    if (r.match(np)) return r.replace(np, `$1$2${logoImg}&nbsp;$3`);
    const hm = r.match(/(<(?:header|nav)[^>]*>)/i);
    if (hm) return r.replace(hm[0], `${hm[0]}<div style="display:inline-flex;align-items:center;padding:4px 8px;">${logoImg}</div>`);
    if (r.match(/<body[^>]*>/i)) return r.replace(/(<body[^>]*>)/i, `$1<div style="position:fixed;top:8px;left:12px;z-index:9999;background:rgba(0,0,0,0.5);border-radius:10px;padding:4px 10px;display:flex;align-items:center;gap:6px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);">${logoImg}<span style="font-size:11px;font-weight:700;color:white;">${brand.name}</span></div>`);
    return `<div style="position:fixed;top:8px;left:12px;z-index:9999;background:rgba(0,0,0,0.5);border-radius:10px;padding:4px 10px;display:flex;align-items:center;gap:6px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);">${logoImg}<span style="font-size:11px;font-weight:700;color:white;">${brand.name}</span></div>\n` + r;
  }, [logoBase64, brand.name]);

  // ── Handlers ──
  const handleFileUpload = (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => { setImage(URL.createObjectURL(f)); setBase64Image(r.result.split(',')[1]); addToast('Reference image uploaded', 'success'); }; r.readAsDataURL(f); } };

  const handleLogoUpload = (e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 500000) { addToast('Logo too large. Use under 500KB.', 'error'); return; } const r = new FileReader(); r.onloadend = () => { setLogoBase64(r.result); setBrand(p => ({ ...p, logo: r.result })); addToast('Logo uploaded!', 'success'); }; r.readAsDataURL(f); } };

  const handleAddPage = (e) => { e?.preventDefault(); if (newPageName.trim()) { const n = newPageName.trim().replace(/[^a-zA-Z0-9 ]/g, ''); pagesHistory.set([...pages, { id: Date.now().toString(), name: n, html: '' }]); setActivePageIndex(pages.length); setNewPageName(''); setShowAddPageModal(false); addToast(`"${n}" added`, 'success'); } };

  const addSuggestedSet = (set) => { pagesHistory.set(set.pages.map((n, i) => ({ id: (Date.now() + i).toString(), name: n, html: '' }))); setActivePageIndex(0); setShowSuggestions(false); addToast(`Added ${set.pages.length} screens`, 'success'); };

  const deletePage = (i) => { if (pages.length === 1) { addToast('Cannot delete last screen', 'error'); return; } const n = pages[i].name; pagesHistory.set(pages.filter((_, j) => j !== i)); if (activePageIndex >= i && activePageIndex > 0) setActivePageIndex(p => p - 1); addToast(`"${n}" deleted`, 'info'); };

  const duplicatePage = (i) => { const orig = pages[i]; const dup = { id: Date.now().toString(), name: orig.name + ' Copy', html: orig.html }; const np = [...pages]; np.splice(i + 1, 0, dup); pagesHistory.set(np); setActivePageIndex(i + 1); addToast(`"${orig.name}" duplicated`, 'success'); };

  // ── Core AI Generate ──
  const callAI = async (parts, systemPrompt, retries = 0) => {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], systemInstruction: { parts: [{ text: systemPrompt }] } }),
    });
    if (!resp.ok) { if (retries < 2) { await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1500)); return callAI(parts, systemPrompt, retries + 1); } throw new Error(`API ${resp.status}`); }
    const d = await resp.json();
    return (d.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();
  };

  const generatePage = async (retryCount = 0) => {
    setIsLoading(true); const t0 = Date.now();
    const stateInfo = screenState !== 'default' ? SCREEN_STATES.find(s => s.id === screenState) : null;
    const extraCtx = stateInfo ? `\nSCREEN STATE: ${stateInfo.prompt}` : '';
    const parts = [{ text: `Task: Create "${currentPage.name}" screen.\nInstructions: ${prompt || `Design a beautiful ${currentPage.name} screen.`}${extraCtx}` }];
    if (base64Image && inputMode === 'convert') parts.push({ inlineData: { mimeType: 'image/png', data: base64Image } });
    try {
      let html = await callAI(parts, buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64, extraCtx));
      html = injectLogo(html);
      const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html }; pagesHistory.set(upd);
      setPreviewKey(k => k + 1); setActiveTab('preview');
      const s = ((Date.now() - t0) / 1000).toFixed(1); setGenStats(p => ({ count: p.count + 1, lastTime: parseFloat(s) }));
      addToast(`"${currentPage.name}" generated in ${s}s`, 'success');
    } catch { if (retryCount < 3) { addToast(`Retrying (${retryCount + 1}/3)...`, 'info'); setTimeout(() => generatePage(retryCount + 1), 2000); return; } addToast('Generation failed.', 'error'); }
    finally { setIsLoading(false); }
  };

  const refinePage = async () => {
    if (!currentPage.html) { addToast('Generate first, then refine.', 'error'); return; }
    setIsLoading(true);
    try {
      let html = await callAI([{ text: `Current "${currentPage.name}":\n${currentPage.html}\n\nRefine: ${prompt || 'Make more polished and premium.'}` }], buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64));
      html = injectLogo(html);
      const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html }; pagesHistory.set(upd); setPreviewKey(k => k + 1);
      addToast('Refined!', 'success');
    } catch { addToast('Refinement failed.', 'error'); } finally { setIsLoading(false); }
  };

  // ── Auto Generate ──
  const autoGenerateAll = async (set) => {
    const np = set.pages.map((n, i) => ({ id: (Date.now() + i).toString(), name: n, html: '' }));
    pagesHistory.set(np); setShowAutoGen(false); setShowSuggestions(false);
    setAutoGenRunning(true); autoGenAbortRef.current = false;
    setAutoGenProgress({ current: 0, total: np.length, currentName: np[0].name });
    let up = [...np]; const bs = { ...brand }; const ls = logoBase64;
    for (let i = 0; i < up.length; i++) {
      if (autoGenAbortRef.current) { addToast('Stopped.', 'info'); break; }
      setActivePageIndex(i); setAutoGenProgress({ current: i + 1, total: up.length, currentName: up[i].name });
      try {
        const preset = PRESETS.find(p => p.label === up[i].name);
        let html = await callAI([{ text: `Task: Create "${up[i].name}" screen.\nInstructions: ${preset?.prompt || `Design ${up[i].name} screen.`}` }], buildSystemPrompt(bs, up, up[i].name, !!ls));
        html = injectLogo(html);
        up = [...up]; up[i] = { ...up[i], html }; pagesHistory.set(up); setPreviewKey(k => k + 1);
        addToast(`"${up[i].name}" done (${i + 1}/${up.length})`, 'success');
      } catch { addToast(`"${up[i].name}" failed`, 'error'); }
      if (i < up.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    setAutoGenRunning(false); setActivePageIndex(0); setPreviewKey(k => k + 1);
    addToast(`Done! ${up.filter(p => p.html).length}/${up.length} screens ready.`, 'success');
  };

  // ── Batch Regenerate All ──
  const batchRegenerate = async () => {
    setAutoGenRunning(true); autoGenAbortRef.current = false;
    let up = [...pages]; const bs = { ...brand };
    for (let i = 0; i < up.length; i++) {
      if (autoGenAbortRef.current) break;
      setActivePageIndex(i); setAutoGenProgress({ current: i + 1, total: up.length, currentName: up[i].name });
      try {
        const preset = PRESETS.find(p => p.label === up[i].name);
        let html = await callAI([{ text: `Task: Create "${up[i].name}" screen.\nInstructions: ${preset?.prompt || `Design ${up[i].name} screen.`}` }], buildSystemPrompt(bs, up, up[i].name, !!logoBase64));
        html = injectLogo(html);
        up = [...up]; up[i] = { ...up[i], html }; pagesHistory.set(up); setPreviewKey(k => k + 1);
      } catch {}
      if (i < up.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
    setAutoGenRunning(false); addToast('Batch regenerate complete!', 'success');
  };

  // ── AI Chat Refine ──
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentPage.html) return;
    const userMsg = chatInput; setChatInput(''); setChatLoading(true);
    setChatMessages(p => [...p, { role: 'user', text: userMsg }]);
    try {
      let html = await callAI([{ text: `Current "${currentPage.name}" HTML:\n${currentPage.html}\n\nUser request: ${userMsg}\n\nApply the requested change and output the COMPLETE updated HTML.` }], buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64));
      html = injectLogo(html);
      const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html }; pagesHistory.set(upd); setPreviewKey(k => k + 1);
      setChatMessages(p => [...p, { role: 'ai', text: `Done! Applied: "${userMsg}"` }]);
    } catch { setChatMessages(p => [...p, { role: 'ai', text: 'Failed to apply change. Try again.' }]); }
    finally { setChatLoading(false); }
  };

  // ── Import Features ──
  const importFromUrl = async () => {
    if (!importUrl.trim()) return; setIsLoading(true);
    try {
      let html = await callAI([{ text: `I want to match the design style of this website: ${importUrl}\n\nCreate a "${currentPage.name}" screen that matches that website's visual style, colors, typography, and layout patterns.` }], buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64, `\nSTYLE REFERENCE: Match the design of ${importUrl}`));
      html = injectLogo(html);
      const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html }; pagesHistory.set(upd); setPreviewKey(k => k + 1);
      addToast(`Style imported from ${importUrl}`, 'success'); setShowImport(false); setImportUrl('');
    } catch { addToast('Import failed.', 'error'); } finally { setIsLoading(false); }
  };

  const importHtmlCode = () => {
    if (!importHtml.trim()) return;
    const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html: injectLogo(importHtml) }; pagesHistory.set(upd);
    setPreviewKey(k => k + 1); setShowImport(false); setImportHtml(''); addToast('HTML imported!', 'success');
  };

  const importColorPalette = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = async () => {
      setIsLoading(true);
      try {
        const result = await callAI([{ text: 'Extract the dominant color palette from this image. Return ONLY a JSON object: {"primary":"#hex","bg":"#hex","surface":"#hex","text":"#hex"}' }, { inlineData: { mimeType: f.type, data: r.result.split(',')[1] } }], 'You are a color extraction expert. Output ONLY valid JSON.');
        const match = result.match(/\{[^}]+\}/);
        if (match) { const c = JSON.parse(match[0]); setBrand(p => ({ ...p, ...c })); addToast('Palette extracted!', 'success'); }
      } catch { addToast('Could not extract palette.', 'error'); } finally { setIsLoading(false); }
    }; r.readAsDataURL(f);
  };

  // ── Quick Edit (live color/font change) ──
  const applyQuickEdit = (key, val) => {
    setBrand(p => ({ ...p, [key]: val }));
    // Re-inject updated brand colors into existing page HTML via CSS variable override
    if (currentPage?.html) {
      const styleOverride = `<style>:root{--brand-primary:${brand.primary};--brand-bg:${brand.bg};--brand-surface:${brand.surface};}</style>`;
      if (!currentPage.html.includes('--brand-primary')) {
        const upd = [...pages]; upd[activePageIndex] = { ...upd[activePageIndex], html: currentPage.html.replace('</head>', styleOverride + '</head>') }; pagesHistory.set(upd);
      }
    }
  };

  // ── Export ──
  const downloadSingle = () => { if (!currentPage.html) return; const b = new Blob([currentPage.html], { type: 'text/html' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${currentPage.name.replace(/\s+/g, '_')}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); addToast('Downloaded!', 'success'); };

  const downloadAll = () => {
    const h = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${brand.name} Prototype</title><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=${(brand.font||'Inter').replace(/\s+/g,'+')}&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'${brand.font||'Inter'}',sans-serif;background:#050507;color:#fff}.h{padding:50px 20px;text-align:center;border-bottom:1px solid #1a1a1e}.g{display:flex;flex-wrap:wrap;gap:50px;padding:50px;justify-content:center}.d{display:flex;flex-direction:column;align-items:center;gap:16px}.l{font-size:11px;font-weight:800;text-transform:uppercase;color:${brand.primary};letter-spacing:3px}.m{width:393px;height:852px;background:#fff;border:10px solid #1a1a1e;border-radius:55px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6);position:relative}.n{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:126px;height:37px;background:#1a1a1e;border-radius:20px;z-index:10}iframe{width:100%;height:100%;border:none}</style></head><body><div class="h">${logoBase64?`<img src="${logoBase64}" style="height:50px;margin-bottom:16px;object-fit:contain"/>`:''}<h1 style="font-size:36px;font-weight:900">${brand.name}</h1><p style="color:#666;margin-top:8px">${pages.length} Screens Prototype</p></div><div class="g">${pages.filter(p=>p.html).map(p=>`<div class="d"><div class="l">${p.name}</div><div class="m"><div class="n"></div><iframe srcdoc="${p.html.replace(/"/g,'&quot;')}" loading="lazy"></iframe></div></div>`).join('')}</div></body></html>`;
    const b = new Blob([h], { type: 'text/html' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${brand.name.replace(/\s+/g,'_')}_Prototype.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); addToast('Prototype downloaded!', 'success');
  };

  const exportReact = () => {
    const compName = currentPage.name.replace(/\s+/g, '');
    const escaped = (currentPage.html || '').replace(/`/g, String.fromCharCode(92) + '`').replace(/\$/g, String.fromCharCode(92) + '$');
    const code = '// ' + currentPage.name + ' Screen - React Component\nimport React from "react";\n\nexport default function ' + compName + 'Screen() {\n  return (\n    <div dangerouslySetInnerHTML={{ __html: `' + escaped + '` }} />\n  );\n}';
    navigator.clipboard.writeText(code).then(() => addToast('React component copied!', 'success'));
  };

  const copyCode = () => { if (!currentPage?.html) return; navigator.clipboard.writeText(currentPage.html).then(() => { setCopied(true); addToast('Copied!', 'success'); setTimeout(() => setCopied(false), 2000); }); };
  const applyTheme = (t) => { setBrand(p => ({ ...p, primary: t.primary, bg: t.bg, surface: t.surface, text: t.text, font: t.font })); setShowThemes(false); addToast(`"${t.name}" applied`, 'success'); };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey||e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); pagesHistory.undo(); }
      if ((e.ctrlKey||e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); pagesHistory.redo(); }
      if ((e.ctrlKey||e.metaKey) && e.key === 'Enter') { e.preventDefault(); generatePage(); }
      if (e.key === 'Escape') { setIsFullscreen(false); setShowSettings(false); setShowAddPageModal(false); setShowThemes(false); setShowExport(false); setShowSuggestions(false); setShowAutoGen(false); setShowImport(false); setPrototypeMode(false); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [pagesHistory]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // ═════════════════════════════════════════════════════════════════
  // PROTOTYPE MODE
  // ═════════════════════════════════════════════════════════════════
  if (prototypeMode) {
    const pg = pages[protoPageIdx];
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          {pages.filter(p => p.html).map((p, i) => (
            <button key={p.id} onClick={() => setProtoPageIdx(pages.indexOf(p))} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${pages.indexOf(p) === protoPageIdx ? 'bg-white/20 text-white border border-white/20' : 'text-white/40 hover:text-white/60'}`}>{p.name}</button>
          ))}
        </div>
        <button onClick={() => setPrototypeMode(false)} className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/30">Exit Prototype</button>
        <div style={{ width: 393, height: 852, borderRadius: 55, border: '10px solid #1a1a1e', overflow: 'hidden', boxShadow: '0 60px 120px rgba(0,0,0,0.8)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, background: '#1a1a1e', borderRadius: 20, zIndex: 10 }} />
          {pg?.html ? <iframe key={protoPageIdx} srcDoc={pg.html} style={{ width: '100%', height: '100%', border: 'none' }} title="Prototype" /> : <div className="w-full h-full bg-black flex items-center justify-center text-slate-500 text-sm">No design</div>}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <button disabled={protoPageIdx <= 0} onClick={() => setProtoPageIdx(p => p - 1)} className="px-4 py-2 bg-white/10 rounded-xl text-white text-xs font-bold disabled:opacity-20 hover:bg-white/20">← Previous</button>
          <span className="px-4 py-2 text-white/50 text-xs font-bold">{protoPageIdx + 1} / {pages.length}</span>
          <button disabled={protoPageIdx >= pages.length - 1} onClick={() => setProtoPageIdx(p => p + 1)} className="px-4 py-2 bg-white/10 rounded-xl text-white text-xs font-bold disabled:opacity-20 hover:bg-white/20">Next →</button>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // FULLSCREEN
  // ═════════════════════════════════════════════════════════════════
  if (isFullscreen && currentPage?.html) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white border border-white/10"><Minimize2 size={20} /></button>
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          {DEVICES.map((d, i) => (<button key={d.id} onClick={() => setActiveDevice(i)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${activeDevice === i ? 'bg-white/20 text-white border border-white/20' : 'text-white/40'}`}>{d.name}</button>))}
        </div>
        <div style={{ width: device.w, height: device.h, borderRadius: device.radius, border: '10px solid #1a1a1e', overflow: 'hidden', boxShadow: '0 60px 120px rgba(0,0,0,0.8)', position: 'relative' }}>
          {device.notch === 'island' && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, background: '#1a1a1e', borderRadius: 20, zIndex: 10 }} />}
          <iframe key={previewKey} srcDoc={currentPage.html} style={{ width: '100%', height: '100%', border: 'none' }} title="Fullscreen" />
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // MULTI-DEVICE VIEW
  // ═════════════════════════════════════════════════════════════════
  if (multiDeviceView && currentPage?.html) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050507] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Columns size={16} style={{ color: brand.primary }} /> Multi-Device: {currentPage.name}</h2>
          <button onClick={() => setMultiDeviceView(false)} className="px-4 py-1.5 bg-white/5 rounded-lg text-xs text-slate-400 font-bold hover:text-white"><X size={14} /></button>
        </div>
        <div className="flex items-start justify-center gap-8 p-8 overflow-x-auto">
          {DEVICES.map(d => (
            <div key={d.id} className="flex flex-col items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand.primary }}>{d.name}</span>
              <div style={{ width: Math.min(d.w * 0.6, 280), height: Math.min(d.h * 0.6, 520), borderRadius: d.radius * 0.6, border: '6px solid #1a1a1e', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
                {d.notch === 'island' && <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 76, height: 22, background: '#1a1a1e', borderRadius: 12, zIndex: 10 }} />}
                <iframe srcDoc={currentPage.html} style={{ width: d.w, height: d.h, border: 'none', transform: `scale(${Math.min(280/d.w, 520/d.h)})`, transformOrigin: 'top left' }} title={d.name} />
              </div>
            </div>
          ))}
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 flex flex-col font-sans overflow-hidden" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <header className="h-12 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl flex items-center justify-between px-4 z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}99)` }}>
            {logoBase64 ? <img src={logoBase64} alt="" className="w-5 h-5 object-contain" /> : <Smartphone size={16} className="text-white" />}
          </div>
          <div>
            <span className="text-white font-black tracking-tight text-sm">V2UI <span style={{ color: brand.primary }}>Studio</span></span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[7px] font-black border uppercase tracking-widest" style={{ color: brand.primary, borderColor: brand.primary + '30', background: brand.primary + '10' }}>Pro</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => pagesHistory.undo()} disabled={!pagesHistory.canUndo} className="p-1.5 rounded hover:bg-white/5 text-slate-500 disabled:opacity-20" title="Undo"><Undo2 size={14} /></button>
          <button onClick={() => pagesHistory.redo()} disabled={!pagesHistory.canRedo} className="p-1.5 rounded hover:bg-white/5 text-slate-500 disabled:opacity-20" title="Redo"><Redo2 size={14} /></button>
          <div className="w-px h-4 bg-white/5 mx-0.5" />
          <button onClick={() => setShowImport(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Import"><Import size={14} /></button>
          <button onClick={() => setShowSuggestions(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Suggestions"><Lightbulb size={14} /></button>
          <button onClick={() => setShowAutoGen(true)} className="p-1.5 rounded hover:bg-white/5 transition-all" style={{ color: autoGenRunning ? brand.primary : undefined }} title="Auto Generate"><Rocket size={14} className={autoGenRunning ? 'animate-pulse' : ''} /></button>
          <button onClick={() => setShowThemes(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Themes"><Palette size={14} /></button>
          <button onClick={() => setPrototypeMode(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Prototype Mode"><MousePointer size={14} /></button>
          <button onClick={() => setMultiDeviceView(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Multi-Device"><Columns size={14} /></button>
          <button onClick={() => setShowQuickEdit(!showQuickEdit)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Quick Edit"><Paintbrush size={14} /></button>
          <button onClick={() => setShowExport(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500" title="Export"><Download size={14} /></button>
          <button onClick={copyCode} className={`px-3 py-1 rounded text-[9px] font-bold flex items-center gap-1 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
            {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-1.5 rounded hover:bg-white/5 text-slate-500"><Settings size={14} /></button>
        </div>
      </header>

      {/* Quick Edit Bar */}
      {showQuickEdit && (
        <div className="h-10 bg-black/40 border-b border-white/5 flex items-center gap-4 px-4 shrink-0">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quick Edit:</span>
          <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-600">Primary</span><input type="color" value={brand.primary} onChange={e => setBrand(p=>({...p,primary:e.target.value}))} className="w-6 h-6 rounded cursor-pointer border-0" /></div>
          <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-600">BG</span><input type="color" value={brand.bg||'#0F1419'} onChange={e => setBrand(p=>({...p,bg:e.target.value}))} className="w-6 h-6 rounded cursor-pointer border-0" /></div>
          <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-600">Surface</span><input type="color" value={brand.surface||'#1A1F2E'} onChange={e => setBrand(p=>({...p,surface:e.target.value}))} className="w-6 h-6 rounded cursor-pointer border-0" /></div>
          <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-600">Font</span>
            <select value={brand.font||'Inter'} onChange={e => setBrand(p=>({...p,font:e.target.value}))} className="bg-white/5 border border-white/5 rounded px-2 py-0.5 text-[9px] text-white outline-none">
              {['Inter','Plus Jakarta Sans','Outfit','Montserrat','DM Sans','Space Grotesk','Poppins'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={batchRegenerate} disabled={autoGenRunning || designedCount === 0} className="ml-auto px-3 py-1 rounded text-[9px] font-bold flex items-center gap-1 disabled:opacity-30 text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"><RotateCw size={10} /> Batch Regen All</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`${sidebarCollapsed ? 'w-14' : 'w-56'} bg-[#0a0a0c] border-r border-white/5 flex flex-col shrink-0 transition-all duration-200`}>
          <div className="p-2.5 border-b border-white/5 flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-1"><Files size={9} /> {pages.length} Screens</span>}
            <div className="flex gap-0.5">
              {!sidebarCollapsed && <button onClick={() => setShowAddPageModal(true)} className="w-6 h-6 flex items-center justify-center rounded text-white text-xs" style={{ background: brand.primary }}><Plus size={12} /></button>}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 text-slate-600"><ChevronRight size={12} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-px" style={{ scrollbarWidth: 'thin' }}>
            {pages.map((p, i) => (
              <div key={p.id} className="group relative">
                <button onClick={() => { setActivePageIndex(i); setPreviewKey(k => k + 1); }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'} py-2 rounded text-[10px] font-semibold transition-all text-left
                    ${activePageIndex === i ? 'text-white' : 'text-slate-500 hover:bg-white/5'}`}
                  style={activePageIndex === i ? { background: brand.primary + '15', border: `1px solid ${brand.primary}30` } : { border: '1px solid transparent' }} title={p.name}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.html ? '' : 'bg-slate-700'}`} style={p.html ? { background: brand.primary, boxShadow: `0 0 6px ${brand.primary}60` } : {}} />
                    {!sidebarCollapsed && <span className="truncate">{p.name}</span>}
                  </div>
                </button>
                {!sidebarCollapsed && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-px">
                    {p.html && <button onClick={(e) => { e.stopPropagation(); setActivePageIndex(i); setTimeout(() => generatePage(), 50); }} className="p-0.5 text-slate-600 hover:text-amber-400" title="Regenerate"><RefreshCw size={9} /></button>}
                    <button onClick={() => duplicatePage(i)} className="p-0.5 text-slate-600 hover:text-blue-400" title="Duplicate"><CopyPlus size={9} /></button>
                    {pages.length > 1 && <button onClick={() => deletePage(i)} className="p-0.5 text-slate-600 hover:text-red-400" title="Delete"><Trash2 size={9} /></button>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!sidebarCollapsed && (
            <div className="p-2.5 bg-black/40 border-t border-white/5">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5"><Upload size={8} className="inline mr-1" />Logo</div>
              <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-2 p-1.5 rounded bg-white/5 hover:bg-white/8 border border-white/5 transition-all">
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                {logoBase64 ? (<><img src={logoBase64} alt="" className="w-7 h-7 object-contain rounded bg-white/10 p-0.5" /><div className="min-w-0"><p className="text-[9px] font-bold text-slate-300">Logo ready</p><p className="text-[7px] text-slate-600">On all screens</p></div></>) :
                (<><div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-slate-600"><ImageIcon size={12} /></div><p className="text-[9px] text-slate-500">Upload logo</p></>)}
              </button>
            </div>
          )}
        </aside>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toolbar */}
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-black/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-0.5 rounded border border-white/5">
                <button onClick={() => setActiveTab('preview')} className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Eye size={10} /> Preview</button>
                <button onClick={() => setActiveTab('code')} className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Code2 size={10} /> Code</button>
              </div>
              <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><Smartphone size={11} style={{ color: brand.primary }} /> {currentPage?.name}</span>
              {/* Screen State Selector */}
              <select value={screenState} onChange={e => setScreenState(e.target.value)} className="bg-white/5 border border-white/5 rounded px-2 py-0.5 text-[9px] text-slate-400 outline-none">
                {SCREEN_STATES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex bg-white/5 p-0.5 rounded border border-white/5">
                {DEVICES.map((d, i) => (<button key={d.id} onClick={() => setActiveDevice(i)} className={`p-1 rounded ${activeDevice === i ? 'bg-white/10 text-white' : 'text-slate-600'}`} title={d.name}>
                  {d.id === 'ipad' ? <Tablet size={10} /> : d.id === 'android' ? <Monitor size={10} /> : <Smartphone size={10} />}
                </button>))}
              </div>
              {currentPage?.html && (
                <>
                  <button onClick={() => { setPrompt(''); generatePage(); }} disabled={isLoading} className="px-2 py-0.5 rounded hover:bg-amber-500/10 text-amber-400/70 hover:text-amber-400 text-[9px] font-bold flex items-center gap-1 disabled:opacity-30"><RefreshCw size={10} /> Regen</button>
                  <button onClick={() => setIsFullscreen(true)} className="p-1 rounded hover:bg-white/5 text-slate-500"><Maximize2 size={12} /></button>
                </>
              )}
              <button onClick={() => setShowAiChat(!showAiChat)} className={`p-1 rounded hover:bg-white/5 transition-all ${showAiChat ? 'text-white' : 'text-slate-500'}`} style={showAiChat ? { color: brand.primary } : {}} title="AI Chat"><MessageSquare size={12} /></button>
              {genStats.count > 0 && <span className="text-[8px] text-slate-600 font-bold">{genStats.count}gen</span>}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Preview/Code */}
            <div className="flex-1 relative flex items-center justify-center p-5 bg-[#08080a] overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-md">
                  <div className="relative"><div className="w-14 h-14 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: brand.primary }} /><Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={18} style={{ color: brand.primary }} /></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white mt-4 animate-pulse">Generating...</span>
                </div>
              )}
              {activeTab === 'code' ? (
                <div className="w-full h-full bg-[#0a0a0c] rounded-xl overflow-auto border border-white/5">
                  <div className="sticky top-0 bg-[#0a0a0c] border-b border-white/5 px-3 py-1.5 flex items-center justify-between z-10">
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><FileCode size={10} /> {currentPage?.name}.html</span>
                    <span className="text-[8px] text-slate-700">{currentPage?.html ? `${currentPage.html.length.toLocaleString()} chars` : 'Empty'}</span>
                  </div>
                  <pre className="p-4 font-mono text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: brand.primary + 'cc' }}>
                    {currentPage?.html ? currentPage.html.split('\n').map((l, i) => (<div key={i} className="flex"><span className="inline-block w-8 text-right pr-3 text-slate-700 select-none shrink-0 text-[9px]">{i+1}</span><span className="flex-1">{l||' '}</span></div>)) : <span className="text-slate-700 italic">Generate a design first.</span>}
                  </pre>
                </div>
              ) : (
                <div className="transition-all duration-500 relative overflow-hidden bg-white" style={{ width: Math.min(device.w, 420), height: Math.min(device.h, 620), borderRadius: device.radius, border: '8px solid #1a1a1e', boxShadow: `0 30px 60px rgba(0,0,0,0.7)` }}>
                  {device.notch === 'island' && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-[#1a1a1e] rounded-[12px] z-50" />}
                  {device.notch === 'punch' && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1a1a1e] rounded-full z-50" />}
                  {currentPage?.html ? (
                    <iframe key={`${previewKey}-${activePageIndex}-${activeDevice}`} srcDoc={currentPage.html} className="w-full h-full border-none" title="Preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8" style={{ background: brand.bg }}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: brand.primary + '15' }}>
                        {logoBase64 ? <img src={logoBase64} alt="" className="w-8 h-8 object-contain" /> : <Smartphone size={24} style={{ color: brand.primary + '60' }} />}
                      </div>
                      <h3 className="text-sm font-black text-white">Empty Canvas</h3>
                      <p className="text-[9px] mt-1.5 max-w-[180px]" style={{ color: brand.text + '60' }}>Describe "{currentPage?.name}" or pick a preset</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Chat Panel */}
            {showAiChat && (
              <div className="w-72 border-l border-white/5 bg-[#0a0a0c] flex flex-col shrink-0">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5"><MessageSquare size={12} style={{ color: brand.primary }} /> AI Chat</span>
                  <button onClick={() => setShowAiChat(false)} className="text-slate-600 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                  {chatMessages.length === 0 && <p className="text-[10px] text-slate-600 text-center mt-8">Chat with AI to refine your design.<br/><br/>Try: "Make the header bigger", "Change buttons to rounded", "Add more spacing"</p>}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`px-3 py-2 rounded-xl text-[10px] ${m.role === 'user' ? 'ml-4 text-white' : 'mr-4 text-slate-300'}`}
                      style={m.role === 'user' ? { background: brand.primary + '20', border: `1px solid ${brand.primary}30` } : { background: 'rgba(255,255,255,0.05)' }}>
                      {m.text}
                    </div>
                  ))}
                  {chatLoading && <div className="flex items-center gap-2 px-3 py-2"><Loader2 size={12} className="animate-spin" style={{ color: brand.primary }} /><span className="text-[10px] text-slate-500">Applying...</span></div>}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-2.5 border-t border-white/5">
                  <div className="flex gap-1.5">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                      placeholder={currentPage?.html ? "e.g. Make header green..." : "Generate a design first"}
                      disabled={!currentPage?.html || chatLoading}
                      className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none placeholder:text-slate-700 disabled:opacity-30" />
                    <button onClick={sendChatMessage} disabled={!currentPage?.html || chatLoading || !chatInput.trim()} className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: brand.primary, color: 'white' }}><Send size={12} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BUILDER CONTROLS */}
          <div className="p-3 bg-black/40 border-t border-white/5 shrink-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex p-0.5 bg-white/5 rounded border border-white/5 shrink-0">
                  <button onClick={() => setInputMode('prompt')} className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase ${inputMode === 'prompt' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'prompt' ? { background: brand.primary } : {}}>Prompt</button>
                  <button onClick={() => setInputMode('convert')} className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase ${inputMode === 'convert' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'convert' ? { background: brand.primary } : {}}>Vision</button>
                </div>
                <div className="h-3 w-px bg-white/5" />
                <div className="flex gap-0.5 shrink-0">
                  {PRESET_CATEGORIES.map(c => { const I = c.icon; return (<button key={c.id} onClick={() => setPresetFilter(c.id)} className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-0.5 ${presetFilter === c.id ? 'text-white bg-white/10' : 'text-slate-600'}`}><I size={9} /> {c.label}</button>); })}
                </div>
                <div className="h-3 w-px bg-white/5" />
                <div className="flex gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                  {filteredPresets.map(p => (<button key={p.id} onClick={() => setPrompt(p.prompt)} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-bold text-slate-500 hover:text-white transition-all whitespace-nowrap shrink-0">{p.emoji} {p.label}</button>))}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {inputMode === 'convert' && (
                  <button onClick={() => fileInputRef.current?.click()} className={`w-10 h-10 shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center ${image ? 'border-emerald-500/50' : 'border-white/10'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {image ? <img src={image} className="w-7 h-7 object-contain rounded" alt="" /> : <ImageIcon size={16} className="text-slate-600" />}
                  </button>
                )}
                <div className="flex-1 relative">
                  <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generatePage(); } }}
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 pr-[180px] text-xs text-white outline-none placeholder:text-slate-700"
                    placeholder={`Describe "${currentPage?.name}" screen...`} />
                  <div className="absolute right-1 top-1 flex gap-1">
                    {currentPage?.html && <button onClick={refinePage} disabled={isLoading} className="h-8 px-3 rounded text-[9px] font-bold flex items-center gap-1 bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 border border-white/5"><Sparkles size={10} /> Refine</button>}
                    <button onClick={() => generatePage()} disabled={isLoading} className="h-8 px-4 rounded text-[9px] font-bold text-white flex items-center gap-1 disabled:opacity-40 shadow-lg" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}cc)` }}>
                      {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="white" />} Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MODALS ══════ */}

      {/* Add Screen */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/70" onClick={() => setShowAddPageModal(false)} />
          <form onSubmit={handleAddPage} className="w-[400px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus size={18} style={{ color: brand.primary }} /> New Screen</h2>
            <input autoFocus type="text" value={newPageName} onChange={e => setNewPageName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-white text-sm outline-none mb-3" placeholder="Screen name..." />
            <div className="flex flex-wrap gap-1 mb-4">
              {['Home Feed','Profile','Wallet','Chat','Settings','Discover','Notifications','Market','Trading','NFT Gallery','Voting','Staking','Login','Register'].map(n => (
                <button key={n} type="button" onClick={() => setNewPageName(n)} className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-500 hover:text-white">{n}</button>))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddPageModal(false)} className="flex-1 py-2.5 bg-white/5 rounded-lg text-slate-400 font-bold text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-lg text-white font-bold text-xs" style={{ background: brand.primary }}>Add</button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowImport(false)} />
          <div className="w-[500px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-black text-white flex items-center gap-2"><Import size={18} style={{ color: brand.primary }} /> Import</h2><button onClick={() => setShowImport(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><Link size={12} style={{ color: brand.primary }} /> Import Style from URL</h3>
                <p className="text-[9px] text-slate-500 mb-2">Paste any website URL - AI will match its design style</p>
                <div className="flex gap-2">
                  <input value={importUrl} onChange={e => setImportUrl(e.target.value)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="https://example.com" />
                  <button onClick={importFromUrl} disabled={isLoading || !importUrl.trim()} className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-30" style={{ background: brand.primary }}>Import</button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><Code2 size={12} style={{ color: brand.primary }} /> Import HTML Code</h3>
                <p className="text-[9px] text-slate-500 mb-2">Paste HTML code directly into the current screen</p>
                <textarea value={importHtml} onChange={e => setImportHtml(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none h-24 font-mono resize-none" placeholder="<html>..." />
                <button onClick={importHtmlCode} disabled={!importHtml.trim()} className="mt-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-30" style={{ background: brand.primary }}>Import HTML</button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><Palette size={12} style={{ color: brand.primary }} /> Extract Color Palette from Image</h3>
                <p className="text-[9px] text-slate-500 mb-2">Upload any image - AI will extract its color palette</p>
                <label className="px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer inline-block" style={{ background: brand.primary }}>
                  <input type="file" className="hidden" accept="image/*" onChange={importColorPalette} /> Choose Image
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowSuggestions(false)} />
          <div className="w-[520px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-black text-white flex items-center gap-2"><Lightbulb size={18} style={{ color: brand.primary }} /> App Templates</h2><button onClick={() => setShowSuggestions(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>
            <div className="space-y-2.5">{SUGGESTED_SETS.map((s, i) => (
              <button key={i} onClick={() => addSuggestedSet(s)} className="w-full p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-left">
                <div className="flex items-center justify-between mb-1"><h3 className="text-sm font-bold text-white">{s.name}</h3><span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ color: brand.primary, background: brand.primary + '15' }}>{s.pages.length}</span></div>
                <p className="text-[9px] text-slate-500 mb-1.5">{s.desc}</p>
                <div className="flex flex-wrap gap-1">{s.pages.slice(0,8).map(p => <span key={p} className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] text-slate-400 font-bold">{p}</span>)}{s.pages.length > 8 && <span className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] text-slate-500">+{s.pages.length-8}</span>}</div>
              </button>))}
            </div>
          </div>
        </div>
      )}

      {/* Auto Generate */}
      {showAutoGen && !autoGenRunning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowAutoGen(false)} />
          <div className="w-[520px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-black text-white flex items-center gap-2"><Rocket size={18} style={{ color: brand.primary }} /> Auto Generate</h2><button onClick={() => setShowAutoGen(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
              <button onClick={() => logoInputRef.current?.click()} className="w-12 h-12 shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden" style={{ borderColor: logoBase64 ? brand.primary + '50' : 'rgba(255,255,255,0.1)' }}>
                {logoBase64 ? <img src={logoBase64} alt="" className="w-8 h-8 object-contain" /> : <Upload size={18} className="text-slate-600" />}
              </button>
              <div><p className="text-xs font-bold text-white">{logoBase64 ? 'Logo ready' : 'Upload logo'}</p><p className="text-[9px] text-slate-500">{logoBase64 ? 'On every screen' : 'Recommended'}</p></div>
            </div>
            <div className="space-y-2">{SUGGESTED_SETS.map((s, i) => (
              <button key={i} onClick={() => autoGenerateAll(s)} className="w-full p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-left group">
                <div className="flex items-center justify-between mb-1"><h3 className="text-sm font-bold text-white">{s.name}</h3>
                  <div className="flex items-center gap-2"><span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ color: brand.primary, background: brand.primary + '15' }}>{s.pages.length}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100" style={{ background: brand.primary }}><Play size={8} className="inline mr-0.5" />Start</span></div></div>
                <p className="text-[9px] text-slate-500">{s.desc}</p>
              </button>))}
            </div>
          </div>
        </div>
      )}

      {/* Auto Gen Progress */}
      {autoGenRunning && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[999] w-[380px] bg-[#0d0d12] border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" style={{ color: brand.primary }} /><span className="text-xs font-bold text-white">Auto-Generating...</span></div>
            <div className="flex items-center gap-2"><span className="text-[10px] font-bold" style={{ color: brand.primary }}>{autoGenProgress.current}/{autoGenProgress.total}</span>
              <button onClick={() => { autoGenAbortRef.current = true; }} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400">Stop</button></div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-1.5 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(autoGenProgress.current/autoGenProgress.total)*100}%`, background: brand.primary }} /></div>
          <p className="text-[9px] text-slate-500 truncate">Generating: <b className="text-white">{autoGenProgress.currentName}</b></p>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowSettings(false)} />
          <div className="w-[450px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-black text-white flex items-center gap-2"><Settings size={18} style={{ color: brand.primary }} /> Settings</h2><button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>
            <div className="space-y-4">
              <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">App Name</label><input type="text" value={brand.name} onChange={e => setBrand({...brand,name:e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-white text-sm outline-none" /></div>
              <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Logo</label>
                <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/8">
                  {logoBase64 ? (<><img src={logoBase64} alt="" className="w-10 h-10 object-contain rounded bg-white/10 p-1" /><div><p className="text-xs font-bold text-white">Logo uploaded</p><p className="text-[9px] text-slate-500">Click to change</p></div></>) :
                  (<><div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-slate-600"><Upload size={16} /></div><p className="text-xs text-slate-400">Upload logo</p></>)}
                </button>
                {logoBase64 && <button onClick={() => { setLogoBase64(''); setBrand(p=>({...p,logo:''})); }} className="mt-1.5 text-[9px] text-red-400 font-bold">Remove</button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Primary</label><div className="flex items-center gap-2"><input type="color" value={brand.primary} onChange={e=>setBrand({...brand,primary:e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0" /><input type="text" value={brand.primary} onChange={e=>setBrand({...brand,primary:e.target.value})} className="flex-1 bg-white/5 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-mono" /></div></div>
                <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Font</label><select value={brand.font} onChange={e=>setBrand({...brand,font:e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-xs text-white outline-none">{['Inter','Plus Jakarta Sans','Outfit','Montserrat','DM Sans','Space Grotesk','Poppins','Nunito'].map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Background</label><div className="flex items-center gap-2"><input type="color" value={brand.bg||'#0F1419'} onChange={e=>setBrand({...brand,bg:e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0" /><input type="text" value={brand.bg||'#0F1419'} onChange={e=>setBrand({...brand,bg:e.target.value})} className="flex-1 bg-white/5 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-mono" /></div></div>
                <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Surface</label><div className="flex items-center gap-2"><input type="color" value={brand.surface||'#1A1F2E'} onChange={e=>setBrand({...brand,surface:e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0" /><input type="text" value={brand.surface||'#1A1F2E'} onChange={e=>setBrand({...brand,surface:e.target.value})} className="flex-1 bg-white/5 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-mono" /></div></div>
              </div>
            </div>
            <button onClick={() => { setShowSettings(false); addToast('Saved!', 'success'); }} className="w-full mt-5 py-2.5 rounded-lg text-white font-bold text-xs" style={{ background: brand.primary }}>Save</button>
          </div>
        </div>
      )}

      {/* Themes */}
      {showThemes && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowThemes(false)} />
          <div className="w-[480px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-black text-white flex items-center gap-2"><Palette size={18} style={{ color: brand.primary }} /> Themes</h2><button onClick={() => setShowThemes(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>
            <div className="grid grid-cols-2 gap-2.5">{THEME_PRESETS.map(t => (
              <button key={t.id} onClick={() => applyTheme(t)} className="p-3 rounded-xl border border-white/5 hover:border-white/15 text-left" style={{ background: t.bg }}>
                <div className="flex items-center gap-2 mb-1.5"><div className="w-4 h-4 rounded-full" style={{ background: t.primary }} /><span className="text-xs font-bold" style={{ color: t.text }}>{t.name}</span></div>
                <div className="flex gap-1"><div className="w-6 h-3 rounded" style={{ background: t.surface }} /><div className="flex-1 h-3 rounded" style={{ background: t.primary + '30' }} /></div>
              </button>))}
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      {showExport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl"><div className="absolute inset-0 bg-black/80" onClick={() => setShowExport(false)} />
          <div className="w-[400px] bg-[#0d0d12] border border-white/10 rounded-2xl p-6 relative z-10">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-black text-white flex items-center gap-2"><Download size={18} style={{ color: brand.primary }} /> Export</h2><button onClick={() => setShowExport(false)} className="text-slate-500 hover:text-white"><X size={16} /></button></div>
            <div className="space-y-2">
              <button onClick={() => { downloadSingle(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-left disabled:opacity-30 flex items-center gap-3">
                <FileCode size={18} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Current Screen HTML</p><p className="text-[9px] text-slate-500">{currentPage?.name}.html</p></div></button>
              <button onClick={() => { downloadAll(); setShowExport(false); }} disabled={designedCount === 0} className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-left disabled:opacity-30 flex items-center gap-3">
                <Layers size={18} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Full Prototype</p><p className="text-[9px] text-slate-500">{designedCount} screens in mockups</p></div></button>
              <button onClick={() => { exportReact(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-left disabled:opacity-30 flex items-center gap-3">
                <Code2 size={18} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">React Component</p><p className="text-[9px] text-slate-500">Copy as React component</p></div></button>
              <button onClick={() => { copyCode(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-left disabled:opacity-30 flex items-center gap-3">
                <Copy size={18} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Copy HTML</p><p className="text-[9px] text-slate-500">Clipboard</p></div></button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05);border-radius:99px}
        input:focus,select:focus,textarea:focus{border-color:${brand.primary}50 !important}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
