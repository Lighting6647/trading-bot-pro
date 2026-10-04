"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { getMarketStatus } from '@/lib/marketHours';

// ============ TYPES ============

export type Trade = {
  id: number;
  amount: number;
  type: 'BUY' | 'SELL';
  result: 'WIN' | 'LOSE';
  time: string;
  note?: string;
  tags?: string[];
  aiConfidence?: number;
  aiSignal?: 'BUY' | 'SELL' | 'HOLD';
};

export type Settings = {
  strategy: string;
  startAmount: number;
  maxAmount: number;
  steps: number;
};

export type Notification = {
  id: number;
  type: 'win' | 'lose' | 'target' | 'signal' | 'risk' | 'achievement';
  message: string;
  time: string;
  read: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
};

export type JournalEntry = {
  id: number;
  tradeId: number;
  note: string;
  tags: string[];
  createdAt: string;
};

export type CopyTrader = {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  totalProfit: number;
  followers: number;
  trades: number;
  isFollowing: boolean;
};

export type AISignal = {
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
  timeframe: string;
  timestamp: string;
};

export type HeatmapItem = {
  symbol: string;
  change: number;
  volume: number;
  price: number;
};

export type TimeframeAnalysis = {
  timeframe: string;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  strength: number;
};

export type ChatMessage = {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
};

export type BacktestResult = {
  totalTrades: number;
  wins: number;
  losses: number;
  netProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  recoveryFactor: number;
  equityCurve: number[];
};

export type UserAccount = {
  email: string;
  name: string;
  broker: string;
  accountType: 'DEMO' | 'REAL';
  accountNumber: string;
  server?: string;
  realBalance: number;
  demoBalance: number;
  currency: string;
  isLoggedIn: boolean;
};

export type AIAutoTradeConfig = {
  minConfidence: number;
  selectedAsset: string;
  timeframe: string;
  executionMode: 'FULL_AUTO' | 'SEMI_AUTO';
  baseOrderAmount: number;
  strategy: string;
  maxSteps: number;
  dailyTakeProfit: number;
  dailyStopLoss: number;
  maxConsecutiveLosses: number;
  newsFilter: boolean;
  autoStopOnTarget: boolean;
};

export type LiveBrokerState = {
  isLiveApiConnected: boolean;
  environment: 'PAPER' | 'LIVE';
  apiKey: string;
  apiSecret: string;
  serverOrPassphrase: string;
  webhookUrl: string;
  pingMs: number;
  lastSyncTime: string;
  currency: string;
  equity: number;
  unrealizedPnl: number;
  marginAvailable: number;
};

export const defaultBrokerLiveState: LiveBrokerState = {
  isLiveApiConnected: true,
  environment: 'LIVE',
  apiKey: 'exness_live_bridge_key',
  apiSecret: 'exness_sec_160187619',
  serverOrPassphrase: 'Exness-MT5Real',
  webhookUrl: 'https://my.exness.com/webtrading/',
  pingMs: 20,
  lastSyncTime: '17:48:00',
  currency: 'USC',
  equity: 1017.00,
  unrealizedPnl: 0,
  marginAvailable: 1017.00,
};

// ============ CONTEXT TYPE ============

type TradingContextType = {
  // Core
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  isAutoTrade: boolean;
  setIsAutoTrade: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  trades: Trade[];
  capital: number;
  setCapital: (v: number) => void;
  profit: number;
  setProfit: (v: number) => void;
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  syncBrokerBalance: (newBalance: number) => void;
  resetSessionData: () => void;
  activePanel: string;
  setActivePanel: (v: string) => void;

  // AI Pre-Trade Config
  aiConfig: AIAutoTradeConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AIAutoTradeConfig>>;
  isAiConfigModalOpen: boolean;
  setIsAiConfigModalOpen: (v: boolean) => void;
  startAiTradingWithConfig: (cfg?: AIAutoTradeConfig) => void;

  // Real Broker Live API
  brokerLiveState: LiveBrokerState;
  setBrokerLiveState: React.Dispatch<React.SetStateAction<LiveBrokerState>>;
  syncLiveBrokerAccount: (customCreds?: Partial<LiveBrokerState> & { customBalance?: number }) => Promise<boolean>;
  executeLiveBrokerOrder: (order: { symbol: string; side: 'BUY' | 'SELL'; amount: number }) => Promise<boolean>;

  // User Account & Login
  user: UserAccount;
  setUser: (u: UserAccount) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (v: boolean) => void;
  switchAccountType: (type: 'DEMO' | 'REAL') => void;
  login: (data: { 
    email: string; 
    broker: string; 
    accountType: 'DEMO' | 'REAL'; 
    accountNumber?: string;
    server?: string;
    balance?: number;
  }) => void;
  logout: () => void;

  // Language
  language: 'TH' | 'EN';
  setLanguage: (lang: 'TH' | 'EN') => void;

  // Targets (TP / SL)
  takeProfitTarget: number;
  setTakeProfitTarget: (v: number) => void;
  stopLossTarget: number;
  setStopLossTarget: (v: number) => void;
  targetAction: 'stop' | 'alert' | 'reset';
  setTargetAction: (v: 'stop' | 'alert' | 'reset') => void;

  // AI Signal
  aiSignal: AISignal;
  aiAccuracy: number;

  // Risk Manager
  consecutiveLosses: number;
  isCooldown: boolean;
  cooldownSeconds: number;
  dailyLossLimit: number;
  setDailyLossLimit: (v: number) => void;
  isTiltDetected: boolean;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Achievements
  achievements: Achievement[];
  xp: number;
  level: number;
  streak: number;
  addXp: (amount: number) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (tradeId: number, note: string, tags: string[]) => void;

  // Copy Trade
  copyTraders: CopyTrader[];
  followTrader: (id: string, options?: { copyRatio?: number; stopLossPercent?: number }) => void;
  unfollowTrader: (id: string) => void;

  // Heatmap
  heatmapData: HeatmapItem[];

  // Multi-timeframe
  timeframeAnalysis: TimeframeAnalysis[];

  // Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (msg: string) => void;

  // Backtest
  backtestResult: BacktestResult | null;
  runBacktest: (days: number) => void;
  isBacktesting: boolean;

  // Market Hours & Auto-Pause on Closed Market
  autoStopOnMarketClose: boolean;
  setAutoStopOnMarketClose: (v: boolean) => void;

  // Real-time Exness WebTrading (my.exness.com) Live Sync
  isExnessWebTradingLive: boolean;
  exnessLiveSyncTime: string;
  requestExnessWebSync: () => void;
};

