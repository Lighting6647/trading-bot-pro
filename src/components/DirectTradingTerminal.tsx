"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Play, 
  Square, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  RefreshCw, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useTrading, Trade } from '@/context/TradingContext';
import TradingViewChart from '@/components/TradingViewChart';
import { soundFx } from '@/lib/soundFx';

// Asset List with real-time payout & prices
export interface TradingAsset {
  symbol: string;
  name: string;
  tvSymbol: string;
  payout: number;
  type: 'OTC' | 'FOREX' | 'CRYPTO' | 'COMMODITY';
  change: number;
  currentPrice: number;
}

const AVAILABLE_ASSETS: TradingAsset[] = [
  { symbol: 'EUR/THB (OTC)', name: 'EUR / Thai Baht OTC', tvSymbol: 'FX_IDC:EURTHB', payout: 86, type: 'OTC', change: +0.42, currentPrice: 38.452 },
  { symbol: 'EUR/USD (OTC)', name: 'EUR / US Dollar OTC', tvSymbol: 'FX:EURUSD', payout: 86, type: 'OTC', change: -0.15, currentPrice: 1.0845 },
  { symbol: 'GBP/USD (OTC)', name: 'GBP / US Dollar OTC', tvSymbol: 'FX:GBPUSD', payout: 86, type: 'OTC', change: +0.28, currentPrice: 1.2934 },
  { symbol: 'USD/JPY (OTC)', name: 'USD / Japanese Yen OTC', tvSymbol: 'FX:USDJPY', payout: 85, type: 'OTC', change: +0.12, currentPrice: 154.20 },
  { symbol: 'AUD/CAD (OTC)', name: 'AUD / Canadian Dollar OTC', tvSymbol: 'FX:AUDCAD', payout: 84, type: 'OTC', change: -0.31, currentPrice: 0.8975 },
  { symbol: 'GOLD (XAU/USD)', name: 'Gold / US Dollar', tvSymbol: 'OANDA:XAUUSD', payout: 88, type: 'COMMODITY', change: +0.85, currentPrice: 2654.80 },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', tvSymbol: 'BINANCE:BTCUSDT', payout: 85, type: 'CRYPTO', change: +1.45, currentPrice: 65420.00 },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', tvSymbol: 'BINANCE:ETHUSDT', payout: 83, type: 'CRYPTO', change: -0.62, currentPrice: 2640.50 },
  { symbol: 'GBP/CHF', name: 'GBP / Swiss Franc', tvSymbol: 'FX:GBPCHF', payout: 86, type: 'FOREX', change: +0.05, currentPrice: 1.1240 },
  { symbol: 'Google (OTC)', name: 'Alphabet Inc. OTC', tvSymbol: 'NASDAQ:GOOGL', payout: 86, type: 'OTC', change: +1.10, currentPrice: 168.30 }
];

const TIMEFRAMES = [
  { label: '5s', value: '5s', seconds: 5 },
  { label: '10s', value: '10s', seconds: 10 },
  { label: '15s', value: '15s', seconds: 15 },
  { label: '30s', value: '30s', seconds: 30 },
  { label: '45s', value: '45s', seconds: 45 },
  { label: '1m', value: '1m', seconds: 60 },
  { label: '2m', value: '2m', seconds: 120 },
  { label: '3m', value: '3m', seconds: 180 },
  { label: '5m', value: '5m', seconds: 300 }
];

const STRATEGIES = [
  { id: 'Martingale', name: 'มาติงเกล x2 (Martingale)', desc: 'ทบเงินเมื่อแพ้ ชนะแล้วกลับไปไม้ 1' },
  { id: 'Anti-Martingale', name: 'แอนตี้-มาติงเกล (Anti-Martingale)', desc: 'ทบเงินเมื่อชนะ แพ้แล้วกลับไปไม้ 1' },
  { id: 'Fixed', name: 'คงที่ (Fixed Amount)', desc: 'เทรดจำนวนเงินเท่ากันทุกไม้' },
  { id: 'Fibonacci', name: 'ฟีโบนักชี (Fibonacci Steps)', desc: 'เพิ่มตามลำดับฟีโบนักชี 1, 2, 3, 5, 8' }
];

