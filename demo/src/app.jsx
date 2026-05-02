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
} from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────
const DEFAULT_MODEL = "gemini-2.5-flash-preview-09-2025";
const apiKey = ""; // Gemini Canvas automatic handle karega
// ───────────────────────────────────────────────────────────────────

// ─── 55 PRESETS ────────────────────────────────────────────────────
const PRESETS = [
  // ── CORE (8) ──
  { id: 'splash', emoji: '🚀', label: 'Splash Screen', cat: 'core', prompt: 'Premium splash/loading screen with animated app logo centered, gradient background with brand colors, circular progress indicator at bottom, version number.' },
  { id: 'onboarding1', emoji: '👋', label: 'Onboarding Intro', cat: 'core', prompt: '3-step mobile onboarding with illustration on top half, title + subtitle text, dot indicators, Skip and Next buttons. Step 1: Welcome to app concept.' },
  { id: 'onboarding2', emoji: '📱', label: 'Onboarding Features', cat: 'core', prompt: 'Onboarding step 2 showing key app features with icons grid, brief descriptions, animated transitions feel, Continue button.' },
  { id: 'login', emoji: '🔑', label: 'Login', cat: 'core', prompt: 'Login screen with app logo at top, email and password fields with icons, "Forgot Password?" link, Login button with gradient, "OR" divider, social auth buttons (Google, Apple, Facebook), "Don\'t have account? Sign Up" at bottom.' },
  { id: 'register', emoji: '📝', label: 'Register', cat: 'core', prompt: 'Registration screen with full name, email, phone, password fields, terms checkbox, "Create Account" gradient button, social signup options, "Already have account? Login" link.' },
  { id: 'forgotpass', emoji: '🔒', label: 'Forgot Password', cat: 'core', prompt: 'Forgot password screen with lock icon illustration, instruction text, email input field, "Send Reset Link" button, "Back to Login" link.' },
  { id: 'otp', emoji: '🔢', label: 'OTP Verification', cat: 'core', prompt: 'OTP verification screen with 6-digit code input boxes, timer countdown, "Resend Code" link, phone number display with mask, Verify button.' },
  { id: 'settings', emoji: '⚙️', label: 'Settings', cat: 'core', prompt: 'Settings screen with grouped sections: Account (profile, email, phone), Privacy (2FA, blocked users), Notifications (push, email toggles), Appearance (dark mode, font size), Security (change password, biometrics), About, Logout button at bottom in red.' },

  // ── SOCIAL (15) ──
  { id: 'homefeed', emoji: '🏠', label: 'Home Feed', cat: 'social', prompt: 'Social home feed with stories row at top (circular avatars with gradient border, "Your Story" first), post cards with user avatar/name/timestamp, post text, image, like/comment/share/bookmark action bar with counts, floating compose FAB button.' },
  { id: 'foryou', emoji: '🔥', label: 'For You Feed', cat: 'social', prompt: 'Algorithmic "For You" feed with trending indicator badges, recommended posts, engagement metrics, category chips at top (Trending, Latest, Popular), infinite scroll style.' },
  { id: 'following', emoji: '👥', label: 'Following Feed', cat: 'social', prompt: 'Following-only feed showing posts from followed accounts, chronological order, with "No new posts" empty state option, pull-to-refresh indicator.' },
  { id: 'profile', emoji: '👤', label: 'My Profile', cat: 'social', prompt: 'User profile with cover photo, circular avatar with edit icon, display name, @username, bio text, stats row (Posts, Followers, Following with numbers), Edit Profile button, tab bar (Posts, Media, Likes, Replies), post grid below.' },
  { id: 'otherprofile', emoji: '🧑', label: 'User Profile', cat: 'social', prompt: 'Other user profile with Follow/Following button, message icon, cover photo, avatar, bio, mutual followers indicator, stats, content tabs.' },
  { id: 'editprofile', emoji: '✏️', label: 'Edit Profile', cat: 'social', prompt: 'Edit profile screen with camera icon on avatar and cover, editable fields: Display Name, Username, Bio (char count), Website, Location, Birthday. Save button.' },
  { id: 'chatlist', emoji: '💬', label: 'Chat List', cat: 'social', prompt: 'Messaging screen with search bar, conversation list with avatars, names, last message preview (truncated), timestamps, unread count badges (colored circle with number), online green dot indicators, archived chats section.' },
  { id: 'chatroom', emoji: '🗨️', label: 'Chat Room', cat: 'social', prompt: 'Chat room with message bubbles (sent=right colored, received=left dark), timestamps on bubbles, seen/delivered ticks, typing indicator dots, bottom input bar with attachment (+), emoji, camera, mic, send button. User name and avatar in header with online status.' },
  { id: 'discover', emoji: '🔍', label: 'Discover', cat: 'social', prompt: 'Discover screen with search bar at top, trending hashtags list with post counts, "Suggested for You" user cards with Follow button, trending topics with thumbnails, category explore grid.' },
  { id: 'findpeople', emoji: '🔎', label: 'Find People', cat: 'social', prompt: 'Find people screen with search input, contact sync option, suggested users list with avatar/name/bio/mutual friends count and Follow button, "Invite Friends" share option.' },
  { id: 'notifications', emoji: '🔔', label: 'Notifications', cat: 'social', prompt: 'Notifications with tabs (All, Mentions, Likes, Follows), each item has avatar, action text ("liked your post", "started following you"), timestamp, grouped by Today/This Week/Earlier, unread blue dot indicator.' },
  { id: 'stories', emoji: '📸', label: 'Story Viewer', cat: 'social', prompt: 'Full-screen story viewer with user avatar/name at top, progress bars for multi-story, story image/content in center, reply input at bottom, share and like buttons, swipe left/right indicators.' },
  { id: 'createpost', emoji: '📝', label: 'Create Post', cat: 'social', prompt: 'Create post screen with user avatar, large text area "What\'s on your mind?", media attachment bar (Photo, Video, GIF, Poll, Location), character count, audience selector dropdown, Post button in header.' },
  { id: 'comments', emoji: '💭', label: 'Comments', cat: 'social', prompt: 'Comments thread under a post preview, nested replies with indent, user avatar/name/timestamp, like button on each comment, reply action, "Write a comment" input bar at bottom with emoji and send.' },
  { id: 'liveforum', emoji: '📡', label: 'Live Forum', cat: 'social', prompt: 'Live discussion forum with red LIVE badge, topic title, real-time message stream, participant count, pinned moderator message, input bar at bottom, reaction emojis floating up.' },

  // ── CRYPTO (16) ──
  { id: 'wallet', emoji: '💰', label: 'Crypto Wallet', cat: 'crypto', prompt: 'Crypto wallet with total balance card (large number with USD), 24h change percentage with arrow, Send/Receive/Swap/Buy action buttons with icons, token list with icon/name/symbol, amount and USD value, 24h % change colored green/red, mini sparkline chart.' },
  { id: 'walletdetail', emoji: '📋', label: 'Token Detail', cat: 'crypto', prompt: 'Single token detail with price chart (1H,1D,1W,1M,1Y tabs), current price large, 24h stats (High, Low, Volume, Market Cap), Buy/Sell buttons, transaction history list.' },
  { id: 'sendcrypto', emoji: '📤', label: 'Send Crypto', cat: 'crypto', prompt: 'Send crypto screen with recipient address input (paste + QR scan icons), token selector dropdown, amount input with MAX button and USD conversion, network fee display, Review Transaction button.' },
  { id: 'receivecrypto', emoji: '📥', label: 'Receive Crypto', cat: 'crypto', prompt: 'Receive crypto screen with large QR code centered, wallet address with copy button, token/network selector, Share Address button, warning note about correct network.' },
  { id: 'swap', emoji: '🔄', label: 'Swap Tokens', cat: 'crypto', prompt: 'Token swap screen with From/To token selectors, amount inputs, swap arrow button between them, exchange rate display, slippage setting, price impact %, Swap button.' },
  { id: 'market', emoji: '📊', label: 'Market Overview', cat: 'crypto', prompt: 'Crypto market dashboard with search bar, sort options (Market Cap, Volume, Price, 24h%), top gainers/losers horizontal scroll, full coin list with rank number, icon, name, price, 24h change %, mini chart, star watchlist toggle.' },
  { id: 'trading', emoji: '📈', label: 'Trading', cat: 'crypto', prompt: 'Trading screen with candlestick chart (green/red candles), timeframe tabs (1M,5M,1H,1D), Buy/Sell toggle tabs, order type (Market/Limit), price and amount inputs, slider for percentage, order book depth visualization, Place Order button.' },
  { id: 'orderbook', emoji: '📕', label: 'Order Book', cat: 'crypto', prompt: 'Order book with bid/ask columns, price levels with horizontal volume bars (green bids, red asks), spread indicator in middle, last trade price, depth chart visualization option.' },
  { id: 'portfolio', emoji: '🥧', label: 'Portfolio', cat: 'crypto', prompt: 'Portfolio screen with donut chart showing asset allocation by color, total value, 24h P&L, asset list with allocation %, value, and performance, Add Asset button.' },
  { id: 'nft', emoji: '🖼️', label: 'NFT Gallery', cat: 'crypto', prompt: 'NFT gallery with masonry grid of NFT card images, each with name, collection badge, price in ETH/SOL, creator avatar. Filter tabs (All, Art, Music, Gaming), search bar, View/Buy buttons on hover-style.' },
  { id: 'nftdetail', emoji: '🎨', label: 'NFT Detail', cat: 'crypto', prompt: 'NFT detail page with large image, name, collection with verified badge, owner/creator info, current price, Place Bid and Buy Now buttons, Properties traits grid with rarity %, Activity/History tabs, description.' },
  { id: 'voting', emoji: '🗳️', label: 'Voting/Governance', cat: 'crypto', prompt: 'DAO governance with active proposals list, each with title, status badge (Active/Passed/Failed), Yes/No vote progress bars with percentages, time remaining countdown, voting power display, Vote button.' },
  { id: 'staking', emoji: '🔒', label: 'Staking', cat: 'crypto', prompt: 'Staking screen with APY % display (highlighted), total staked amount, rewards earned with claim button, Stake/Unstake tabs, amount input with MAX, lock period options (30/60/90 days), validator list with commission rates.' },
  { id: 'defi', emoji: '🏦', label: 'DeFi Dashboard', cat: 'crypto', prompt: 'DeFi dashboard with total TVL, yield farming pools list with APY, liquidity pools with token pairs, Supply/Borrow tabs, health factor indicator, active positions summary.' },
  { id: 'txhistory', emoji: '📜', label: 'Transaction History', cat: 'crypto', prompt: 'Transaction history with filter chips (All, Sent, Received, Swaps), transaction items with type icon, token name, amount, USD value, status badge (Completed/Pending/Failed), date, and "View on Explorer" link.' },
  { id: 'cryptonews', emoji: '📰', label: 'Crypto News', cat: 'crypto', prompt: 'Crypto news feed with featured article banner image, headline, source, timestamp. News list with thumbnail, title, source icon, time ago. Category tabs: All, Bitcoin, Ethereum, DeFi, NFT, Regulation.' },

  // ── GAMIFICATION (6) ──
  { id: 'karma', emoji: '⭐', label: 'Karma/XP', cat: 'gamify', prompt: 'Gamification screen with user level badge, XP progress bar to next level, total karma points, daily streak counter with flame icon, achievement badges grid (Earned=colored, Locked=gray), daily tasks checklist with XP rewards.' },
  { id: 'leaderboard', emoji: '🏆', label: 'Leaderboard', cat: 'gamify', prompt: 'Leaderboard with top 3 podium (gold/silver/bronze) with avatars, scrollable rank list with position, avatar, name, XP points, level badge. Tabs: Daily, Weekly, All Time. My rank highlighted.' },
  { id: 'rewards', emoji: '🎁', label: 'Rewards Store', cat: 'gamify', prompt: 'Rewards store with points balance at top, redeemable items grid: NFTs, merch, premium features, discounts. Each with image, title, point cost, Redeem button. History tab.' },
  { id: 'dailytasks', emoji: '✅', label: 'Daily Tasks', cat: 'gamify', prompt: 'Daily tasks/quests screen with reset timer, task list with icon, description, XP reward, progress bar, claim button. Categories: Social (post, comment, like), Trading (swap, trade), Community (refer, vote).' },
  { id: 'achievements', emoji: '🏅', label: 'Achievements', cat: 'gamify', prompt: 'Achievements grid with badge icons, name, description, progress (e.g. "5/10 posts"), rarity indicator (Common/Rare/Epic/Legendary with colored borders), locked badges grayed out with unlock requirements.' },
  { id: 'referral', emoji: '🤝', label: 'Referral Program', cat: 'gamify', prompt: 'Referral screen with unique referral code/link with copy and share buttons, rewards earned from referrals, tier system (Bronze/Silver/Gold), referred users list, "Invite Friends" prominent CTA.' },

  // ── E-COMMERCE (5) ──
  { id: 'shop', emoji: '🛍️', label: 'Shop/Store', cat: 'ecommerce', prompt: 'Shop screen with search bar, category chips, featured banner carousel, product grid with image, name, price, rating stars, Add to Cart quick button, sale badge on discounted items.' },
  { id: 'productdetail', emoji: '📦', label: 'Product Detail', cat: 'ecommerce', prompt: 'Product detail with image carousel/gallery, product name, price (with strike-through original if on sale), star rating with review count, size/color selectors, quantity stepper, Add to Cart and Buy Now buttons, description tabs.' },
  { id: 'cart', emoji: '🛒', label: 'Shopping Cart', cat: 'ecommerce', prompt: 'Shopping cart with item list (thumbnail, name, variant, price, quantity +/- controls, remove X), promo code input with Apply, price breakdown (subtotal, discount, shipping, total), Checkout button.' },
  { id: 'checkout', emoji: '💳', label: 'Checkout', cat: 'ecommerce', prompt: 'Checkout with steps indicator (Address > Payment > Review), shipping address card with edit, payment method cards (Visa, Crypto, Apple Pay), order summary, Place Order button with total amount.' },
  { id: 'orders', emoji: '📋', label: 'My Orders', cat: 'ecommerce', prompt: 'Orders list with tabs (Active, Completed, Cancelled), order cards with date, order ID, item thumbnails, status badge with color, total amount, Track/Reorder buttons.' },

  // ── MEDIA & CONTENT (5) ──
  { id: 'videofeed', emoji: '🎬', label: 'Video Feed', cat: 'media', prompt: 'TikTok-style full-screen vertical video feed with video playing, user info overlay (avatar, name, description), right side action column (like heart with count, comment, share, bookmark, sound), bottom music info bar, progress indicator.' },
  { id: 'livevideo', emoji: '🔴', label: 'Live Stream', cat: 'media', prompt: 'Live stream screen with video player, LIVE badge with viewer count, floating chat messages over video, heart/reaction animations, gift/tip button, follow streamer button, share, comment input bar.' },
  { id: 'podcast', emoji: '🎙️', label: 'Podcast/Spaces', cat: 'media', prompt: 'Audio spaces/podcast room with host avatar large in center, co-hosts row, listeners grid of small avatars, hand raise button, mute/unmute, leave button, topic title, live indicator.' },
  { id: 'musicplayer', emoji: '🎵', label: 'Music Player', cat: 'media', prompt: 'Music player with large album art, song title, artist name, progress bar with timestamps, play/pause/skip controls, volume slider, like button, playlist/shuffle/repeat toggles, lyrics button.' },
  { id: 'gallery', emoji: '🖼️', label: 'Photo Gallery', cat: 'media', prompt: 'Photo gallery with grid layout (mix of 1x1 and 2x1 tiles), select mode toggle, album tabs, upload FAB button, long-press select indicator, bottom action bar for selected (Share, Delete, Move).' },
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

// ─── SUGGESTED PAGE SETS ──────────────────────────────────────────
const SUGGESTED_SETS = [
  {
    name: '🚀 TrendUp Complete App',
    desc: 'Full social crypto app like trenduplive.com',
    pages: ['Splash Screen', 'Login', 'Home Feed', 'For You Feed', 'Discover', 'Chat List', 'Chat Room', 'My Profile', 'Notifications', 'Crypto Wallet', 'Market Overview', 'Trading', 'NFT Gallery', 'Voting', 'Karma XP', 'Live Forum', 'Settings'],
  },
  {
    name: '💰 Crypto Trading App',
    desc: 'Wallet, trading, portfolio management',
    pages: ['Splash Screen', 'Login', 'Crypto Wallet', 'Token Detail', 'Send Crypto', 'Receive Crypto', 'Swap Tokens', 'Market Overview', 'Trading', 'Order Book', 'Portfolio', 'Transaction History', 'Settings'],
  },
  {
    name: '📱 Social Media App',
    desc: 'Instagram/Twitter style social platform',
    pages: ['Splash Screen', 'Onboarding Intro', 'Login', 'Register', 'Home Feed', 'Discover', 'Create Post', 'My Profile', 'Edit Profile', 'Chat List', 'Chat Room', 'Notifications', 'Story Viewer', 'Comments', 'Settings'],
  },
  {
    name: '🎮 GameFi / Play-to-Earn',
    desc: 'Gamified crypto with rewards',
    pages: ['Splash Screen', 'Login', 'Home Feed', 'Crypto Wallet', 'Karma XP', 'Leaderboard', 'Daily Tasks', 'Achievements', 'Rewards Store', 'Referral Program', 'NFT Gallery', 'Settings'],
  },
  {
    name: '🛍️ Crypto E-Commerce',
    desc: 'Shop with crypto payments',
    pages: ['Splash Screen', 'Login', 'Shop Store', 'Product Detail', 'Shopping Cart', 'Checkout', 'My Orders', 'Crypto Wallet', 'My Profile', 'Settings'],
  },
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
  { id: 'purple', name: 'Deep Purple', primary: '#A855F7', bg: '#0D0515', surface: '#1A0E2E', text: '#F3E8FF', font: 'Outfit' },
  { id: 'coral', name: 'Coral Red', primary: '#EF4444', bg: '#150505', surface: '#2B0E0E', text: '#FEE2E2', font: 'DM Sans' },
];

// ─── DEVICE FRAMES ─────────────────────────────────────────────────
const DEVICES = [
  { id: 'iphone15', name: 'iPhone 15 Pro', w: 393, h: 852, radius: 55, notch: 'island' },
  { id: 'iphone_se', name: 'iPhone SE', w: 375, h: 667, radius: 40, notch: 'none' },
  { id: 'android', name: 'Android', w: 412, h: 915, radius: 30, notch: 'punch' },
  { id: 'ipad', name: 'iPad Mini', w: 744, h: 1133, radius: 24, notch: 'none' },
];

// ─── SYSTEM PROMPT BUILDER (FIXED - no base64 in prompt) ──────────
function buildSystemPrompt(brand, allPages, currentPageName, hasLogo) {
  const masterPage = allPages[0];
  const referenceCode = masterPage && masterPage.html
    ? `\nMASTER REFERENCE STYLE (Follow this EXACT style):\n${masterPage.html.substring(0, 3000)}`
    : '';
  const existingPages = allPages.map(p => p.name).join(', ');

  const logoInstruction = hasLogo
    ? `\n6. LOGO: The app has a custom logo. Include this EXACT placeholder in the header/navbar of the screen: <img src="{{APP_LOGO}}" alt="${brand.name} Logo" style="height:32px;object-fit:contain;" />
   This placeholder will be replaced with the actual logo after generation. ALWAYS include it in the top bar/header area.`
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
5. NAVIGATION: Pages in app: ${existingPages}. Use consistent bottom tab bar with icons.${logoInstruction}
7. STYLE GUIDELINES:
   - Rounded corners (rounded-2xl to rounded-3xl)
   - Soft shadows and glassmorphism where appropriate
   - FontAwesome 6 icons via CDN
   - Gradient accents on primary buttons
   - Status bar area at top (time, signal, battery)
   - Bottom navigation bar with 5 tabs and active indicator
8. INCLUDE these CDNs in <head>:
   - <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
   - <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
   - <link href="https://fonts.googleapis.com/css2?family=${brand.font || 'Inter'}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
9. Make it look like a REAL production app, pixel-perfect, not a wireframe.

Output ONLY the raw HTML string. No markdown. No code blocks. No explanations.`;
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
        <div key={t.id} className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-xl border
          ${t.type === 'success' ? 'bg-emerald-600/90 border-emerald-500/30 text-white' :
            t.type === 'error' ? 'bg-red-600/90 border-red-500/30 text-white' :
            'bg-slate-800/90 border-white/10 text-slate-200'}`}
          style={{ animation: 'slideIn 0.3s ease-out' }}>
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
export default function App() {
  // ── Brand state ──
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('v2ui_brand_v4');
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
      const saved = localStorage.getItem('v2ui_pages_v4');
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
  const [showThemes, setShowThemes] = useState(false);
  const [genStats, setGenStats] = useState({ count: 0, lastTime: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutoGen, setShowAutoGen] = useState(false);
  const [autoGenRunning, setAutoGenRunning] = useState(false);
  const [autoGenProgress, setAutoGenProgress] = useState({ current: 0, total: 0, currentName: '' });
  const autoGenAbortRef = useRef(false);
  const [logoBase64, setLogoBase64] = useState(() => {
    try { return localStorage.getItem('v2ui_logo_v4') || ''; } catch { return ''; }
  });

  const { toasts, addToast } = useToasts();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // ── Persistence ──
  useEffect(() => { try { localStorage.setItem('v2ui_brand_v4', JSON.stringify(brand)); } catch {} }, [brand]);
  useEffect(() => { try { localStorage.setItem('v2ui_pages_v4', JSON.stringify(pages)); } catch {} }, [pages]);
  useEffect(() => { try { localStorage.setItem('v2ui_logo_v4', logoBase64); } catch {} }, [logoBase64]);

  const currentPage = pages[activePageIndex] || pages[0];
  const device = DEVICES[activeDevice];

  // ── Filtered presets ──
  const filteredPresets = useMemo(() => {
    let list = PRESETS;
    if (presetFilter !== 'all') list = list.filter(p => p.cat === presetFilter);
    return list;
  }, [presetFilter]);

  // ── Logo injection into generated HTML ──
  const injectLogo = useCallback((html) => {
    if (!logoBase64 || !html) return html;
    return html.replace(/\{\{APP_LOGO\}\}/g, logoBase64);
  }, [logoBase64]);

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
      if (file.size > 500000) {
        addToast('Logo file too large. Use under 500KB for best results.', 'error');
        return;
      }
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

  const addSuggestedSet = (set) => {
    const newPages = set.pages.map((name, i) => ({ id: (Date.now() + i).toString(), name, html: '' }));
    pagesHistory.set(newPages);
    setActivePageIndex(0);
    setShowSuggestions(false);
    addToast(`Added ${set.pages.length} screens from "${set.name}"`, 'success');
  };

  // ── Auto Generate All Screens ──
  const generateSingleScreen = async (pageName, allPagesSnapshot, brandSnapshot, logoB64, retryCount = 0) => {
    const preset = PRESETS.find(p => p.label === pageName);
    const promptText = preset ? preset.prompt : `Design a beautiful ${pageName} screen that matches the app style.`;
    const parts = [{ text: `Task: Create the "${pageName}" mobile screen.\nInstructions: ${promptText}` }];
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: { parts: [{ text: buildSystemPrompt(brandSnapshot, allPagesSnapshot, pageName, !!logoB64) }] },
        }),
      }
    );
    if (!resp.ok) {
      if (retryCount < 2) {
        await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1500));
        return generateSingleScreen(pageName, allPagesSnapshot, brandSnapshot, logoB64, retryCount + 1);
      }
      throw new Error(`Failed: ${resp.status}`);
    }
    const data = await resp.json();
    let html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    html = html.replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();
    if (logoB64) html = html.replace(/\{\{APP_LOGO\}\}/g, logoB64);
    return html;
  };

  const autoGenerateAll = async (set) => {
    const newPages = set.pages.map((name, i) => ({ id: (Date.now() + i).toString(), name, html: '' }));
    pagesHistory.set(newPages);
    setShowAutoGen(false);
    setShowSuggestions(false);
    setAutoGenRunning(true);
    autoGenAbortRef.current = false;
    setAutoGenProgress({ current: 0, total: newPages.length, currentName: newPages[0].name });
    addToast(`Auto-generating ${newPages.length} screens...`, 'success');

    let updatedPages = [...newPages];
    const brandSnap = { ...brand };
    const logoSnap = logoBase64;

    for (let i = 0; i < updatedPages.length; i++) {
      if (autoGenAbortRef.current) {
        addToast('Auto-generation stopped.', 'info');
        break;
      }
      setActivePageIndex(i);
      setAutoGenProgress({ current: i + 1, total: updatedPages.length, currentName: updatedPages[i].name });
      try {
        const html = await generateSingleScreen(updatedPages[i].name, updatedPages, brandSnap, logoSnap);
        updatedPages = [...updatedPages];
        updatedPages[i] = { ...updatedPages[i], html };
        pagesHistory.set(updatedPages);
        setPreviewKey(k => k + 1);
        setActiveTab('preview');
        addToast(`"${updatedPages[i].name}" done (${i + 1}/${updatedPages.length})`, 'success');
      } catch (err) {
        addToast(`"${updatedPages[i].name}" failed, skipping...`, 'error');
      }
      // Small delay between generations to avoid rate limits
      if (i < updatedPages.length - 1) await new Promise(r => setTimeout(r, 1500));
    }

    setAutoGenRunning(false);
    const doneCount = updatedPages.filter(p => p.html).length;
    addToast(`Auto-generation complete! ${doneCount}/${updatedPages.length} screens ready.`, 'success');
    setActivePageIndex(0);
    setPreviewKey(k => k + 1);
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
            systemInstruction: { parts: [{ text: buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64) }] },
          }),
        }
      );

      if (!resp.ok) throw new Error(`AI Error: ${resp.status}`);

      const data = await resp.json();
      let html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      html = html.replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();

      // Inject logo into generated HTML
      html = injectLogo(html);

      const upd = [...pages];
      upd[activePageIndex] = { ...upd[activePageIndex], html };
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
            contents: [{ parts: [{ text: `Current HTML of "${currentPage.name}" screen:\n${currentPage.html}\n\nRefine this design: ${prompt || 'Make it more polished, premium, and production-ready. Improve spacing, colors, add micro-interactions.'}` }] }],
            systemInstruction: { parts: [{ text: buildSystemPrompt(brand, pages, currentPage.name, !!logoBase64) }] },
          }),
        }
      );

      if (!resp.ok) throw new Error(`AI Error: ${resp.status}`);
      const data = await resp.json();
      let html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      html = html.replace(/```(html|markdown)?/g, '').replace(/```/g, '').trim();
      html = injectLogo(html);

      const upd = [...pages];
      upd[activePageIndex] = { ...upd[activePageIndex], html };
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
    a.href = url; a.download = `${currentPage.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
.hdr{padding:50px 20px;text-align:center;background:linear-gradient(180deg,#111,#050507);border-bottom:1px solid #1a1a1e}
.hdr h1{font-size:36px;font-weight:900;letter-spacing:-1px}
.hdr p{color:#666;margin-top:8px;font-size:14px}
.gr{display:flex;flex-wrap:wrap;gap:50px;padding:50px;justify-content:center}
.dw{display:flex;flex-direction:column;align-items:center;gap:16px}
.dl{font-size:11px;font-weight:800;text-transform:uppercase;color:${brand.primary};letter-spacing:3px}
.mk{width:393px;height:852px;background:#fff;border:10px solid #1a1a1e;border-radius:55px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6);position:relative}
.is{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:126px;height:37px;background:#1a1a1e;border-radius:20px;z-index:10}
iframe{width:100%;height:100%;border:none}
</style></head><body>
<div class="hdr">
${logoBase64 ? `<img src="${logoBase64}" alt="${brand.name}" style="height:50px;margin-bottom:16px;object-fit:contain"/>` : ''}
<h1>${brand.name}</h1>
<p>${pages.length} Screen${pages.length > 1 ? 's' : ''} • Mobile App Prototype</p>
</div>
<div class="gr">
${pages.filter(p => p.html).map(p => `<div class="dw"><div class="dl">${p.name}</div><div class="mk"><div class="is"></div><iframe srcdoc="${p.html.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" loading="lazy"></iframe></div></div>`).join('\n')}
</div>
</body></html>`;

    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${brand.name.replace(/\s+/g, '_')}_Prototype.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Full prototype downloaded!', 'success');
  };

  const copyCode = () => {
    if (!currentPage?.html) { addToast('No code to copy', 'error'); return; }
    navigator.clipboard.writeText(currentPage.html).then(() => {
      setCopied(true); addToast('HTML copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = currentPage.html;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const applyTheme = (theme) => {
    setBrand(prev => ({ ...prev, primary: theme.primary, bg: theme.bg, surface: theme.surface, text: theme.text, font: theme.font }));
    setShowThemes(false);
    addToast(`Applied "${theme.name}" theme`, 'success');
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); pagesHistory.undo(); addToast('Undo', 'info'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); pagesHistory.redo(); addToast('Redo', 'info'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); generatePage(); }
      if (e.key === 'Escape') { setIsFullscreen(false); setShowSettings(false); setShowAddPageModal(false); setShowThemes(false); setShowExport(false); setShowSuggestions(false); setShowAutoGen(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pagesHistory]);

  const designedCount = pages.filter(p => p.html).length;

  // ═════════════════════════════════════════════════════════════════
  // FULLSCREEN
  // ═════════════════════════════════════════════════════════════════
  if (isFullscreen && currentPage?.html) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all border border-white/10"><Minimize2 size={20} /></button>
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          {DEVICES.map((d, i) => (
            <button key={d.id} onClick={() => setActiveDevice(i)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeDevice === i ? 'bg-white/20 text-white border border-white/20' : 'text-white/40 hover:text-white/60'}`}>{d.name}</button>
          ))}
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
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 flex flex-col font-sans overflow-hidden" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <ToastContainer toasts={toasts} />

      {/* ── HEADER ── */}
      <header className="h-14 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl flex items-center justify-between px-5 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}99)`, boxShadow: `0 4px 15px ${brand.primary}30` }}>
            {logoBase64 ? <img src={logoBase64} alt="Logo" className="w-6 h-6 object-contain" /> : <Smartphone size={18} className="text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black tracking-tight text-[15px]">V2UI <span style={{ color: brand.primary }}>Studio</span></span>
              <span className="px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-widest" style={{ color: brand.primary, borderColor: brand.primary + '30', background: brand.primary + '10' }}>Pro</span>
            </div>
            <p className="text-[9px] text-slate-600 font-bold tracking-wide mt-0.5">{brand.name} • {designedCount}/{pages.length} screens • {PRESETS.length} presets</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => pagesHistory.undo()} disabled={!pagesHistory.canUndo} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-20 transition-all" title="Undo"><Undo2 size={15} /></button>
          <button onClick={() => pagesHistory.redo()} disabled={!pagesHistory.canRedo} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-20 transition-all" title="Redo"><Redo2 size={15} /></button>
          <div className="w-px h-5 bg-white/5 mx-1" />
          <button onClick={() => setShowSuggestions(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Page Suggestions"><Lightbulb size={15} /></button>
          <button onClick={() => setShowAutoGen(true)} className="p-2 rounded-lg hover:bg-white/5 transition-all" style={{ color: autoGenRunning ? brand.primary : undefined }} title="Auto Generate All"><Rocket size={15} className={autoGenRunning ? 'animate-pulse' : ''} /></button>
          <button onClick={() => setShowThemes(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Themes"><Palette size={15} /></button>
          <button onClick={() => setShowExport(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Export"><Download size={15} /></button>
          <button onClick={copyCode} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-all"><Settings size={15} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-[#0a0a0c] border-r border-white/5 flex flex-col shrink-0 transition-all duration-300`}>
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-1.5"><Files size={10} /> Screens ({pages.length})</span>}
            <div className="flex gap-1">
              {!sidebarCollapsed && (
                <button onClick={() => setShowAddPageModal(true)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white hover:scale-110 active:scale-95 transition-all" style={{ background: brand.primary }} title="Add Screen"><Plus size={14} /></button>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-600 transition-all">
                <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5" style={{ scrollbarWidth: 'thin' }}>
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
                  <button onClick={() => deletePage(i)} className="absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={11} /></button>
                )}
              </div>
            ))}
            {sidebarCollapsed && (
              <button onClick={() => setShowAddPageModal(true)} className="w-full flex justify-center py-2.5 text-slate-600 hover:text-white transition-all"><Plus size={14} /></button>
            )}
          </div>

          {/* Logo Upload */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-black/40 border-t border-white/5">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Upload size={9} /> App Logo</div>
              <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/5 transition-all group">
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                {logoBase64 ? (
                  <><img src={logoBase64} alt="Logo" className="w-8 h-8 object-contain rounded-md bg-white/10 p-0.5" />
                  <div className="min-w-0"><p className="text-[10px] font-bold text-slate-300 truncate">Logo uploaded</p><p className="text-[8px] text-slate-600">Shown on all screens</p></div></>
                ) : (
                  <><div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-slate-400"><ImageIcon size={14} /></div>
                  <div><p className="text-[10px] font-bold text-slate-500">Upload logo</p><p className="text-[8px] text-slate-700">Shows on all pages</p></div></>
                )}
              </button>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-md border border-white/10" style={{ background: brand.primary }} />
                <div className="min-w-0"><p className="text-[9px] font-bold text-slate-400 truncate">{brand.font}</p><p className="text-[8px] text-slate-700 truncate">{brand.name}</p></div>
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN WORKSPACE ── */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Toolbar */}
          <div className="h-11 border-b border-white/5 flex items-center justify-between px-5 bg-black/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Eye size={11} /> Preview</button>
                <button onClick={() => setActiveTab('code')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-slate-500'}`}><Code2 size={11} /> Code</button>
              </div>
              <div className="h-4 w-px bg-white/5" />
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><Smartphone size={12} style={{ color: brand.primary }} /> {currentPage?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                {DEVICES.map((d, i) => (
                  <button key={d.id} onClick={() => setActiveDevice(i)} className={`p-1.5 rounded-md transition-all ${activeDevice === i ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`} title={d.name}>
                    {d.id === 'ipad' ? <Tablet size={12} /> : d.id === 'android' ? <Monitor size={12} /> : <Smartphone size={12} />}
                  </button>
                ))}
              </div>
              {currentPage?.html && (
                <><button onClick={() => setIsFullscreen(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Fullscreen"><Maximize2 size={13} /></button>
                <button onClick={() => setPreviewKey(k => k + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all" title="Refresh"><RefreshCw size={13} /></button></>
              )}
              {genStats.count > 0 && <span className="text-[9px] text-slate-600 font-bold ml-1">{genStats.count} gen{genStats.count > 1 ? 's' : ''} • {genStats.lastTime}s</span>}
            </div>
          </div>

          {/* Preview/Code */}
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
                    <div key={i} className="flex"><span className="inline-block w-10 text-right pr-4 text-slate-700 select-none shrink-0 text-[10px]">{i + 1}</span><span className="flex-1">{line || ' '}</span></div>
                  )) : <span className="text-slate-700 italic">No code yet. Generate a design first.</span>}
                </pre>
              </div>
            ) : (
              <div className="transition-all duration-500 relative overflow-hidden bg-white"
                style={{ width: Math.min(device.w, 500), height: Math.min(device.h, 680), borderRadius: device.radius, border: '10px solid #1a1a1e', boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)` }}>
                {device.notch === 'island' && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#1a1a1e] rounded-[14px] z-50 flex items-center justify-center"><div className="w-8 h-[3px] bg-slate-800 rounded-full" /></div>}
                {device.notch === 'punch' && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1e] rounded-full z-50" />}
                {currentPage?.html ? (
                  <iframe key={`${previewKey}-${activePageIndex}-${activeDevice}`} srcDoc={currentPage.html} className="w-full h-full border-none" title="Preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-10" style={{ background: brand.bg }}>
                    <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5" style={{ background: brand.primary + '15' }}>
                      {logoBase64 ? <img src={logoBase64} alt="Logo" className="w-10 h-10 object-contain" /> : <Smartphone size={30} style={{ color: brand.primary + '60' }} />}
                    </div>
                    <h3 className="text-base font-black text-white italic tracking-tight">Empty Canvas</h3>
                    <p className="text-[10px] mt-2 max-w-[200px] leading-relaxed font-semibold" style={{ color: brand.text + '60' }}>Describe what "{currentPage?.name}" should look like</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── BUILDER CONTROLS ── */}
          <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl shrink-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {/* Category + Presets */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/5 shrink-0">
                  <button onClick={() => setInputMode('prompt')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${inputMode === 'prompt' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'prompt' ? { background: brand.primary } : {}}>Prompt</button>
                  <button onClick={() => setInputMode('convert')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${inputMode === 'convert' ? 'text-white' : 'text-slate-500'}`} style={inputMode === 'convert' ? { background: brand.primary } : {}}>Vision</button>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <div className="flex gap-1 shrink-0">
                  {PRESET_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (<button key={cat.id} onClick={() => setPresetFilter(cat.id)} className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all flex items-center gap-1 ${presetFilter === cat.id ? 'text-white bg-white/10' : 'text-slate-600 hover:text-slate-400'}`}><Icon size={10} /> {cat.label}</button>);
                  })}
                </div>
                <div className="h-4 w-px bg-white/5" />
                <div className="flex gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                  {filteredPresets.map(p => (
                    <button key={p.id} onClick={() => setPrompt(p.prompt)} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-white hover:border-white/10 transition-all whitespace-nowrap shrink-0">{p.emoji} {p.label}</button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-3 items-center">
                {inputMode === 'convert' && (
                  <button onClick={() => fileInputRef.current?.click()} className={`w-12 h-12 shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {image ? <img src={image} className="w-8 h-8 object-contain rounded" alt="Ref" /> : <ImageIcon size={18} className="text-slate-600" />}
                  </button>
                )}
                <div className="flex-1 relative">
                  <input value={prompt} onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generatePage(); } }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 pr-[200px] text-sm text-white outline-none transition-all placeholder:text-slate-700"
                    placeholder={`Describe "${currentPage?.name}" screen design...`} />
                  <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                    {currentPage?.html && (
                      <button onClick={refinePage} disabled={isLoading} className="h-9 px-4 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 border border-white/5"><Sparkles size={11} /> Refine</button>
                    )}
                    <button onClick={() => generatePage()} disabled={isLoading} className="h-9 px-5 rounded-lg text-[10px] uppercase font-bold tracking-wider text-white transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-lg" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}cc)`, boxShadow: `0 4px 15px ${brand.primary}30` }}>
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="white" />} Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[9px] text-slate-700">
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Enter</kbd> Generate</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Z</kbd> Undo</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px]">Esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MODALS ══════ */}

      {/* Add Screen */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddPageModal(false)} />
          <form onSubmit={handleAddPage} className="w-[420px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: brand.primary + '20', color: brand.primary }}><Plus size={22} /></div>
              <div><h2 className="text-lg font-black text-white leading-none">New Screen</h2><p className="text-[10px] text-slate-500 font-semibold mt-1">Add to your mobile app</p></div>
            </div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Screen Name</label>
            <input autoFocus type="text" value={newPageName} onChange={e => setNewPageName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-white/20 transition-all" placeholder="e.g. Profile, Wallet, Chat..." />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['Home Feed', 'Profile', 'Wallet', 'Chat', 'Settings', 'Discover', 'Notifications', 'Market', 'Trading', 'NFT Gallery', 'Voting', 'Staking', 'Live Forum', 'Video Feed'].map(name => (
                <button key={name} type="button" onClick={() => setNewPageName(name)} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-500 hover:text-white transition-all">{name}</button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowAddPageModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-400 font-bold text-xs hover:bg-white/10 transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold text-xs active:scale-95 transition-all shadow-lg" style={{ background: brand.primary }}>Add Screen</button>
            </div>
          </form>
        </div>
      )}

      {/* Suggested Page Sets */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSuggestions(false)} />
          <div className="w-[550px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2.5"><Lightbulb size={18} style={{ color: brand.primary }} /> Suggested App Structures</h2>
              <button onClick={() => setShowSuggestions(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Click any template to load its full page structure. This replaces current screens.</p>
            <div className="space-y-3">
              {SUGGESTED_SETS.map((set, i) => (
                <button key={i} onClick={() => addSuggestedSet(set)} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">{set.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: brand.primary, background: brand.primary + '15' }}>{set.pages.length} screens</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">{set.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {set.pages.map(p => <span key={p} className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-slate-400 font-bold">{p}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto Generate Modal */}
      {showAutoGen && !autoGenRunning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAutoGen(false)} />
          <div className="w-[550px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2.5"><Rocket size={18} style={{ color: brand.primary }} /> Auto Generate App</h2>
              <button onClick={() => setShowAutoGen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Upload your logo, pick an app type, and hit <b>Auto Generate</b>. All screens will be created one by one automatically!</p>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-5">
              <button onClick={() => logoInputRef.current?.click()} className="w-14 h-14 shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden" style={{ borderColor: logoBase64 ? brand.primary + '50' : 'rgba(255,255,255,0.1)' }}>
                {logoBase64 ? <img src={logoBase64} alt="Logo" className="w-10 h-10 object-contain" /> : <Upload size={20} className="text-slate-600" />}
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{logoBase64 ? 'Logo ready' : 'Upload your logo first'}</p>
                <p className="text-[10px] text-slate-500">{logoBase64 ? 'Will appear on every generated screen' : 'Click to upload (recommended)'}</p>
              </div>
            </div>

            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Choose App Type to Auto-Generate:</p>
            <div className="space-y-2.5">
              {SUGGESTED_SETS.map((set, i) => (
                <button key={i} onClick={() => autoGenerateAll(set)} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left group">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-white">{set.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: brand.primary, background: brand.primary + '15' }}>{set.pages.length} screens</span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all" style={{ background: brand.primary }}><Play size={10} className="inline mr-1" />Start</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">{set.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {set.pages.slice(0, 8).map(p => <span key={p} className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-slate-400 font-bold">{p}</span>)}
                    {set.pages.length > 8 && <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-slate-500 font-bold">+{set.pages.length - 8} more</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto Gen Progress Overlay */}
      {autoGenRunning && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[999] w-[420px] bg-[#0d0d12] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" style={{ color: brand.primary }} />
              <span className="text-xs font-bold text-white">Auto-Generating...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold" style={{ color: brand.primary }}>{autoGenProgress.current}/{autoGenProgress.total}</span>
              <button onClick={() => { autoGenAbortRef.current = true; }} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all">Stop</button>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(autoGenProgress.current / autoGenProgress.total) * 100}%`, background: `linear-gradient(90deg, ${brand.primary}, ${brand.primary}99)` }} />
          </div>
          <p className="text-[10px] text-slate-500 truncate">Generating: <span className="text-white font-bold">{autoGenProgress.currentName}</span></p>
        </div>
      )}

      {/* Brand Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettings(false)} />
          <div className="w-[480px] bg-[#0d0d12] border border-white/10 rounded-3xl p-7 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2.5"><Settings size={20} style={{ color: brand.primary }} /> Project Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500"><X size={16} /></button>
            </div>
            <div className="space-y-5">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">App Name</label>
                <input type="text" value={brand.name} onChange={e => setBrand({ ...brand, name: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none" /></div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">App Logo</label>
                <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/8 transition-all">
                  {logoBase64 ? (<><img src={logoBase64} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1" /><div><p className="text-xs font-bold text-white">Logo uploaded</p><p className="text-[10px] text-slate-500">Click to change • Shows on all screens</p></div></>) :
                  (<><div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-slate-600"><Upload size={18} /></div><div><p className="text-xs font-bold text-slate-400">Upload your logo</p><p className="text-[10px] text-slate-600">Will appear on every generated screen</p></div></>)}
                </button>
                {logoBase64 && <button onClick={() => { setLogoBase64(''); setBrand(prev => ({ ...prev, logo: '' })); addToast('Logo removed', 'info'); }} className="mt-2 text-[10px] text-red-400 hover:text-red-300 font-bold">Remove logo</button>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Color</label>
                  <div className="flex items-center gap-2"><input type="color" value={brand.primary} onChange={e => setBrand({ ...brand, primary: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                  <input type="text" value={brand.primary} onChange={e => setBrand({ ...brand, primary: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" /></div></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Font</label>
                  <select value={brand.font} onChange={e => setBrand({ ...brand, font: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none">
                    {['Inter', 'Plus Jakarta Sans', 'Outfit', 'Montserrat', 'DM Sans', 'Space Grotesk', 'Poppins', 'Nunito'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Background</label>
                  <div className="flex items-center gap-2"><input type="color" value={brand.bg || '#0F1419'} onChange={e => setBrand({ ...brand, bg: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                  <input type="text" value={brand.bg || '#0F1419'} onChange={e => setBrand({ ...brand, bg: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" /></div></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Surface</label>
                  <div className="flex items-center gap-2"><input type="color" value={brand.surface || '#1A1F2E'} onChange={e => setBrand({ ...brand, surface: e.target.value })} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl cursor-pointer" />
                  <input type="text" value={brand.surface || '#1A1F2E'} onChange={e => setBrand({ ...brand, surface: e.target.value })} className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-white font-mono" /></div></div>
              </div>
            </div>
            <button onClick={() => { setShowSettings(false); addToast('Settings saved', 'success'); }} className="w-full mt-6 py-3 rounded-xl text-white font-bold text-xs active:scale-[0.98] transition-all shadow-lg" style={{ background: brand.primary }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Theme Presets */}
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
                <button key={theme.id} onClick={() => applyTheme(theme)} className="p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all text-left" style={{ background: theme.bg }}>
                  <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-full" style={{ background: theme.primary }} /><span className="text-xs font-bold" style={{ color: theme.text }}>{theme.name}</span></div>
                  <div className="flex gap-1.5"><div className="w-8 h-4 rounded" style={{ background: theme.surface }} /><div className="flex-1 h-4 rounded" style={{ background: theme.primary + '30' }} /></div>
                  <p className="text-[9px] mt-2 font-semibold" style={{ color: theme.text + '60' }}>{theme.font}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export */}
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
                <FileCode size={20} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Current Screen HTML</p><p className="text-[10px] text-slate-500">Download {currentPage?.name}.html</p></div></button>
              <button onClick={() => { downloadAllPages(); setShowExport(false); }} disabled={designedCount === 0} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left disabled:opacity-30 flex items-center gap-3">
                <Layers size={20} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Full Prototype</p><p className="text-[10px] text-slate-500">All {designedCount} screens in device mockups</p></div></button>
              <button onClick={() => { copyCode(); setShowExport(false); }} disabled={!currentPage?.html} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-left disabled:opacity-30 flex items-center gap-3">
                <Copy size={20} style={{ color: brand.primary }} /><div><p className="text-xs font-bold text-white">Copy HTML to Clipboard</p><p className="text-[10px] text-slate-500">Paste anywhere</p></div></button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.05);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.1)}
        input:focus,select:focus{border-color:${brand.primary}50 !important}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