// ============ DEFAULTS & MOCK DATA ============

const defaultSettings: Settings = {
  strategy: 'Anti-Martingale',
  startAmount: 100,
  maxAmount: 20000,
  steps: 4,
};

export const defaultAiConfig: AIAutoTradeConfig = {
  minConfidence: 80,
  selectedAsset: 'GOLD (XAU/USD)',
  timeframe: '5m',
  executionMode: 'FULL_AUTO',
  baseOrderAmount: 100,
  strategy: 'Anti-Martingale',
  maxSteps: 4,
  dailyTakeProfit: 3000,
  dailyStopLoss: 1500,
  maxConsecutiveLosses: 3,
  newsFilter: true,
  autoStopOnTarget: true,
};

const defaultAchievements: Achievement[] = [
  { id: 'first_trade', title: 'เทรดไม้แรก', description: 'เปิดออเดอร์ครั้งแรกสำเร็จ', icon: '🎯', unlocked: true, unlockedAt: '2026-09-28', progress: 1, target: 1 },
  { id: 'win_streak_5', title: 'ชนะ 5 ติด', description: 'ชนะติดต่อกัน 5 ไม้', icon: '🔥', unlocked: false, progress: 0, target: 5 },
  { id: 'win_streak_10', title: 'ชนะ 10 ติด', description: 'ชนะติดต่อกัน 10 ไม้', icon: '💎', unlocked: false, progress: 0, target: 10 },
  { id: 'profit_10k', title: 'กำไร 10K', description: 'ทำกำไรสะสม 10,000 บาท', icon: '💰', unlocked: false, progress: 0, target: 10000 },
  { id: 'profit_100k', title: 'กำไร 100K', description: 'ทำกำไรสะสม 100,000 บาท', icon: '🏆', unlocked: false, progress: 0, target: 100000 },
  { id: 'trades_100', title: 'เทรดครบ 100', description: 'เปิดออเดอร์ครบ 100 ไม้', icon: '📊', unlocked: false, progress: 0, target: 100 },
  { id: 'discipline', title: 'มีวินัย', description: 'เทรดตามแผนครบ 7 วันติด', icon: '🛡️', unlocked: false, progress: 0, target: 7 },
  { id: 'winrate_70', title: 'Win Rate 70%', description: 'Win Rate เกิน 70% ใน 50 ไม้', icon: '⭐', unlocked: false, progress: 0, target: 70 },
];

const defaultCopyTraders: CopyTrader[] = [
  { id: 'tr1', name: 'TraderKing_TH', avatar: '👑', winRate: 72.5, totalProfit: 1250000, followers: 1842, trades: 3200, isFollowing: false },
  { id: 'tr2', name: 'GoldMaster99', avatar: '🥇', winRate: 68.3, totalProfit: 890000, followers: 956, trades: 2100, isFollowing: false },
  { id: 'tr3', name: 'CryptoQueen', avatar: '👸', winRate: 65.1, totalProfit: 720000, followers: 2300, trades: 4500, isFollowing: false },
  { id: 'tr4', name: 'ScalpKing', avatar: '⚡', winRate: 71.8, totalProfit: 560000, followers: 780, trades: 8900, isFollowing: false },
  { id: 'tr5', name: 'BotWizard', avatar: '🤖', winRate: 63.4, totalProfit: 430000, followers: 1200, trades: 5600, isFollowing: false },
];

const defaultHeatmap: HeatmapItem[] = [
  { symbol: 'SP500', change: 1.2, volume: 85000, price: 5890.50 },
  { symbol: 'GOLD', change: -0.8, volume: 62000, price: 2650.30 },
  { symbol: 'EUR/USD', change: 0.3, volume: 45000, price: 1.0856 },
  { symbol: 'BTC/USD', change: 3.5, volume: 120000, price: 98500 },
  { symbol: 'ETH/USD', change: 2.1, volume: 78000, price: 4200 },
  { symbol: 'GBP/USD', change: -0.5, volume: 32000, price: 1.3420 },
  { symbol: 'USD/JPY', change: 0.7, volume: 55000, price: 149.85 },
  { symbol: 'NASDAQ', change: 1.8, volume: 95000, price: 20150 },
  { symbol: 'OIL', change: -1.2, volume: 41000, price: 71.20 },
  { symbol: 'SILVER', change: 0.9, volume: 28000, price: 31.50 },
  { symbol: 'AUD/USD', change: -0.3, volume: 22000, price: 0.6420 },
  { symbol: 'NZD/USD', change: 0.1, volume: 15000, price: 0.5980 },
];

const defaultTimeframes: TimeframeAnalysis[] = [
  { timeframe: '1m', trend: 'UP', strength: 65 },
  { timeframe: '5m', trend: 'UP', strength: 72 },
  { timeframe: '15m', trend: 'DOWN', strength: 45 },
  { timeframe: '1h', trend: 'UP', strength: 80 },
  { timeframe: '4h', trend: 'SIDEWAYS', strength: 50 },
  { timeframe: '1D', trend: 'UP', strength: 88 },
];

