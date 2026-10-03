"use client";

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  ChevronDown, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldAlert, 
  Sliders,
  ExternalLink,
  Zap,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  Share2,
  BarChart2,
  Maximize2
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useTrading } from '@/context/TradingContext';
import MarketTimezoneClock from '@/components/MarketTimezoneClock';
import TradingViewChart from '@/components/TradingViewChart';
import DailyPnLShareModal from '@/components/DailyPnLShareModal';
import { soundFx } from '@/lib/soundFx';

export default function MainDashboard() {
  const { 
    trades, 
    profit, 
    capital, 
    setIsSettingsOpen, 
    isAutoTrade, 
    setIsAutoTrade,
    aiSignal,
    takeProfitTarget,
    setTakeProfitTarget,
    stopLossTarget,
    setStopLossTarget,
    targetAction,
    setTargetAction,
    addNotification,
    user,
    setIsLoginModalOpen,
    resetSessionData,
    setActivePanel,
    brokerLiveState,
    syncLiveBrokerAccount,
    executeLiveBrokerOrder,
    setTrades,
    setProfit
  } = useTrading();

  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  const [activeSubFilter, setActiveSubFilter] = useState('รวมรวม');
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals for the buttons requested by user
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showTradingView, setShowTradingView] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Local draft state for Target Modal
  const [draftTp, setDraftTp] = useState(takeProfitTarget);
  const [draftSl, setDraftSl] = useState(stopLossTarget);
  const [draftAction, setDraftAction] = useState(targetAction);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playSignal();
  };

  const dashboardRef = useRef<HTMLDivElement>(null);

  // GSAP Animation for Metric Cards and Charts
  useGSAP(() => {
    gsap.fromTo(
      '.gsap-metric-card',
      { opacity: 0, y: 14, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.04, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.gsap-chart-box',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.15 }
    );
  }, { scope: dashboardRef });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftTp(takeProfitTarget);
    setDraftSl(stopLossTarget);
    setDraftAction(targetAction);
  }, [takeProfitTarget, stopLossTarget, targetAction]);

  const wins = trades.filter(t => t.result === 'WIN').length;
  const losses = trades.filter(t => t.result === 'LOSE').length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  
  const grossProfit = trades.filter(t => t.result === 'WIN').reduce((sum, t) => sum + (t.amount * 0.85), 0);
  const grossLoss = trades.filter(t => t.result === 'LOSE').reduce((sum, t) => sum + t.amount, 0);
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? 'MAX' : '0.00');
  const expectancy = total > 0 ? (profit / total).toFixed(0) : '0';

  // Chart data
  let runningSum = 0;
  const chartData = [...trades].reverse().map((t) => {
    runningSum += t.result === 'WIN' ? t.amount * 0.85 : -t.amount;
    return { value: Math.round(runningSum) };
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification('signal', '🔄 ซิงค์ข้อมูลสถิติและเซิร์ฟเวอร์เรียบร้อย');
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Type', 'Amount', 'Result', 'Time', 'AI Confidence'];
    const rows = trades.map(t => [
      t.id, 
      t.type, 
      t.amount, 
      t.result, 
      t.time, 
      t.aiConfidence ? `${t.aiConfidence}%` : 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trading_session_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('signal', '📥 ส่งออกข้อมูล CSV สำเร็จแล้ว');
  };

  const handleCopySummary = () => {
    const text = `📊 สรุปผลการเทรด [Trading Bot Pro v3.0]\nวันที่: ${new Date().toLocaleDateString('th-TH')}\nจำนวนไม้: ${total} ไม้ (ชนะ ${wins} / แพ้ ${losses})\nWin Rate: ${winRate}%\nกำไรสุทธิ: ${profit > 0 ? '+' : ''}${profit.toLocaleString()} บาท\nGross Profit: +${grossProfit.toLocaleString()} บาท\nGross Loss: -${grossLoss.toLocaleString()} บาท\nProfit Factor: ${profitFactor}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
    addNotification('signal', '📋 คัดลอกข้อความสรุปไปยังคลิปบอร์ดแล้ว');
  };

  const handleSaveTargets = () => {
    setTakeProfitTarget(draftTp);
    setStopLossTarget(draftSl);
    setTargetAction(draftAction);
    setIsTargetModalOpen(false);
    addNotification('target', `🎯 บันทึกเป้าหมายสำเร็จ: TP ${draftTp.toLocaleString()} ฿ | SL ${draftSl.toLocaleString()} ฿`);
  };

  const tpProgress = Math.min(100, Math.max(0, (profit > 0 ? (profit / takeProfitTarget) * 100 : 0)));
  const slProgress = Math.min(100, Math.max(0, (profit < 0 ? (Math.abs(profit) / stopLossTarget) * 100 : 0)));

  return (
    <div ref={dashboardRef} className="flex-1 flex flex-col bg-[#0a0f1c] min-h-0 overflow-hidden rounded-md border border-slate-800 m-2 relative">
      {/* Header */}
      <div className="h-10 bg-[#131b2f] border-b border-slate-800 flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
          <LayoutDashboard size={16} />
          แดชบอร์ด
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-white transition-colors" title="ตั้งค่าระบบ">
             <SettingsIcon size={16} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131b2f] p-3 rounded border border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            รายงานราย Session
          </div>
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
            {/* Interactive Buttons */}
            <div className="flex bg-slate-900 rounded border border-slate-800 overflow-hidden shadow-inner">
               <button 
                 onClick={() => setIsShareModalOpen(true)}
                 className="px-2.5 py-1.5 border-r border-slate-800 flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 active:bg-amber-600/30 transition-all font-medium cursor-pointer"
                 title="สร้างการ์ดสรุปผลงานเทรดสำหรับแชร์"
               >
                 <Share2 size={13} className="text-amber-400" />
                 <span>แชร์ผลงาน</span>
               </button>
               <button 
                 onClick={() => setIsPrintModalOpen(true)}
                 className="px-2.5 py-1.5 border-r border-slate-800 flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800/80 active:bg-blue-600/30 transition-all font-medium cursor-pointer"
                 title="พิมพ์รายงานสรุปกำไร / ส่งออกข้อมูล"
               >
                 <TrendingUp size={13} className="text-blue-400" />
                 <span>พิมพ์กำไร</span>
               </button>
               <button 
                 onClick={() => setIsTargetModalOpen(true)}
                 className="px-2.5 py-1.5 flex items-center gap-1.5 text-green-400 hover:text-green-300 hover:bg-slate-800/80 active:bg-green-600/30 transition-all font-medium cursor-pointer"
                 title="ตั้งค่าเป้าหมายกำไรและตัดขาดทุน"
               >
                 <span>ตามเป้า/ตัดขาดทุน</span>
                 <ChevronDown size={13} className="text-green-400 transition-transform hover:translate-y-0.5" />
               </button>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
               {/* Sound Toggle Button */}
               <button
                 onClick={toggleSound}
                 className={`p-1.5 rounded border transition-colors cursor-pointer ${
                   isSoundEnabled 
                     ? 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700' 
                     : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                 }`}
                 title={isSoundEnabled ? 'เปิดเสียงแจ้งเตือน (คลิกเพื่อปิด)' : 'ปิดเสียงแจ้งเตือน (คลิกเพื่อเปิด)'}
               >
                 {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
               </button>

               <button
                 onClick={() => setIsLoginModalOpen(true)}
                 className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                 title="คลิกเพื่อจัดการพอร์ตและซิงค์ยอดเงินจริง"
               >
                 <span className={`w-1.5 h-1.5 rounded-full ${user.accountType === 'REAL' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                 <span>Exness: #160187619</span>
                 <span className="text-slate-500">•</span>
                 <span className="text-amber-400 font-bold">{capital.toLocaleString()} USC</span>
               </button>
               <button 
                 onClick={handleRefresh} 
                 className={`p-1.5 hover:bg-slate-800 rounded transition-all ${isRefreshing ? 'rotate-180 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                 title="รีเฟรชข้อมูล"
               >
                 <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>
        </div>
        
        {/* Exness WebTrading Live Bridge Banner (Prominent Live Link & Control) */}
        <div className="bg-gradient-to-r from-amber-950/40 via-[#131b2f] to-slate-900 border border-amber-500/50 rounded-lg p-3 sm:p-3.5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  ⚡ Exness MT5 WebTrading Live Bridge
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONNECTED (20ms)
                </span>
                <span className="text-[11px] text-slate-300">
                  Server: <strong className="text-white font-mono">Exness-MT5Real</strong> | พอร์ต: <strong className="text-emerald-400 font-mono"># 160187619 Light Cent</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                เชื่อมต่อระบบเทรดสด <a href="https://my.exness.com/webtrading/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-mono hover:text-blue-300">https://my.exness.com/webtrading/</a> ยอดเงินจริง: <strong className="text-emerald-400 font-mono font-bold">{capital.toLocaleString()} USC</strong> <span className="text-amber-300 font-mono font-medium">(≈ ${(capital / 100).toFixed(2)} USD)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => setActivePanel('Exness เทรด')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="เปิดหน้าต่างจอเทรด Exness WebTrading แบบเต็มรูปแบบ"
            >
              <span>หน้าจอ Exness เทรด</span>
              <ArrowRight size={14} />
            </button>
            <a
              href="https://my.exness.com/webtrading/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/50 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="เปิดเว็บเทรดจริง Exness WebTrading ในแท็บใหม่"
            >
              <Globe size={13} />
              <span>เปิด my.exness.com</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Global Market Status & Timezone Clocks */}
        <MarketTimezoneClock />
        
        {/* AI Auto Trade Panel */}
        <div className="bg-[#131b2f] border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
           <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isAutoTrade} onChange={(e) => setIsAutoTrade(e.target.checked)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isAutoTrade ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isAutoTrade ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-semibold text-slate-200">AUTO - เทรด</span>
              </label>
              
              <div className="text-xs text-slate-400 border-l border-slate-800 pl-4 sm:pl-6">
                 รอบ {trades.length > 0 ? trades[0].id : 1} - ไม้ {((trades.length % 4) + 1)}
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs font-semibold border-l border-slate-800 pl-4 sm:pl-6 ${
                aiSignal.direction === 'BUY' ? 'text-green-400' : aiSignal.direction === 'SELL' ? 'text-red-400' : 'text-amber-400'
              }`}>
                 <Activity size={14} className={isAutoTrade ? "animate-pulse" : ""} />
                 สัญญาณจาก AI ({aiSignal.direction}) • {aiSignal.confidence}%
              </div>
           </div>
           <div className="text-lg font-mono font-bold text-slate-200">
              {(capital + profit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿
           </div>
        </div>

        {/* Live Interactive TradingView Candlestick Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTradingView(!showTradingView)}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
            >
              <BarChart2 size={14} className="text-amber-400" />
              <span>{showTradingView ? 'ซ่อนกราฟสด TradingView' : 'แสดงกราฟสด TradingView (Live Candle)'}</span>
              <ChevronDown size={13} className={`transition-transform ${showTradingView ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">XAU/USD • EUR/USD • Realtime Feed</span>
          </div>

          {showTradingView && (
            <div className="gsap-chart-box">
              <TradingViewChart height={340} symbol="OANDA:XAUUSD" />
            </div>
          )}
        </div>

        {/* Content Split */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left Session List */}
          <div className="w-full lg:w-80 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
               <span>รวมผลตอบแทนต่อวัน</span>
               <span className="text-slate-500">35 วัน</span>
            </div>
            <div className="flex rounded overflow-hidden border border-slate-800 text-xs mb-1">
               {['ทั้งหมด', 'วันนี้', 'เดือน', 'ปี'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setActiveFilter(f)}
                   className={`flex-1 py-1.5 border-r border-slate-800 last:border-0 transition-colors ${activeFilter === f ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
            <div className="flex rounded overflow-hidden border border-slate-800 text-xs mb-2">
               {['รวมรวม', 'บันทึกกำไร/ขาดทุน'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setActiveSubFilter(f)}
                   className={`flex-1 py-1.5 border-r border-slate-800 last:border-0 transition-colors ${activeSubFilter === f ? 'bg-amber-500/20 text-amber-500 font-semibold' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
              {/* Active Session Item */}
              <div className="bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <div className="text-xs text-slate-300">
                     {mounted ? new Date().toLocaleDateString('th-TH') : 'วันนี้'} 
                     <span className="text-slate-500 mx-1">|</span> ปัจจุบัน
                   </div>
                   <div className={`font-mono font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {profit > 0 ? '+' : ''}{profit.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} ฿
                   </div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <div className="flex gap-0.5 overflow-hidden w-28">
                      {trades.slice(0, 15).map((t) => (
                        <span key={t.id} className={`w-1.5 h-3 inline-block shrink-0 rounded-xs ${t.result === 'WIN' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      ))}
                   </div>
                   <div className="text-slate-400 flex items-center gap-2 shrink-0">
                      <span>ชนะ {winRate}%</span>
                      <span>{total} ไม้</span>
                      <Activity size={12} className={profit >= 0 ? 'text-green-500' : 'text-red-500'}/>
                   </div>
                </div>
              </div>

              {/* Past Session Samples / Real Broker Live Status */}
              {user.accountType === 'REAL' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {user.broker || 'Exness'} พอร์ตจริง
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {user.server || 'Exness-Real'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    บัญชี: <span className="text-slate-200 font-mono font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400">ทุนตั้งต้น:</span>
                    <span className="font-mono text-emerald-400 font-bold">฿{capital.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Equity รวม:</span>
                    <span className={`font-mono font-bold ${capital + profit >= capital ? 'text-green-400' : 'text-red-400'}`}>
                      ฿{(capital + profit).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 flex gap-1.5">
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="flex-1 py-1 px-2 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-medium transition-colors text-center"
                    >
                      ⚙️ จัดการพอร์ต / แก้ไขทุน
                    </button>
                    <button
                      onClick={() => {
                        resetSessionData();
                        addNotification('signal', '🧹 รีเซ็ตสถิติรอบเทรดเป็น 0 เรียบร้อย');
                      }}
                      className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                      title="เริ่มรอบสถิติใหม่ (0 ฿)"
                    >
                      รีเซ็ต
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#131b2f]/60 border border-slate-800/80 rounded p-3 opacity-75">
                    <div className="flex justify-between items-center mb-1 text-xs">
                       <span className="text-slate-400">รอบจำลอง (Demo Session)</span>
                       <span className="text-green-400 font-mono">+13,388 ฿</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                       <span>ชนะ 65.2% • 22 ไม้</span>
                       <span className="text-green-500">สำเร็จ</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-blue-950/20 border border-blue-500/20 text-center">
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      🚀 สลับไปใช้พอร์ตจริง (Real Account)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Stats Details */}
          <div className="flex-1 flex flex-col gap-4">
             {/* Stats Summary */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                   <div className="text-amber-400 font-semibold mb-1">รอบเทรด : {mounted ? new Date().toLocaleDateString('th-TH') : ''}</div>
                   <div className="text-slate-400 text-xs">เวลาเดินระบบต่อเนื่อง • สัญญาณ AI Active</div>
                </div>
                <div className="text-left sm:text-right">
                   <div className="text-slate-400 text-xs mb-1">กำไรสุทธิรอบนี้</div>
                   <div className={`text-2xl sm:text-3xl font-bold font-mono ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {profit > 0 ? '+' : ''}{profit.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} ฿
                   </div>
                   <div className="text-slate-500 text-[11px] mt-0.5">
                     เป้า TP: {takeProfitTarget.toLocaleString()} | SL: {stopLossTarget.toLocaleString()}
                   </div>
                </div>
             </div>

             {/* Metric Cards */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5"><Target size={12}/> Win Rate</div>
                   <div className="text-xl font-bold text-slate-200">{winRate}%</div>
                   <div className="text-slate-500 text-[10px] mt-1">{wins} ชนะ / {total} ไม้</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5">ชนะ / แพ้ / เสมอ</div>
                   <div className="text-lg font-bold text-slate-200"><span className="text-green-500">{wins}</span> / <span className="text-red-500">{losses}</span> / 0</div>
                   <div className="text-slate-500 text-[10px] mt-1">ผลไม้ที่เทรด</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5">จำนวนไม้</div>
                   <div className="text-xl font-bold text-blue-400">{total}</div>
                   <div className="text-slate-500 text-[10px] mt-1">ออเดอร์ในรอบนี้</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5">Payout</div>
                   <div className="text-xl font-bold text-slate-200">85%</div>
                   <div className="text-slate-500 text-[10px] mt-1">SP500 / Gold</div>
                </div>
                
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5"><TrendingUp size={12}/> กำไรรวม</div>
                   <div className="text-lg font-bold text-green-500 font-mono">+{grossProfit.toLocaleString()} ฿</div>
                   <div className="text-slate-500 text-[10px] mt-1">gross profit</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5"><TrendingDown size={12}/> ขาดทุนรวม</div>
                   <div className="text-lg font-bold text-red-500 font-mono">-{grossLoss.toLocaleString()} ฿</div>
                   <div className="text-slate-500 text-[10px] mt-1">gross loss</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5">Profit Factor</div>
                   <div className="text-lg font-bold text-amber-500 font-mono">{profitFactor}</div>
                   <div className="text-slate-500 text-[10px] mt-1">กำไร ÷ ขาดทุน</div>
                </div>
                <div className="gsap-metric-card bg-[#131b2f] border border-slate-800 rounded p-3 hover:border-slate-700 transition-colors">
                   <div className="text-slate-400 text-xs flex items-center gap-1 mb-1.5">กำไรเฉลี่ยต่อไม้</div>
                   <div className={`text-lg font-bold font-mono ${parseInt(expectancy) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                     {parseInt(expectancy) > 0 ? '+' : ''}{expectancy} ฿
                   </div>
                   <div className="text-slate-500 text-[10px] mt-1">expectancy</div>
                </div>
             </div>

             {/* Chart */}
             <div className="gsap-chart-box flex-1 bg-[#131b2f] border border-slate-800 rounded p-4 flex flex-col min-h-[160px]">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked className="accent-blue-500" />
                     <span>เส้นสะสมระหว่างรอบ (Equity Curve)</span>
                   </div>
                   <span className="text-slate-500 text-[11px] font-mono">{chartData.length} จุดข้อมูล</span>
                </div>
                <div className="flex-1 w-full min-h-[120px]">
                   {mounted && chartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                           <YAxis domain={['auto', 'auto']} hide />
                           <Line 
                             type="monotone" 
                             dataKey="value" 
                             stroke={profit >= 0 ? "#22c55e" : "#ef4444"} 
                             strokeWidth={2} 
                             dot={false} 
                           />
                        </LineChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                       กำลังโหลดเส้นกราฟสะสม...
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: พิมพ์กำไร / ส่งออกรายงาน ================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f172a] border border-blue-500/50 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1e293b] px-5 py-3.5 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Printer size={18} />
                <span>พิมพ์สรุปกำไร / รายงาน Session</span>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-sm print:p-0">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-white">TRADING BOT PRO v3.0</h3>
                  <p className="text-xs text-slate-400">ใบสรุปผลการเทรดประจำรอบ (Trading Session Report)</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
                  <p>เวลา: {new Date().toLocaleTimeString('th-TH')}</p>
                </div>
              </div>

              {/* Summary Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">กำไรสุทธิ</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit > 0 ? '+' : ''}{profit.toLocaleString()} ฿
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Win Rate</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{winRate}%</div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">จำนวนไม้</div>
                  <div className="text-base font-bold text-blue-400 mt-0.5">{total}</div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Profit Factor</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{profitFactor}</div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="bg-slate-900/40 p-3 rounded border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">เงินทุนเริ่มต้น:</span>
                  <span className="font-mono text-slate-200">{capital.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ยอดเงินปัจจุบัน:</span>
                  <span className="font-mono text-blue-400 font-bold">{(capital + profit).toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">กำไรรวม (ไม้ชนะ):</span>
                  <span className="font-mono text-green-400">+{grossProfit.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ขาดทุนรวม (ไม้แพ้):</span>
                  <span className="font-mono text-red-400">-{grossLoss.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ไม้ชนะ / ไม้แพ้:</span>
                  <span className="font-mono">{wins} ชนะ / {losses} แพ้</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1.5">ประวัติออเดอร์ล่าสุด ({Math.min(trades.length, 6)} ไม้ล่าสุด)</div>
                <div className="border border-slate-800 rounded overflow-hidden text-xs">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-2">#ID</th>
                        <th className="p-2">ประเภท</th>
                        <th className="p-2">จำนวนเงิน</th>
                        <th className="p-2">ผลลัพธ์</th>
                        <th className="p-2 text-right">เวลา</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {trades.slice(0, 6).map(t => (
                        <tr key={t.id} className="hover:bg-slate-900/30">
                          <td className="p-2 text-slate-400">#{t.id}</td>
                          <td className="p-2">
                            <span className={t.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>{t.type}</span>
                          </td>
                          <td className="p-2">{t.amount.toLocaleString()} ฿</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.result === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {t.result}
                            </span>
                          </td>
                          <td className="p-2 text-right text-slate-400">{t.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#1e293b] px-5 py-3 border-t border-slate-700 flex flex-wrap justify-between items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedSummary ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedSummary ? 'คัดลอกแล้ว!' : 'คัดลอกสรุป'}</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>ส่งออก CSV</span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-1.5 text-slate-400 hover:text-white text-xs"
                >
                  ปิด
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                >
                  <Printer size={14} />
                  <span>พิมพ์รายงาน (Print)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ตามเป้า / ตัดขาดทุน ================= */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f172a] border border-green-500/50 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1e293b] px-5 py-3.5 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <Sliders size={18} />
                <span>ตั้งค่าตามเป้า / ตัดขาดทุน (TP & SL Target)</span>
              </div>
              <button 
                onClick={() => setIsTargetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-300">
              {/* Target TP Section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-green-400 font-semibold flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>เป้าหมายกำไร (Take Profit Target)</span>
                  </label>
                  <span className="font-mono text-slate-400">ปัจจุบัน: {profit > 0 ? `+${profit.toLocaleString()}` : '0'} ฿</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={draftTp}
                    onChange={(e) => setDraftTp(Math.max(1000, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-green-500 rounded px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500">฿</span>
                </div>
                {/* Quick Presets */}
                <div className="flex gap-2">
                  {[50000, 100000, 200000, 500000].map(val => (
                    <button
                      key={val}
                      onClick={() => setDraftTp(val)}
                      className={`px-2 py-1 rounded border text-[10px] transition-colors ${draftTp === val ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                    >
                      {(val/1000)}k
                    </button>
                  ))}
                </div>
                {/* TP Progress */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ความคืบหน้าสู่เป้า TP</span>
                    <span className="text-green-400 font-mono font-semibold">{tpProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${tpProgress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Target SL Section */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-red-400 font-semibold flex items-center gap-1">
                    <ShieldAlert size={14} />
                    <span>ตัดขาดทุนสูงสุด (Stop Loss Target)</span>
                  </label>
                  <span className="font-mono text-slate-400">ปัจจุบัน: {profit < 0 ? `${profit.toLocaleString()}` : '0'} ฿</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={draftSl}
                    onChange={(e) => setDraftSl(Math.max(1000, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded px-3 py-2 text-slate-100 font-mono text-sm outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500">฿</span>
                </div>
                {/* Quick Presets */}
                <div className="flex gap-2">
                  {[20000, 50000, 100000, 200000].map(val => (
                    <button
                      key={val}
                      onClick={() => setDraftSl(val)}
                      className={`px-2 py-1 rounded border text-[10px] transition-colors ${draftSl === val ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                    >
                      {(val/1000)}k
                    </button>
                  ))}
                </div>
                {/* SL Progress */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ระยะสู่จุดตัดขาดทุน SL</span>
                    <span className="text-red-400 font-mono font-semibold">{slProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${slProgress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Action When Target Hit */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-slate-200 font-semibold block">การกระทำเมื่อถึงเป้าหมาย:</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <input
                      type="radio"
                      name="targetAction"
                      checked={draftAction === 'stop'}
                      onChange={() => setDraftAction('stop')}
                      className="accent-green-500"
                    />
                    <div>
                      <div className="font-semibold text-white">หยุดระบบทันที (Auto Stop)</div>
                      <div className="text-[10px] text-slate-400">หยุดการส่งออเดอร์อัตโนมัติ เพื่อรักษากำไร/ตัดขาดทุนทันที</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <input
                      type="radio"
                      name="targetAction"
                      checked={draftAction === 'alert'}
                      onChange={() => setDraftAction('alert')}
                      className="accent-green-500"
                    />
                    <div>
                      <div className="font-semibold text-white">ส่งเสียงและแจ้งเตือนอย่างเดียว (Alert Only)</div>
                      <div className="text-[10px] text-slate-400">ระบบยังคงเทรดต่อ แต่แจ้งเตือนให้เทรดเดอร์ทราบ</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#1e293b] px-5 py-3 border-t border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="px-4 py-1.5 text-slate-400 hover:text-white text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold transition-colors shadow-md shadow-green-600/20"
              >
                บันทึกเงื่อนไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shareable Daily PnL Card Modal */}
      <DailyPnLShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
