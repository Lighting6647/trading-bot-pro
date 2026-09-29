"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  Gauge, 
  Flame, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Check, 
  X, 
  Activity, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useTrading } from '@/context/TradingContext';

export default function SmartRiskManager() {
  const {
    consecutiveLosses,
    isCooldown,
    cooldownSeconds,
    dailyLossLimit,
    setDailyLossLimit,
    isTiltDetected,
    profit,
    trades,
    isRunning,
  } = useTrading();

  const [mounted, setMounted] = useState(false);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [inputLimit, setInputLimit] = useState(dailyLossLimit.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setInputLimit(dailyLossLimit.toString());
  }, [dailyLossLimit]);

  // Risk Level determination based on consecutiveLosses
  const riskStatus = useMemo(() => {
    if (consecutiveLosses >= 5 || isTiltDetected) {
      return {
        level: 'Critical',
        label: 'วิกฤต (Critical)',
        color: 'rose',
        barWidth: '100%',
        bgClass: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
        badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        barColor: 'bg-rose-500',
        description: 'ระดับความเสี่ยงสูงสุด! ตรวจพบสภาวะ Tilt แนะนำหยุดเทรดทันทีเพื่อรักษาทุน',
      };
    }
    if (consecutiveLosses >= 3 || isCooldown) {
      return {
        level: 'High',
        label: 'สูง (High)',
        color: 'orange',
        barWidth: '75%',
        bgClass: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
        badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        barColor: 'bg-orange-500',
        description: 'แพ้ติดต่อกัน 3 ไม้ขึ้นไป ระบบเปิดการพักเทรดอัตโนมัติ (Cool-down)',
      };
    }
    if (consecutiveLosses === 2) {
      return {
        level: 'Medium',
        label: 'ปานกลาง (Medium)',
        color: 'amber',
        barWidth: '50%',
        bgClass: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        barColor: 'bg-amber-500',
        description: 'เริ่มพบการขาดทุนต่อเนื่อง ควรระมัดระวังและตรวจสอบจังหวะสัญญาณ AI',
      };
    }
    return {
      level: 'Low',
      label: 'ปลอดภัย (Low)',
      color: 'emerald',
      barWidth: '25%',
      bgClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      barColor: 'bg-emerald-500',
      description: 'ระบบความเสี่ยงอยู่ในเกณฑ์ปลอดภัย มีวินัยและพร้อมเปิดรับโอกาสใหม่',
    };
  }, [consecutiveLosses, isTiltDetected, isCooldown]);

  // Daily Loss Limit calculation
  const usedLoss = profit < 0 ? Math.abs(profit) : 0;
  const limitUsagePct = Math.min(100, (usedLoss / (dailyLossLimit || 1)) * 100);
  const remainingLossBuffer = Math.max(0, dailyLossLimit - usedLoss);

  // Cooldown circular progress calculation
  const totalCooldownDuration = 300; // 5 minutes standard
  const cooldownFraction = Math.max(0, Math.min(1, cooldownSeconds / totalCooldownDuration));
  const circleRadius = 38;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference * (1 - cooldownFraction);

  // Formatted countdown MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Drawdown & Risk-Reward calculations
  const { maxDrawdown, currentDrawdown, riskRewardRatio, drawdownChartData } = useMemo(() => {
    const chrono = [...trades].reverse();
    let peak = 0;
    let running = 0;
    let maxDD = 0;

    const chartPoints = chrono.map((t, idx) => {
      const pnl = t.result === 'WIN' ? t.amount * 0.85 : -t.amount;
      running += pnl;
      if (running > peak) {
        peak = running;
      }
      const dd = peak - running;
      if (dd > maxDD) {
        maxDD = dd;
      }
      return {
        tradeIndex: idx + 1,
        time: t.time,
        drawdown: -Math.round(dd),
        equity: Math.round(running),
      };
    });

    const currentDD = peak > running ? peak - running : 0;

    // Risk-Reward
    const winTrades = trades.filter((t) => t.result === 'WIN');
    const loseTrades = trades.filter((t) => t.result === 'LOSE');

    const totalWinAmt = winTrades.reduce((acc, cur) => acc + cur.amount * 0.85, 0);
    const totalLoseAmt = loseTrades.reduce((acc, cur) => acc + cur.amount, 0);

    const avgWin = winTrades.length > 0 ? totalWinAmt / winTrades.length : 0;
    const avgLoss = loseTrades.length > 0 ? totalLoseAmt / loseTrades.length : 0;

    let rr = '1 : 0.85';
    if (avgLoss > 0 && avgWin > 0) {
      const ratio = (avgWin / avgLoss).toFixed(2);
      rr = `1 : ${ratio}`;
    } else if (winTrades.length > 0 && loseTrades.length === 0) {
      rr = '1 : Max';
    } else if (winTrades.length === 0 && loseTrades.length > 0) {
      rr = '1 : 0.00';
    } else if (trades.length === 0) {
      rr = 'N/A';
    }

    return {
      maxDrawdown: maxDD,
      currentDrawdown: currentDD,
      riskRewardRatio: rr,
      drawdownChartData: chartPoints.length > 0 ? chartPoints : [
        { tradeIndex: 1, time: '00:00', drawdown: 0, equity: 0 }
      ],
    };
  }, [trades]);

  const handleSaveLimit = () => {
    const val = parseFloat(inputLimit.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      setDailyLossLimit(val);
      setIsEditingLimit(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleQuickLimit = (amount: number) => {
    setDailyLossLimit(amount);
    setInputLimit(amount.toString());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="flex-1 bg-[#0a0f1c] rounded-md border border-slate-800 p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="animate-spin text-blue-500" size={18} />
          <span>กำลังโหลดโมดูล Risk Manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] text-slate-200 min-h-0 overflow-y-auto rounded-md border border-slate-800 m-2 relative">
      {/* Header Bar */}
      <div className="h-12 bg-[#131b2f] border-b border-slate-800 flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-2.5 text-blue-400 font-semibold text-sm">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Shield size={18} className="text-blue-400" />
          </div>
          <div>
            <span className="text-white font-bold tracking-wide">Smart Risk Manager</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-400">ระบบควบคุมและบริหารความเสี่ยงอัตโนมัติ</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-full border ${
            isRunning ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            {isRunning ? 'SHIELD ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* SECTION 4: Tilt Detection Banner */}
        {isTiltDetected ? (
          <div className="relative overflow-hidden rounded-xl border-2 border-rose-500 bg-rose-950/40 p-4 md:p-5 shadow-lg shadow-rose-950/50 animate-pulse">
            <div className="flex items-start md:items-center gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shrink-0">
                <Flame size={28} className="animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-500 text-white">
                    ALERT
                  </span>
                  <h3 className="text-lg font-bold text-rose-300">
                    ตรวจพบสภาวะ Tilt Mode (Emotional Overheat)
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-rose-200/90 mt-1 leading-relaxed">
                  คุณแพ้ติดต่อกันเกิน 5 ครั้ง ระบบประเมินว่าอารมณ์อาจมีผลต่อการตัดสินใจ กรุณาหยุดพักการเทรดอย่างน้อย 15-30 นาที ดื่มน้ำ และผ่อนคลายก่อนกลับมาวิเคราะห์ตลาดใหม่อีกครั้ง
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-end shrink-0 text-right">
                <span className="text-xs text-rose-300 uppercase font-mono">Status</span>
                <span className="text-sm font-bold text-white bg-rose-600/60 px-3 py-1 rounded-md border border-rose-400 mt-1">
                  Trading Locked
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-[#131b2f] p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400">สภาวะจิตใจและอารมณ์ (Mindset State)</div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> ควบคุมอารมณ์ได้ดี (Disciplined & Composed)
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Tilt Threshold</div>
              <div className="text-xs font-mono text-slate-300">5 Losses ติดต่อกัน</div>
            </div>
          </div>
        )}

        {/* SECTION 1 & 2: Risk Status & Consecutive Losses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Risk Level Bar & Description */}
          <div className="lg:col-span-7 bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge size={18} className="text-blue-400" />
                  <span className="font-semibold text-sm text-slate-200">ระดับความเสี่ยงปัจจุบัน (Risk Status)</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${riskStatus.badgeBg}`}>
                  {riskStatus.label}
                </span>
              </div>

              {/* Segmented Risk Meter */}
              <div className="space-y-2 mt-4">
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 flex gap-1">
                  <div className={`h-full flex-1 rounded-l-full transition-all duration-500 ${
                    consecutiveLosses >= 0 ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                  <div className={`h-full flex-1 transition-all duration-500 ${
                    consecutiveLosses >= 2 ? 'bg-amber-500' : 'bg-slate-800'
                  }`} />
                  <div className={`h-full flex-1 transition-all duration-500 ${
                    consecutiveLosses >= 3 || isCooldown ? 'bg-orange-500' : 'bg-slate-800'
                  }`} />
                  <div className={`h-full flex-1 rounded-r-full transition-all duration-500 ${
                    consecutiveLosses >= 5 || isTiltDetected ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]' : 'bg-slate-800'
                  }`} />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1 pt-1">
                  <span className="text-emerald-400 font-semibold">Low (0-1)</span>
                  <span className="text-amber-400 font-semibold">Med (2)</span>
                  <span className="text-orange-400 font-semibold">High (3-4)</span>
                  <span className="text-rose-400 font-semibold">Critical (5+)</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>{riskStatus.description}</span>
              </div>
            </div>

            {/* SECTION 2: Consecutive Losses Counter & Visual Dots */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-400 font-medium">
                  แพ้ติดต่อกัน (Consecutive Losses)
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className={`text-2xl font-bold ${
                    consecutiveLosses === 0 ? 'text-emerald-400' :
                    consecutiveLosses <= 2 ? 'text-amber-400' :
                    consecutiveLosses <= 4 ? 'text-orange-400' : 'text-rose-500'
                  }`}>
                    {consecutiveLosses}
                  </span>
                  <span className="text-slate-500 text-xs">/ 5 ไม้</span>
                </div>
              </div>

              {/* Visual Dots */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((slot) => {
                  const isActive = consecutiveLosses >= slot;
                  let dotColor = 'bg-slate-800 border-slate-700 text-slate-600';

                  if (isActive) {
                    if (slot <= 2) {
                      dotColor = 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                    } else if (slot <= 4) {
                      dotColor = 'bg-orange-500 border-orange-400 text-slate-950 shadow-[0_0_10px_rgba(249,115,22,0.6)]';
                    } else {
                      dotColor = 'bg-rose-500 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse';
                    }
                  }

                  return (
                    <div
                      key={slot}
                      className={`h-10 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 ${dotColor}`}
                    >
                      <span className="text-xs font-mono font-bold">{slot}</span>
                      <span className="text-[9px] uppercase tracking-tighter opacity-80">
                        {slot === 3 ? 'Cool' : slot === 5 ? 'Tilt' : 'Loss'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 5: Cooldown Timer Display */}
          <div className="lg:col-span-5 bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                <span className="font-semibold text-sm text-slate-200">ระบบพักเทรด (Cool-down)</span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isCooldown ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isCooldown ? 'PROTECTION ON' : 'IDLE'}
              </span>
            </div>

            {/* Circular Progress & Countdown */}
            <div className="flex flex-col items-center justify-center my-4 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  {/* Background Track */}
                  <circle
                    cx="45"
                    cy="45"
                    r={circleRadius}
                    className="stroke-slate-800"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Animated Progress */}
                  <circle
                    cx="45"
                    cy="45"
                    r={circleRadius}
                    className={`transition-all duration-1000 ${
                      isCooldown ? 'stroke-orange-500' : 'stroke-emerald-500'
                    }`}
                    strokeWidth="7"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={isCooldown ? circleOffset : 0}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {isCooldown ? (
                    <>
                      <span className="text-2xl font-mono font-bold text-white tracking-wider">
                        {formatTime(cooldownSeconds)}
                      </span>
                      <span className="text-[10px] text-orange-400 font-medium uppercase mt-0.5">
                        พักการเทรด
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={28} className="text-emerald-400 mb-1" />
                      <span className="text-xs font-semibold text-emerald-400">พร้อมทำงาน</span>
                      <span className="text-[10px] text-slate-400">No Cooldown</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center mt-3 text-xs text-slate-400 max-w-[240px]">
                {isCooldown ? (
                  <span className="text-orange-300">
                    ป้องกันการ Overtrade: บอทจะหยุดส่งคำสั่งชั่วคราวเพื่อรอสภาวะตลาดนิ่ง
                  </span>
                ) : (
                  <span>
                    เมื่อแพ้ติดต่อกัน 3 ไม้ ระบบจะหยุดพักเทรดอัตโนมัติ 5 นาที เพื่อรีเซ็ตจังหวะ
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">เกณฑ์กระตุ้นอัตโนมัติ:</span>
              <span className="font-mono text-slate-200">แพ้ 3 ไม้ติด = พัก 5 นาที</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Daily Loss Limit Display & Editable Input */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="font-semibold text-sm text-slate-200">จำกัดการขาดทุนรายวัน (Daily Loss Limit)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดขีดจำกัดเพื่อปกป้องเงินทุนสูงสุด หากยอดขาดทุนถึงเป้า บอทจะหยุดทำงานทันที
              </p>
            </div>

            {/* Quick Limit Buttons & Edit toggle */}
            <div className="flex items-center gap-2">
              {!isEditingLimit ? (
                <>
                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {[10000, 25000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleQuickLimit(amt)}
                        className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                          dailyLossLimit === amt
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                        }`}
                      >
                        {(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setInputLimit(dailyLossLimit.toString());
                      setIsEditingLimit(true);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    <Edit3 size={13} />
                    <span>แก้ไข</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={inputLimit}
                      onChange={(e) => setInputLimit(e.target.value)}
                      placeholder="ระบุยอดจำกัด..."
                      className="w-32 bg-slate-900 border border-blue-500 text-sm rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-500 font-mono">฿</span>
                  </div>
                  <button
                    onClick={handleSaveLimit}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    title="บันทึก"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => setIsEditingLimit(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="ยกเลิก"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> อัปเดตขีดจำกัดความเสี่ยงเรียบร้อยแล้ว
            </div>
          )}

          {/* Progress Bar & Details */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <div className="text-slate-400">
                ขาดทุนสะสมวันนี้:{' '}
                <span className={`font-mono font-bold text-sm ${usedLoss > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {usedLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                </span>
              </div>
              <div className="text-slate-400">
                ขีดจำกัดสูงสุด:{' '}
                <span className="font-mono font-bold text-sm text-blue-400">
                  {dailyLossLimit.toLocaleString('en-US')} ฿
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5 relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  limitUsagePct >= 90
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : limitUsagePct >= 65
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${limitUsagePct}%` }}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 font-semibold">{limitUsagePct.toFixed(1)}%</span>
                <span>ของวงเงินที่ใช้ไป</span>
              </div>
              <div className="flex items-center gap-2">
                <span>พื้นที่รองรับที่เหลือ (Buffer):</span>
                <span className={`font-mono font-bold ${remainingLossBuffer < dailyLossLimit * 0.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {remainingLossBuffer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Drawdown & Risk-Reward Stats with Chart */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-blue-400" />
              <h3 className="font-semibold text-sm text-slate-200">สถิติ Drawdown และ Risk-Reward</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              วิเคราะห์จาก {trades.length} ออเดอร์
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* Max Drawdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Max Drawdown (MDD)</span>
                <AlertOctagon size={14} className="text-rose-400" />
              </div>
              <div className="text-xl font-mono font-bold text-rose-400">
                {maxDrawdown > 0 ? `-${maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '0'} ฿
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                จุดขาดทุนลึกสุดจากยอดพอร์ตสูงสุด
              </div>
            </div>

            {/* Current Drawdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Current Drawdown</span>
                <TrendingDown size={14} className={currentDrawdown > 0 ? 'text-amber-400' : 'text-emerald-400'} />
              </div>
              <div className={`text-xl font-mono font-bold ${currentDrawdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentDrawdown > 0 ? `-${currentDrawdown.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '0.00'} ฿
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                ระยะห่างจาก Peak ปัจจุบัน
              </div>
            </div>

            {/* Risk-Reward Ratio */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Risk-Reward Ratio</span>
                <Gauge size={14} className="text-blue-400" />
              </div>
              <div className="text-xl font-mono font-bold text-blue-400">
                {riskRewardRatio}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                อัตราส่วนกำไรเฉลี่ยต่อการขาดทุน
              </div>
            </div>
          </div>

          {/* Visual Drawdown Chart */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Activity size={13} className="text-blue-400" />
                <span>Drawdown Curve (ความเสี่ยงสะสมตามลำดับไม้)</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                แกนลบ = ระยะย่อตัว (฿)
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={drawdownChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="tradeIndex" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131b2f',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} ฿`, 'Drawdown']}
                    labelFormatter={(label) => `ออเดอร์ที่ #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Protection Policies Summary */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Shield size={14} className="text-blue-400" />
            <span>กฎการทำงานของระบบความปลอดภัย (Risk Policies):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">1. Cool-down 5 นาที</span>
              เมื่อแพ้ติดต่อกัน 3 ไม้ บอทจะเข้าสู่โหมดพักเทรดอัตโนมัติ เพื่อป้องกันการเทรดแบบใช้อารมณ์
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-1">2. Tilt Detection ล็อกเกอร์</span>
              หากแพ้ติดต่อกัน 5 ไม้ ระบบจะตัดการทำงานและแจ้งเตือนขั้นวิกฤต บังคับให้ผู้เทรดประเมินแผนใหม่
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">3. Daily Loss Auto-Stop</span>
              หากผลขาดทุนรวมแตะขีดจำกัดรายวัน ระบบจะตัดการส่งออเดอร์ทันที เพื่อรักษาทุนต้นให้อยู่รอด
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