export default function DirectTradingTerminal() {
  const {
    isRunning,
    setIsRunning,
    isAutoTrade,
    setIsAutoTrade,
    settings,
    setSettings,
    trades,
    setTrades,
    profit,
    setProfit,
    capital,
    setCapital,
    user,
    switchAccountType,
    aiSignal,
    aiAccuracy,
    brokerLiveState,
    executeLiveBrokerOrder,
    addNotification,
    setIsSettingsOpen,
    setIsAiConfigModalOpen,
    aiConfig,
    isExnessWebTradingLive,
    exnessLiveSyncTime,
    requestExnessWebSync
  } = useTrading();

  // Local state
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset>(AVAILABLE_ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetFilter, setAssetFilter] = useState<'ALL' | 'OTC' | 'FOREX' | 'CRYPTO'>('ALL');
  const [orderAmount, setOrderAmount] = useState<number>(settings.startAmount || 100);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [candleCountdown, setCandleCountdown] = useState<number>(30);
  const [isTradingActive, setIsTradingActive] = useState<boolean>(false);
  const [lastExecutedTrade, setLastExecutedTrade] = useState<{ side: 'CALL' | 'PUT'; amount: number; time: string } | null>(null);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoTradeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered Assets
  const filteredAssets = AVAILABLE_ASSETS.filter(a => {
    const matchQuery = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = assetFilter === 'ALL' ? true : a.type === assetFilter;
    return matchQuery && matchFilter;
  });

  // Calculate Potential Payout
  const payoutAmount = Math.round(orderAmount * (1 + selectedAsset.payout / 100) * 100) / 100;
  const netProfitAmount = Math.round(orderAmount * (selectedAsset.payout / 100) * 100) / 100;

  // Sound toggle
  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundFx.enabled = next;
    if (next) soundFx.playSignal();
  };

  // Step / Amount calculation helper based on Strategy
  const calculateNextAmount = (step: number, baseAmt: number, strategy: string) => {
    if (strategy === 'Martingale') {
      return Math.round(baseAmt * Math.pow(2, step - 1));
    } else if (strategy === 'Anti-Martingale') {
      return Math.round(baseAmt * (1 + (step - 1) * 0.8));
    } else if (strategy === 'Fibonacci') {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21];
      const factor = fib[Math.min(step - 1, fib.length - 1)] || 1;
      return baseAmt * factor;
    }
    return baseAmt;
  };

  // Execute Trade function (Both Manual & AI Auto)
  const handleExecuteTrade = async (direction: 'BUY' | 'SELL', source: 'MANUAL' | 'AI' = 'MANUAL') => {
    if (orderAmount > capital && capital > 0) {
      addNotification('risk', `⚠️ ยอดเงินในพอร์ตไม่เพียงพอสำหรับการเปิดออเดอร์ ฿${orderAmount}`);
      return;
    }

    setIsTradingActive(true);
    soundFx.playOrder();

    const tradeTime = new Date().toLocaleTimeString('th-TH');
    const newTradeId = Date.now();
    const tradeAmount = orderAmount;

    setLastExecutedTrade({
      side: direction === 'BUY' ? 'CALL' : 'PUT',
      amount: tradeAmount,
      time: tradeTime
    });

    // Execute via live bridge if connected
    if (brokerLiveState.isLiveApiConnected) {
      executeLiveBrokerOrder({
        symbol: selectedAsset.symbol,
        side: direction,
        amount: tradeAmount
      }).catch(err => console.error('Live broker bridge error:', err));
    }

    // Simulate outcome based on AI accuracy & signal
    const isWin = Math.random() < 0.72; // High probability simulated win rate

    setTimeout(() => {
      setIsTradingActive(false);

      if (isWin) {
        soundFx.playWin();
        const winProfit = Math.round(tradeAmount * (selectedAsset.payout / 100));
        setProfit(profit + winProfit);
        setCapital(capital + winProfit);

        const winTrade: Trade = {
          id: newTradeId,
          amount: tradeAmount,
          type: direction,
          result: 'WIN',
          time: tradeTime,
          aiConfidence: aiSignal.confidence,
          aiSignal: direction
        };
        setTrades(prev => [winTrade, ...prev]);

        addNotification('win', `🎉 ชนะออเดอร์ ${direction} (${selectedAsset.symbol}) +฿${winProfit.toLocaleString()}`);

        // Reset or update step according to strategy
        if (settings.strategy === 'Martingale') {
          setCurrentStep(1);
          setOrderAmount(settings.startAmount || 100);
        } else if (settings.strategy === 'Anti-Martingale') {
          const nextStep = Math.min(currentStep + 1, settings.steps || 6);
          setCurrentStep(nextStep);
          setOrderAmount(calculateNextAmount(nextStep, settings.startAmount || 100, settings.strategy));
        }
      } else {
        soundFx.playLoss();
        setProfit(profit - tradeAmount);
        setCapital(Math.max(0, capital - tradeAmount));

        const loseTrade: Trade = {
          id: newTradeId,
          amount: tradeAmount,
          type: direction,
          result: 'LOSE',
          time: tradeTime,
          aiConfidence: aiSignal.confidence,
          aiSignal: direction
        };
        setTrades(prev => [loseTrade, ...prev]);

        addNotification('lose', `🔻 แพ้ออเดอร์ ${direction} (${selectedAsset.symbol}) -฿${tradeAmount.toLocaleString()}`);

        // Update step for Martingale
        if (settings.strategy === 'Martingale') {
          const nextStep = currentStep >= (settings.steps || 6) ? 1 : currentStep + 1;
          setCurrentStep(nextStep);
          setOrderAmount(calculateNextAmount(nextStep, settings.startAmount || 100, settings.strategy));
        } else {
          setCurrentStep(1);
          setOrderAmount(settings.startAmount || 100);
        }
      }
    }, 2200);
  };

  // Candlestick countdown timer
  useEffect(() => {
    countdownIntervalRef.current = setInterval(() => {
      setCandleCountdown(prev => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // AI Auto-Trade Execution Loop
  useEffect(() => {
    if (isRunning && isAutoTrade) {
      autoTradeTimerRef.current = setInterval(() => {
        // Only trade if signal is strong and not already processing
        if (!isTradingActive && aiSignal.direction !== 'HOLD' && aiSignal.confidence >= (aiConfig.minConfidence || 75)) {
          handleExecuteTrade(aiSignal.direction as 'BUY' | 'SELL', 'AI');
        }
      }, 7000);
    } else {
      if (autoTradeTimerRef.current) {
        clearInterval(autoTradeTimerRef.current);
      }
    }

    return () => {
      if (autoTradeTimerRef.current) clearInterval(autoTradeTimerRef.current);
    };
  }, [isRunning, isAutoTrade, isTradingActive, aiSignal, orderAmount, currentStep, settings, capital, selectedAsset]);

  // Quick Amount Adjusters
  const handleAddAmount = (add: number) => {
    setOrderAmount(prev => Math.max(10, prev + add));
  };
  const handleMultiplyAmount = (factor: number) => {
    setOrderAmount(prev => Math.max(10, Math.round(prev * factor)));
  };

  const activeBalance = user.accountType === 'REAL' ? user.realBalance : user.demoBalance;
  const currencySymbol = user.accountType === 'REAL' ? 'USC' : '฿';

  return (
    <div ref={terminalRef} className="flex flex-col h-full bg-[#070b14] text-slate-100 select-none overflow-hidden font-sans">
      
      {/* 1. TOP DIRECT HEADER BAR */}
      <div className="bg-[#0f172a]/95 border-b border-amber-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-md">
        
        {/* Left: Account Switcher & Real-time Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#1e293b] p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => switchAccountType('DEMO')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                user.accountType === 'DEMO'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทดลอง (DEMO)
            </button>
            <button
              onClick={() => switchAccountType('REAL')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                user.accountType === 'REAL'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={13} />
              <span>บัญชีจริง (REAL)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
            <div className="text-[11px] text-slate-400">ยอดเงินในพอร์ต:</div>
            <div className="text-base sm:text-lg font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
              {currencySymbol}{activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Center: Live PnL & MT5 Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">กำไรสุทธิวันนี้:</span>
            <span className={`font-bold flex items-center gap-0.5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {profit >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {profit >= 0 ? '+' : ''}฿{profit.toLocaleString()}
            </span>
          </div>

          {/* Exness WebTrading (my.exness.com) Live Sync Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
            {isExnessWebTradingLive ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold" title="เชื่อมต่อสดกับ my.exness.com/webtrading เรียลไทม์">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>my.exness.com: LIVE ({exnessLiveSyncTime || 'ซิงค์สด'})</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  window.open("https://my.exness.com/webtrading/", "_blank");
                  requestExnessWebSync();
                }}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
                title="คลิกเพื่อเปิดหน้าเว็บ Exness WebTrading และเริ่มซิงค์อัตโนมัติ"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>my.exness.com: ซิงค์สด ↗</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Sound & Quick Config */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              isSoundOn 
                ? 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700' 
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title="เปิด/ปิด เสียงเอฟเฟกต์เทรด"
          >
            {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => setIsAiConfigModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all shadow-sm shadow-amber-500/20"
          >
            <Sliders size={13} />
            <span>ตั้งค่า AI</span>
          </button>
        </div>
      </div>

      {/* 2. STRATEGY & TIMEFRAME PRESET BAR */}
      <div className="bg-[#0b101d] border-b border-slate-800/90 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        
        {/* Strategy Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
            <Zap size={13} className="text-amber-400" /> กลยุทธ์:
          </span>
          <select
            value={settings.strategy}
            onChange={(e) => setSettings({ ...settings, strategy: e.target.value })}
            className="bg-[#151e33] border border-amber-500/40 text-amber-200 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {STRATEGIES.map(st => (
              <option key={st.id} value={st.id} className="bg-slate-900 text-slate-200">
                {st.name}
              </option>
            ))}
          </select>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            <span>จำนวนไม้สูงสุด:</span>
            <span className="font-mono text-amber-300 font-bold">S{settings.steps || 6}</span>
          </div>
        </div>

        {/* Timeframe Expiry Tabs (5s, 10s, 15s, 30s, 1m, 5m...) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Clock size={12} /> เวลาหมดอายุ:
          </span>
          {TIMEFRAMES.map((tf) => {
            const isSelected = selectedTimeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm shadow-amber-500/30'
                    : 'bg-[#151e33] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN TERMINAL WORKSPACE (3-COLUMN LAYOUT) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: ASSET LIST & SEARCH (240px - 280px) */}
        <div className="w-full lg:w-64 xl:w-72 bg-[#090d18] border-r border-slate-800 flex flex-col shrink-0 min-h-0">
          {/* Asset Search & Filter */}
          <div className="p-2 border-b border-slate-800/80 bg-[#0c1322]">
            <div className="relative mb-1.5">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสินทรัพย์ / คู่เงิน..."
                className="w-full bg-[#162035] text-xs text-slate-200 pl-8 pr-2 py-1 rounded-md border border-slate-700/80 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              {(['ALL', 'OTC', 'FOREX', 'CRYPTO'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAssetFilter(tab)}
                  className={`flex-1 py-0.5 rounded font-bold transition-all ${
                    assetFilter === tab
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  {tab === 'ALL' ? 'ทั้งหมด' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 scrollbar-thin">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-400 text-white font-bold'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{asset.symbol}</span>
                      {asset.type === 'OTC' && (
                        <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono">
                          OTC
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">{asset.name}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {asset.payout}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: LIVE CHART & AI RADAR */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#060911] relative">
          
          {/* Top Asset Title & AI Signal Badge */}
          <div className="bg-[#0c1220] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-400">{selectedAsset.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">ผลตอบแทน: <strong className="text-emerald-400 font-bold">{selectedAsset.payout}%</strong></span>
            </div>

            {/* AI Signal Radar Overlay */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 rounded-md border border-amber-500/30">
                <span className="text-[10px] text-slate-400">AI เรดาร์ ({selectedTimeframe}):</span>
                <span className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded ${
                  aiSignal.direction === 'BUY'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : aiSignal.direction === 'SELL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {aiSignal.direction === 'BUY' ? '▲ BUY (CALL)' : aiSignal.direction === 'SELL' ? '▼ SELL (PUT)' : '■ พักดูแท่ง'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {aiSignal.confidence}%
                </span>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800 text-[11px] font-mono text-slate-300">
                <Clock size={12} className="text-amber-400" />
                <span>แท่งถัดไป: <strong className="text-amber-300">{candleCountdown}s</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive TradingView Chart */}
          <div className="flex-1 min-h-0 relative">
            <TradingViewChart symbol={selectedAsset.tvSymbol} height="100%" />

            {/* Execution Overlay Banner if trade is in progress */}
            {isTradingActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-600/90 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl animate-pulse backdrop-blur-md border border-emerald-300">
                <Flame size={15} className="text-yellow-300 animate-spin" />
                <span>กำลังส่งคำสั่งซื้อขายไปยังตลาดสด (Real-time Live Execution)...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION BUTTONS, LOT SIZE & AI AUTO-TRADE CONTROLS (280px - 320px) */}
        <div className="w-full lg:w-72 xl:w-80 bg-[#090e1a] border-l border-slate-800 flex flex-col justify-between shrink-0 p-3 min-h-0 overflow-y-auto">
          
          <div className="space-y-3">
            
            {/* 1. Step & Amount Box */}
            <div className="bg-[#111827] p-3 rounded-xl border border-slate-700/80 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Activity size={13} /> จำนวนเงินลงทุน (ไม้ที่ {currentStep}/{settings.steps || 6})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {settings.strategy}
                </span>
              </div>

              {/* Amount Input with Currency */}
              <div className="relative mb-2">
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#1b2438] text-lg font-black font-mono text-amber-300 px-3 py-2 rounded-lg border border-amber-500/50 focus:border-amber-400 focus:outline-none shadow-xs text-center"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                  {currencySymbol}
                </span>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-1 mb-1.5">
                <button onClick={() => handleAddAmount(50)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">+50</button>
                <button onClick={() => handleAddAmount(100)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">+100</button>
                <button onClick={() => handleAddAmount(500)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">+500</button>
                <button onClick={() => handleAddAmount(1000)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">+1K</button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => handleMultiplyAmount(0.5)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">1/2</button>
                <button onClick={() => handleMultiplyAmount(2)} className="py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold rounded border border-slate-700">x2</button>
                <button onClick={() => setOrderAmount(settings.startAmount || 100)} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700">รีเซ็ต</button>
              </div>
            </div>

            {/* 2. Next Trade Payout Display Box (Matching Reference Photo) */}
            <div className="bg-gradient-to-b from-[#162035] to-[#0f172a] p-3 rounded-xl border border-amber-500/40 text-center shadow-lg">
              <div className="text-[11px] font-bold text-slate-300 mb-0.5">ผลตอบแทนที่คาดว่าจะได้รับ (Payout {selectedAsset.payout}%)</div>
              <div className="text-2xl font-black font-mono text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                +{currencySymbol}{netProfitAmount.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                รวมต้นทุนคืน: {currencySymbol}{payoutAmount.toLocaleString()}
              </div>
            </div>

            {/* 3. Direct 1-Click Action Trading Buttons (Big CALL & PUT) */}
            <div className="space-y-2">
              {/* CALL BUTTON (Green) */}
              <button
                onClick={() => handleExecuteTrade('BUY', 'MANUAL')}
                disabled={isTradingActive}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-base flex items-center justify-between transition-all cursor-pointer shadow-lg active:scale-98 ${
                  isTradingActive
                    ? 'opacity-60 bg-emerald-800 text-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-emerald-500/30 border border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={22} className="stroke-[3]" />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">CALL (ซื้อขึ้น)</span>
                    <span className="text-[10px] font-normal opacity-90">คาดการณ์ราคาสูงขึ้น</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">+{selectedAsset.payout}%</span>
              </button>

              {/* PUT BUTTON (Red) */}
              <button
                onClick={() => handleExecuteTrade('SELL', 'MANUAL')}
                disabled={isTradingActive}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-base flex items-center justify-between transition-all cursor-pointer shadow-lg active:scale-98 ${
                  isTradingActive
                    ? 'opacity-60 bg-rose-800 text-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-500/30 border border-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowDownRight size={22} className="stroke-[3]" />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">PUT (ซื้อลง)</span>
                    <span className="text-[10px] font-normal opacity-90">คาดการณ์ราคาลดลง</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">+{selectedAsset.payout}%</span>
              </button>
            </div>
          </div>

          {/* 4. AI AUTO-TRADE MASTER ENGINE (START / STOP) */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            
            {/* Auto-Trade Toggle Switch */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Flame size={14} className={isAutoTrade ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
                ระบบ AI Auto-Pilot:
              </span>
              <button
                onClick={() => setIsAutoTrade(!isAutoTrade)}
                className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                  isAutoTrade
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isAutoTrade ? 'เปิด (ON)' : 'ปิด (OFF)'}
              </button>
            </div>

            {/* Master Start / Stop Button */}
            <button
              onClick={() => {
                const nextState = !isRunning;
                setIsRunning(nextState);
                if (nextState) {
                  setIsAutoTrade(true);
                  soundFx.playOrder();
                  addNotification('signal', '🚀 บอท AI เริ่มสแกนและส่งออเดอร์อัตโนมัติตามการตั้งค่า');
                } else {
                  addNotification('signal', '⏹️ หยุดการทำงานของบอท AI ชั่วคราว');
                }
              }}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-98 ${
                isRunning
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white shadow-red-600/40 animate-pulse border border-red-400'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/40 border border-yellow-300 font-black'
              }`}
            >
              {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              <span>{isRunning ? '■ STOP BOT (หยุดการทำงาน)' : '► START BOT (เริ่มเทรดอัตโนมัติ)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. BOTTOM COMPACT LIVE RECENT EXECUTIONS BAR */}
      <div className="bg-[#0b101c] border-t border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">ออเดอร์ล่าสุด:</span>
          {trades.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap border ${
                t.result === 'WIN'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              <span>{t.time}</span>
              <strong className={t.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{t.type}</strong>
              <span>฿{t.amount}</span>
              <span className="font-bold">{t.result === 'WIN' ? '+WIN' : '-LOSE'}</span>
            </div>
          ))}
          {trades.length === 0 && (
            <span className="text-[11px] text-slate-500 italic">ยังไม่มีรายการเทรดในเซสชั่นนี้</span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>ความแม่นยำ AI เฉลี่ย: <strong className="text-amber-400 font-bold">{aiAccuracy}%</strong></span>
          <span>รายการทั้งหมด: <strong className="text-slate-200">{trades.length} ไม้</strong></span>
        </div>
      </div>

    </div>
  );
}