const defaultUser: UserAccount = {
  email: 'lighting6647@gmail.com',
  name: 'Light Cent',
  broker: 'Exness',
  accountType: 'REAL',
  accountNumber: '160187619',
  server: 'Exness-MT5Real20',
  realBalance: 1329.57,
  demoBalance: 100000,
  currency: 'USC',
  isLoggedIn: true,
};

// ============ CONTEXT ============

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  // Core States
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoTrade, setIsAutoTrade] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activePanel, setActivePanel] = useState('เทรดตรง AI');
  const [language, setLanguage] = useState<'TH' | 'EN'>('TH');

  // User Account & Login
  const [user, setUser] = useState<UserAccount>(defaultUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // TP / SL Targets
  const [takeProfitTarget, setTakeProfitTarget] = useState(5000);
  const [stopLossTarget, setStopLossTarget] = useState(2000);
  const [targetAction, setTargetAction] = useState<'stop' | 'alert' | 'reset'>('stop');

  // Separate states for Real and Demo accounts
  const [realCapital, setRealCapital] = useState<number>(1329.57);
  const [demoCapital, setDemoCapital] = useState<number>(100000);
  const [realProfit, setRealProfit] = useState<number>(0);
  const [demoProfit, setDemoProfit] = useState<number>(0);
  const [realTrades, setRealTrades] = useState<Trade[]>([]);
  const [demoTrades, setDemoTrades] = useState<Trade[]>([]);

  // AI Pre-Trade Config
  const [aiConfig, setAiConfig] = useState<AIAutoTradeConfig>({
    ...defaultAiConfig,
    baseOrderAmount: 10,
    dailyTakeProfit: 500,
    dailyStopLoss: 200,
  });
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);

  // Market Hours & Auto-Pause on Closed Market
  const [autoStopOnMarketClose, setAutoStopOnMarketClose] = useState<boolean>(true);

  // Real Broker Live API
  const [brokerLiveState, setBrokerLiveState] = useState<LiveBrokerState>(defaultBrokerLiveState);

  // Real-time Exness WebTrading (my.exness.com) Live Sync States
  const [isExnessWebTradingLive, setIsExnessWebTradingLive] = useState(false);
  const [exnessLiveSyncTime, setExnessLiveSyncTime] = useState<string>('');

  const requestExnessWebSync = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel("exness_trading_bot_pro");
        bc.postMessage({ action: 'REQUEST_ACCOUNT_SYNC', timestamp: Date.now() });
        setTimeout(() => bc.close(), 1200);
      } catch {}
    }
  }, []);

  // LocalStorage Persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedAutoStop = localStorage.getItem('trading_auto_stop_market_close');
      if (savedAutoStop !== null) setAutoStopOnMarketClose(savedAutoStop === 'true');

      const savedUser = localStorage.getItem('trading_user_account');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (!u.accountNumber || u.accountNumber.includes('7739210') || u.realBalance === 10000 || u.realBalance === 9995 || u.realBalance === 1017 || u.realBalance === 1030.52 || u.server === 'Exness-MT5Real') {
          u.accountNumber = '160187619';
          u.name = 'Light Cent';
          u.broker = 'Exness';
          u.server = 'Exness-MT5Real20';
          u.realBalance = 1329.57;
          u.currency = 'USC';
        }
        setUser(u);
        if (typeof u.realBalance === 'number') setRealCapital(u.realBalance);
        if (typeof u.demoBalance === 'number') setDemoCapital(u.demoBalance);
      }
      const savedRealCap = localStorage.getItem('trading_real_capital');
      if (savedRealCap) {
        const num = Number(savedRealCap);
        if (num === 10000 || num === 9995 || num === 1017 || num === 1030.52) {
          setRealCapital(1329.57);
        } else {
          setRealCapital(num);
        }
      }
      const savedRealProfit = localStorage.getItem('trading_real_profit');
      if (savedRealProfit) setRealProfit(Number(savedRealProfit));
      const savedRealTrades = localStorage.getItem('trading_real_trades');
      if (savedRealTrades) setRealTrades(JSON.parse(savedRealTrades));
      const savedAiConfig = localStorage.getItem('trading_bot_ai_config');
      if (savedAiConfig) setAiConfig(JSON.parse(savedAiConfig));
      const savedBrokerLive = localStorage.getItem('trading_broker_live_state');
      if (savedBrokerLive) setBrokerLiveState(JSON.parse(savedBrokerLive));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('trading_user_account', JSON.stringify(user));
      localStorage.setItem('trading_real_capital', realCapital.toString());
      localStorage.setItem('trading_real_profit', realProfit.toString());
      localStorage.setItem('trading_real_trades', JSON.stringify(realTrades));
      localStorage.setItem('trading_bot_ai_config', JSON.stringify(aiConfig));
      localStorage.setItem('trading_broker_live_state', JSON.stringify(brokerLiveState));
      localStorage.setItem('trading_auto_stop_market_close', autoStopOnMarketClose.toString());
    } catch {}
  }, [user, realCapital, realProfit, realTrades, aiConfig, brokerLiveState, autoStopOnMarketClose]);

  // Derived state based on active account type
  const isReal = user.accountType === 'REAL';
  const capital = isReal ? realCapital : demoCapital;
  const profit = isReal ? realProfit : demoProfit;
  const trades = isReal ? realTrades : demoTrades;

  const setCapital = useCallback((v: number) => {
    if (user.accountType === 'REAL') {
      setRealCapital(v);
      setUser(prev => ({ ...prev, realBalance: v }));
    } else {
      setDemoCapital(v);
      setUser(prev => ({ ...prev, demoBalance: v }));
    }
  }, [user.accountType]);

  const setProfit = useCallback((valOrFn: number | ((prev: number) => number)) => {
    if (user.accountType === 'REAL') {
      setRealProfit(prev => typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn);
    } else {
      setDemoProfit(prev => typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn);
    }
  }, [user.accountType]);

  const setTrades = useCallback((valOrFn: React.SetStateAction<Trade[]>) => {
    if (user.accountType === 'REAL') {
      setRealTrades(valOrFn);
    } else {
      setDemoTrades(valOrFn);
    }
  }, [user.accountType]);

  // AI Signal
  const [aiSignal, setAiSignal] = useState<AISignal>({
    direction: 'BUY',
    confidence: 78,
    reason: 'RSI oversold + MACD bullish crossover + Volume spike detected',
    timeframe: '5m',
    timestamp: '2026-09-29T11:55:00.000Z',
  });
  const [aiAccuracy] = useState(73.5);

  // Risk Manager
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [dailyLossLimit, setDailyLossLimit] = useState(50000);
  const [isTiltDetected, setIsTiltDetected] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'signal', message: 'AI ตรวจพบสัญญาณ BUY แรง (85% confidence)', time: '11:55:00', read: false },
    { id: 2, type: 'win', message: 'ชนะ! +2,125 บาท (ไม้ที่ 92)', time: '11:55:00', read: true },
  ]);

  // Achievements
  const [achievements] = useState<Achievement[]>(defaultAchievements);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [streak] = useState(3);

  // Journal
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Copy Trade
  const [copyTraders, setCopyTraders] = useState<CopyTrader[]>(defaultCopyTraders);

  // Heatmap
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>(defaultHeatmap);

  // Multi-timeframe
  const [timeframeAnalysis, setTimeframeAnalysis] = useState<TimeframeAnalysis[]>(defaultTimeframes);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'ai', content: 'สวัสดีครับ! ผมคือ AI Assistant ของ Trading Bot Pro พร้อมช่วยวิเคราะห์การเทรดให้ครับ 🤖', timestamp: '2026-09-29T11:55:00.000Z' },
  ]);

  // Backtest
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // Ref tracking for simulation stability
  const tradesRef = useRef(trades);
  tradesRef.current = trades;
  const profitRef = useRef(profit);
  profitRef.current = profit;
  const levelRef = useRef(level);
  levelRef.current = level;
  const xpRef = useRef(xp);
  xpRef.current = xp;
  const consecutiveLossesRef = useRef(consecutiveLosses);
  consecutiveLossesRef.current = consecutiveLosses;
  const lastMarketClosedAlertRef = useRef<number>(0);

  // ============ FUNCTIONS ============

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const uniqueId = Date.now() + Math.floor(Math.random() * 100000);
    setNotifications(prev => [{
      id: uniqueId,
      type,
      message,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      read: false,
    }, ...prev].slice(0, 50));
  }, []);

  // Global Listener for Exness WebTrading (my.exness.com) Broadcast & Messages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("exness_trading_bot_pro");
      bc.onmessage = (event) => {
        const data = event.data;
        if (data?.action === 'ACCOUNT_SYNC_FROM_EXNESS' && typeof data.balance === 'number' && !isNaN(data.balance) && data.balance > 0) {
          setIsExnessWebTradingLive(true);
          const timeStr = new Date().toLocaleTimeString('th-TH');
          setExnessLiveSyncTime(timeStr);
          setRealCapital(data.balance);
          setUser(prev => ({
            ...prev,
            realBalance: data.balance,
            accountNumber: data.accountNumber ? data.accountNumber.replace('#', '') : prev.accountNumber,
          }));
          addNotification('signal', `⚡ [Live Exness Sync] ดึงยอดเงินสดจาก my.exness.com สำเร็จ: ${data.balance.toLocaleString()} USC (Equity: ${data.equity || data.balance})`);
        }
      };
    } catch {}

    const handleWindowMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.action === 'ACCOUNT_SYNC_FROM_EXNESS' && typeof data.balance === 'number' && !isNaN(data.balance) && data.balance > 0) {
        setIsExnessWebTradingLive(true);
        const timeStr = new Date().toLocaleTimeString('th-TH');
        setExnessLiveSyncTime(timeStr);
        setRealCapital(data.balance);
        setUser(prev => ({
          ...prev,
          realBalance: data.balance,
          accountNumber: data.accountNumber ? data.accountNumber.replace('#', '') : prev.accountNumber,
        }));
        addNotification('signal', `⚡ [Live Exness Sync] ดึงยอดเงินสดจาก my.exness.com สำเร็จ: ${data.balance.toLocaleString()} USC`);
      }
    };

    window.addEventListener('message', handleWindowMessage);

    // Initial ping to see if Exness tab is already open
    requestExnessWebSync();

    return () => {
      if (bc) bc.close();
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [addNotification, requestExnessWebSync]);

  const switchAccountType = useCallback((type: 'DEMO' | 'REAL') => {
    setUser(prev => ({ ...prev, accountType: type }));
    addNotification('signal', `🔄 สลับเป็น ${type === 'REAL' ? 'บัญชีจริง (Real Account)' : 'บัญชีทดลอง (Practice/Demo)'}`);
  }, [addNotification]);

  const syncBrokerBalance = useCallback((newBalance: number) => {
    if (user.accountType === 'REAL') {
      setRealCapital(newBalance);
      setRealProfit(0);
      setRealTrades([]);
      setUser(prev => ({ ...prev, realBalance: newBalance }));
    } else {
      setDemoCapital(newBalance);
      setDemoProfit(0);
      setDemoTrades([]);
      setUser(prev => ({ ...prev, demoBalance: newBalance }));
    }
    setConsecutiveLosses(0);
    setIsCooldown(false);
    setIsTiltDetected(false);
    addNotification('signal', `🔄 ซิงค์ยอดเงินบัญชีจริงจากโบรกเกอร์: ${newBalance.toLocaleString()} USC`);
  }, [user.accountType, addNotification]);

  const resetSessionData = useCallback(() => {
    if (user.accountType === 'REAL') {
      setRealProfit(0);
      setRealTrades([]);
    } else {
      setDemoProfit(0);
      setDemoTrades([]);
    }
    setConsecutiveLosses(0);
    setIsCooldown(false);
    setIsTiltDetected(false);
    addNotification('signal', '🧹 รีเซ็ตข้อมูลรอบเทรดเป็น 0 เรียบร้อย พร้อมเริ่มเทรดใหม่');
  }, [user.accountType, addNotification]);

  // Live Broker API Sync
  const syncLiveBrokerAccount = useCallback(async (customCreds?: Partial<LiveBrokerState> & { customBalance?: number }): Promise<boolean> => {
    try {
      const credsToUse = { ...brokerLiveState, ...customCreds };
      const balanceToSend = customCreds?.customBalance !== undefined 
        ? customCreds.customBalance 
        : (user.accountType === 'REAL' ? realCapital : demoCapital);

      const res = await fetch('/api/broker/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: user.broker,
          environment: credsToUse.environment || (user.accountType === 'REAL' ? 'LIVE' : 'PAPER'),
          apiKey: credsToUse.apiKey,
          apiSecret: credsToUse.apiSecret,
          server: user.server || credsToUse.serverOrPassphrase,
          webhookUrl: credsToUse.webhookUrl,
          accountNumber: user.accountNumber,
          customBalance: balanceToSend,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setBrokerLiveState(prev => ({
          ...prev,
          isLiveApiConnected: true,
          pingMs: data.serverLatencyMs || 25,
          lastSyncTime: new Date().toLocaleTimeString('th-TH'),
          currency: data.currency || 'USC',
          equity: data.equity || data.balance,
          unrealizedPnl: data.unrealizedPnl || 0,
          marginAvailable: data.marginAvailable || data.balance,
        }));

        if (typeof data.balance === 'number' && !isNaN(data.balance)) {
          if (user.accountType === 'REAL') {
            setRealCapital(data.balance);
            setUser(prev => ({ ...prev, realBalance: data.balance }));
          } else {
            setDemoCapital(data.balance);
            setUser(prev => ({ ...prev, demoBalance: data.balance }));
          }
        }

        addNotification('signal', `🟢 ซิงค์พอร์ตจริง ${user.broker} สำเร็จ! Latency: ${data.serverLatencyMs || 25}ms | ทุน: ${(data.balance || capital).toLocaleString()} USC`);
        return true;
      } else {
        addNotification('risk', `⚠️ เชื่อมต่อพอร์ต ${user.broker} ไม่สำเร็จ: ${data?.error || 'กรุณาตรวจสอบ API Key'}`);
        return false;
      }
    } catch (err: any) {
      addNotification('risk', `❌ เกิดข้อผิดพลาดในการเชื่อมต่อ Broker API: ${err.message}`);
      return false;
    }
  }, [brokerLiveState, user, capital, realCapital, demoCapital, addNotification]);

  // Live Broker Order Execution
  const executeLiveBrokerOrder = useCallback(async (order: { symbol: string; side: 'BUY' | 'SELL'; amount: number }): Promise<boolean> => {
    // Check if Market is Closed
    if (autoStopOnMarketClose) {
      const market = getMarketStatus(order.symbol);
      if (!market.isOpen) {
        addNotification('risk', `🛑 ปฏิเสธการส่งคำสั่ง: ตลาด ${order.symbol} ปิดทำการ (${market.statusText})`);
        return false;
      }
    }

    try {
      const res = await fetch('/api/broker/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: user.broker,
          environment: brokerLiveState.environment || (user.accountType === 'REAL' ? 'LIVE' : 'PAPER'),
          apiKey: brokerLiveState.apiKey,
          apiSecret: brokerLiveState.apiSecret,
          server: user.server,
          webhookUrl: brokerLiveState.webhookUrl,
          accountNumber: user.accountNumber,
          symbol: order.symbol,
          side: order.side,
          amount: order.amount,
        }),
      });

      const data = await res.json();
      return !!(data && data.success);
    } catch {
      return false;
    }
  }, [brokerLiveState, user, autoStopOnMarketClose, addNotification]);

  const login = useCallback((data: { 
    email: string; 
    broker: string; 
    accountType: 'DEMO' | 'REAL'; 
    accountNumber?: string;
    server?: string;
    balance?: number;
  }) => {
    const assignedBalance = data.balance !== undefined && !isNaN(data.balance)
      ? data.balance
      : (data.accountType === 'REAL' ? 1017.00 : 100000);

    if (data.accountType === 'REAL') {
      setRealCapital(assignedBalance);
      setRealProfit(0);
      setRealTrades([]);
    } else {
      setDemoCapital(assignedBalance);
    }

    const accNum = data.accountNumber && !data.accountNumber.startsWith('ACC-')
      ? data.accountNumber
      : '160187619';

    setUser({
      email: data.email,
      name: data.email.split('@')[0],
      broker: data.broker,
      accountType: data.accountType,
      accountNumber: accNum,
      server: data.server || (data.broker === 'Exness' ? 'Exness-MT5Real' : 'Exness-MT5Real'),
      realBalance: data.accountType === 'REAL' ? assignedBalance : 1017.00,
      demoBalance: data.accountType === 'DEMO' ? assignedBalance : 100000,
      currency: data.broker === 'Exness' ? 'USC' : 'USC',
      isLoggedIn: true,
    });
    setIsLoginModalOpen(false);
    addNotification('signal', `🔐 เชื่อมต่อบัญชีสำเร็จ: ${data.email} (#${accNum}) ทุน: ${assignedBalance.toLocaleString()} USC`);
  }, [addNotification]);

  const logout = useCallback(() => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
    addNotification('signal', '🚪 ออกจากระบบเรียบร้อยแล้ว');
  }, [addNotification]);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addXp = useCallback((amount: number) => {
    setXp(prev => {
      const nextXp = prev + amount;
      const curLevel = levelRef.current;
      const targetXp = curLevel * 500;
      if (nextXp >= targetXp) {
        setLevel(l => l + 1);
        addNotification('achievement', `🎉 Level Up! คุณขึ้นสู่ Level ${curLevel + 1}!`);
      }
      return nextXp;
    });
  }, [addNotification]);

  const addJournalEntry = useCallback((tradeId: number, note: string, tags: string[]) => {
    setJournalEntries(prev => [{
      id: Date.now() + Math.floor(Math.random() * 1000),
      tradeId,
      note,
      tags,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const followTrader = useCallback((id: string, options?: { copyRatio?: number; stopLossPercent?: number }) => {
    setCopyTraders(prev => prev.map(t => t.id === id ? { ...t, isFollowing: true, followers: t.followers + 1 } : t));
    const traderName = copyTraders.find(t => t.id === id)?.name || 'Master Trader';
    const ratioText = options?.copyRatio ? ` (สัดส่วน ${options.copyRatio}%)` : '';
    addNotification('signal', `เริ่ม Copy Trade จาก ${traderName}${ratioText}`);
  }, [copyTraders, addNotification]);

  const unfollowTrader = useCallback((id: string) => {
    setCopyTraders(prev => prev.map(t => t.id === id ? { ...t, isFollowing: false, followers: Math.max(0, t.followers - 1) } : t));
    const traderName = copyTraders.find(t => t.id === id)?.name || 'Master Trader';
    addNotification('signal', `ยกเลิกการติดตาม ${traderName}`);
  }, [copyTraders, addNotification]);

  const sendChatMessage = useCallback((msg: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);

    // AI response simulation
    setTimeout(() => {
      let response = '';
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('วิเคราะห์') || lowerMsg.includes('กราฟ')) {
        response = `📊 วิเคราะห์ตลาดล่าสุด:\n\n• SP500 กำลังอยู่ในแนวโน้มขาขึ้น RSI อยู่ที่ 62 (ยังไม่ Overbought)\n• MACD เพิ่งตัดขึ้นเหนือ Signal Line → สัญญาณ Bullish\n• Volume สูงกว่าค่าเฉลี่ย 20 วัน 15%\n• แนวรับ: 5,850 | แนวต้าน: 5,920\n\n💡 แนะนำ: รอจังหวะ Pullback เข้า BUY ที่แนวรับ 5,860-5,870`;
      } else if (lowerMsg.includes('สรุป') || lowerMsg.includes('วันนี้')) {
        const curTrades = tradesRef.current;
        const curProfit = profitRef.current;
        const wins = curTrades.filter(t => t.result === 'WIN').length;
        const total = curTrades.length;
        response = `📋 สรุปผลเทรดวันนี้:\n\n• ออเดอร์ทั้งหมด: ${total} ไม้\n• ชนะ: ${wins} | แพ้: ${total - wins}\n• Win Rate: ${total > 0 ? ((wins/total)*100).toFixed(1) : 0}%\n• กำไร/ขาดทุน: ${curProfit > 0 ? '+' : ''}${curProfit.toLocaleString()} บาท\n\n${curProfit >= 0 ? '✅ วันนี้ทำได้ดีครับ!' : '⚠️ วันนี้ขาดทุนอยู่ ควรระวังการเทรดครับ'}`;
      } else if (lowerMsg.includes('ควร') || lowerMsg.includes('เข้า')) {
        response = `🤖 AI วิเคราะห์สัญญาณปัจจุบัน:\n\n• สัญญาณ: ${aiSignal.direction} (ความมั่นใจ ${aiSignal.confidence}%)\n• เหตุผล: ${aiSignal.reason}\n• Timeframe: ${aiSignal.timeframe}\n\n${aiSignal.confidence >= 75 ? '✅ สัญญาณค่อนข้างแรง แนะนำเข้าได้' : '⚠️ สัญญาณยังไม่แข็งแรงมาก ควรรอจังหวะที่ดีกว่า'}`;
      } else {
        response = `ผมเข้าใจคำถามของคุณครับ 🤖\n\nคุณสามารถถามผมได้เกี่ยวกับ:\n• "วิเคราะห์กราฟ" - วิเคราะห์ตลาดปัจจุบัน\n• "สรุปวันนี้" - สรุปผลเทรดวันนี้\n• "ควรเข้าไหม" - ดูสัญญาณ AI ล่าสุด\n\nลองถามมาได้เลยครับ!`;
      }
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 1000);
  }, [aiSignal]);

  const runBacktest = useCallback((days: number) => {
    setIsBacktesting(true);
    setTimeout(() => {
      const totalTrades = days * 15;
      const winRate = 0.48 + Math.random() * 0.2;
      const wins = Math.round(totalTrades * winRate);
      const losses = totalTrades - wins;
      const avgWin = settings.startAmount * 0.85;
      const avgLoss = settings.startAmount;
      const netProfit = (wins * avgWin) - (losses * avgLoss);

      const equityCurve: number[] = [];
      let equity = 0;
      let maxEquity = 0;
      let maxDD = 0;
      for (let i = 0; i < totalTrades; i++) {
        const isWin = Math.random() < winRate;
        equity += isWin ? avgWin : -avgLoss;
        equityCurve.push(equity);
        if (equity > maxEquity) maxEquity = equity;
        const dd = maxEquity - equity;
        if (dd > maxDD) maxDD = dd;
      }

      setBacktestResult({
        totalTrades,
        wins,
        losses,
        netProfit,
        maxDrawdown: Math.max(0, maxDD),
        sharpeRatio: parseFloat((netProfit / (maxDD || 1) * 0.5).toFixed(2)),
        recoveryFactor: parseFloat((netProfit / (maxDD || 1)).toFixed(2)),
        equityCurve,
      });
      setIsBacktesting(false);
      addNotification('signal', `Backtest เสร็จสิ้น: ${totalTrades} ออเดอร์ | กำไร ${netProfit > 0 ? '+' : ''}${netProfit.toFixed(0)}`);
    }, 1500);
  }, [settings.startAmount, addNotification]);

  const startAiTradingWithConfig = useCallback((cfg?: AIAutoTradeConfig) => {
    const activeCfg = cfg || aiConfig;
    if (cfg) {
      setAiConfig(cfg);
    }
    // Sync settings & targets to match user's pre-trade requirements
    setSettings(prev => ({
      ...prev,
      startAmount: activeCfg.baseOrderAmount,
      strategy: activeCfg.strategy,
      steps: activeCfg.maxSteps,
    }));
    setTakeProfitTarget(activeCfg.dailyTakeProfit);
    setStopLossTarget(activeCfg.dailyStopLoss);
    setDailyLossLimit(activeCfg.dailyStopLoss);

    // Turn on AI auto-trading
    setIsRunning(true);
    setIsAutoTrade(true);
    setIsAiConfigModalOpen(false);

    addNotification(
      'signal',
      `🚀 เริ่มรัน AI Auto-Trade: [${activeCfg.selectedAsset}] กลยุทธ์ ${activeCfg.strategy} | มั่นใจ ≥ ${activeCfg.minConfidence}% | ไม้ละ ฿${activeCfg.baseOrderAmount.toLocaleString()}`
    );
  }, [aiConfig, addNotification]);

  // ============ SIMULATION ============

  useEffect(() => {
    if (!isRunning || !isAutoTrade || isCooldown) return;

    const interval = setInterval(() => {
      // AI signal update
      const newConfidence = 50 + Math.random() * 45;
      const newDirection = newConfidence > 70 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : 'HOLD';
      const reasons = [
        'RSI oversold + MACD bullish crossover',
        'Bollinger Band squeeze breakout',
        'Volume spike + Price action confirmation',
        'Moving Average golden cross detected',
        'Support level bounce + Bullish divergence',
        'Trend continuation pattern detected',
      ];
      const roundedConf = Math.round(newConfidence);

      setAiSignal({
        direction: newDirection as 'BUY' | 'SELL' | 'HOLD',
        confidence: roundedConf,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        timeframe: aiConfig.timeframe || '5m',
        timestamp: new Date().toISOString(),
      });

      // Filter 0: Check Market Status & Auto-Stop when Market is Closed
      if (autoStopOnMarketClose) {
        const market = getMarketStatus(aiConfig.selectedAsset);
        if (!market.isOpen) {
          const now = Date.now();
          if (now - lastMarketClosedAlertRef.current > 300000) { // Alert at most once per 5 minutes
            lastMarketClosedAlertRef.current = now;
            addNotification('risk', `🛑 ตลาด [${aiConfig.selectedAsset}] ปิดทำการ (${market.statusText}) ระบบหยุดส่งคำสั่งชั่วคราวอัตโนมัติ`);
          }
          return; // Pause auto-trade execution while market is closed
        }
      }

      // Filter 1: Check HOLD
      if (newDirection === 'HOLD') return;

      // Filter 2: Check Pre-Trade Config Min Confidence requirement
      if (roundedConf < aiConfig.minConfidence) {
        return; // Skip trade if below user's minimum confidence requirement
      }

      // Filter 3: Semi-Auto mode checks can require user approval, but in auto mode it executes
      const isWin = Math.random() > 0.47;
      const type = newDirection as 'BUY' | 'SELL';
      const prevTrades = tradesRef.current;
      const nextId = prevTrades.length > 0 ? prevTrades[0].id + 1 : 1;
      const tradeAmount = aiConfig.baseOrderAmount || settings.startAmount;

      const newTrade: Trade = {
        id: nextId,
        amount: tradeAmount,
        type,
        result: isWin ? 'WIN' : 'LOSE',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        aiConfidence: roundedConf,
        aiSignal: newDirection as 'BUY' | 'SELL',
        note: `${aiConfig.selectedAsset} (${aiConfig.strategy})`,
        tags: [aiConfig.selectedAsset.split(' ')[0], aiConfig.strategy],
      };

      // Dispatch to Userscript Bridge for real Exness execution
      if (typeof window !== 'undefined') {
        const payload = {
          action: 'EXECUTE_ORDER',
          symbol: aiConfig.selectedAsset.includes('GOLD') ? 'XAUUSDm' : 'EURUSDm',
          side: type,
          lots: 0.01,
          amount: tradeAmount,
          accountNumber: user.accountNumber || '160187619',
          timestamp: Date.now(),
        };
        window.dispatchEvent(new CustomEvent('exness_order_dispatch', { detail: payload }));
        try {
          const bc = new BroadcastChannel("exness_trading_bot_pro");
          bc.postMessage(payload);
          bc.close();
        } catch {}
      }

      setTrades(prev => [newTrade, ...prev].slice(0, 100));
      const pnl = isWin ? tradeAmount * 0.85 : -tradeAmount;
      const newTotalProfit = profitRef.current + pnl;
      setProfit(newTotalProfit);

      // Handle win/loss consequences
      if (isWin) {
        addNotification('win', `ชนะ! +${(tradeAmount * 0.85).toFixed(0)} บาท [${aiConfig.selectedAsset}] (ไม้ที่ ${nextId})`);
        setConsecutiveLosses(0);
        addXp(50);
      } else {
        addNotification('lose', `แพ้ -${tradeAmount} บาท [${aiConfig.selectedAsset}] (ไม้ที่ ${nextId})`);
        const nextLossCount = consecutiveLossesRef.current + 1;
        setConsecutiveLosses(nextLossCount);

        const maxLossRule = aiConfig.maxConsecutiveLosses || 3;
        if (nextLossCount >= 5) {
          setIsTiltDetected(true);
          addNotification('risk', '⚠️ ตรวจพบ Tilt Mode! แนะนำให้หยุดพักเทรดเพื่อควบคุมอารมณ์');
        }

        if (nextLossCount >= maxLossRule) {
          setIsCooldown(true);
          setCooldownSeconds(300);
          addNotification('risk', `🛑 แพ้ ${maxLossRule} ไม้ติด (ตามกฎความเสี่ยงที่ตั้งไว้) → ระบบเปิด Cool-down พักเทรด 5 นาที`);
        }
      }

      // Check TP / SL Target limits
      const tpTarget = aiConfig.dailyTakeProfit || takeProfitTarget;
      const slTarget = aiConfig.dailyStopLoss || stopLossTarget;

      if (newTotalProfit >= tpTarget) {
        addNotification('target', `🎯 กำไรถึงเป้า TP Target (+${tpTarget.toLocaleString()} ฿) เรียบร้อยแล้ว!`);
        if (targetAction === 'stop' || aiConfig.autoStopOnTarget) {
          setIsRunning(false);
          addNotification('risk', '🛑 ระบบหยุดเทรดอัตโนมัติตามเงื่อนไขเป้ากำไร');
        }
      } else if (newTotalProfit <= -slTarget) {
        addNotification('target', `⚠️ ขาดทุนถึงจุดตัด SL Target (-${slTarget.toLocaleString()} ฿)`);
        if (targetAction === 'stop' || aiConfig.autoStopOnTarget) {
          setIsRunning(false);
          addNotification('risk', '🛑 ระบบหยุดเทรดอัตโนมัติตามเงื่อนไขตัดขาดทุน');
        }
      }

      // Daily Loss Limit check
      if (newTotalProfit <= -dailyLossLimit) {
        setIsRunning(false);
        addNotification('risk', `🚫 ขาดทุนเกิน Daily Loss Limit (${dailyLossLimit.toLocaleString()}) → สั่งหยุดระบบ`);
      }

      // Base XP per trade
      addXp(10);

      // Update heatmap randomly
      setHeatmapData(prev => prev.map(item => ({
        ...item,
        change: item.change + (Math.random() - 0.5) * 0.3,
        price: item.price * (1 + (Math.random() - 0.5) * 0.002),
      })));

      // Update timeframes
      setTimeframeAnalysis(prev => prev.map(tf => ({
        ...tf,
        strength: Math.max(10, Math.min(95, tf.strength + (Math.random() - 0.5) * 10)),
        trend: Math.random() > 0.8 ? (['UP', 'DOWN', 'SIDEWAYS'] as const)[Math.floor(Math.random() * 3)] : tf.trend,
      })));

    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, isAutoTrade, isCooldown, settings.startAmount, dailyLossLimit, takeProfitTarget, stopLossTarget, targetAction, addNotification, addXp, aiConfig]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!isCooldown) return;

    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          setIsCooldown(false);
          setIsTiltDetected(false);
          addNotification('signal', '✅ Cool-down สิ้นสุดแล้ว กลับมาพร้อมเทรดตามแผน');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCooldown, addNotification]);

  return (
    <TradingContext.Provider value={{
      isRunning, setIsRunning,
      isAutoTrade, setIsAutoTrade,
      isSettingsOpen, setIsSettingsOpen,
      settings, setSettings,
      trades, setTrades,
      capital, setCapital,
      profit, setProfit,
      syncBrokerBalance, resetSessionData,
      activePanel, setActivePanel,
      aiConfig, setAiConfig,
      isAiConfigModalOpen, setIsAiConfigModalOpen,
      startAiTradingWithConfig,
      brokerLiveState, setBrokerLiveState,
      syncLiveBrokerAccount, executeLiveBrokerOrder,
      user, setUser,
      isLoginModalOpen, setIsLoginModalOpen,
      switchAccountType, login, logout,
      language, setLanguage,
      takeProfitTarget, setTakeProfitTarget,
      stopLossTarget, setStopLossTarget,
      targetAction, setTargetAction,
      aiSignal, aiAccuracy,
      consecutiveLosses, isCooldown, cooldownSeconds,
      dailyLossLimit, setDailyLossLimit, isTiltDetected,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead, clearNotifications,
      achievements, xp, level, streak, addXp,
      journalEntries, addJournalEntry,
      copyTraders, followTrader, unfollowTrader,
      heatmapData,
      timeframeAnalysis,
      chatMessages, sendChatMessage,
      backtestResult, runBacktest, isBacktesting,
      autoStopOnMarketClose, setAutoStopOnMarketClose,
      isExnessWebTradingLive, exnessLiveSyncTime, requestExnessWebSync,
    }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
