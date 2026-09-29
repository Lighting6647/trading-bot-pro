"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { useTrading } from '@/context/TradingContext';

export default function AISignalDashboard() {
  const { 
    aiSignal, 
    aiAccuracy, 
    trades, 
    addNotification,
    isAutoTrade
  } = useTrading();

  const [mounted, setMounted] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'confirm' | 'skip';
    message: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear action feedback after 4 seconds
  useEffect(() => {
    if (!actionFeedback) return;
    const timer = setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  // Color scheme based on confidence: red < 40, yellow 40-70, green > 70
  const confidence = aiSignal?.confidence ?? 0;
  const confidenceColor = useMemo(() => {
    if (confidence < 40) {
      return {
        text: 'text-rose-400',
        stroke: '#f43f5e',
        glow: 'rgba(244, 63, 94, 0.4)',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'ความมั่นใจต่ำ (Low)',
      };
    }
    if (confidence <= 70) {
      return {
        text: 'text-amber-400',
        stroke: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'ความมั่นใจปานกลาง (Medium)',
      };
    }
    return {
      text: 'text-emerald-400',
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      label: 'ความมั่นใจสูง (High)',
    };
  }, [confidence]);

  // Signal direction styling & text
  const directionConfig = useMemo(() => {
    switch (aiSignal?.direction) {
      case 'BUY':
        return {
          label: 'BUY (ซื้อขึ้น)',
          subText: 'สัญญาณแนวโน้มขาขึ้น Bullish Confirmation',
          icon: TrendingUp,
          bgGradient: 'from-emerald-950/60 via-emerald-900/30 to-transparent',
          border: 'border-emerald-500/50',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          color: 'text-emerald-400',
        };
      case 'SELL':
        return {
          label: 'SELL (ขายลง)',
          subText: 'สัญญาณแนวโน้มขาลง Bearish Confirmation',
          icon: TrendingDown,
          bgGradient: 'from-rose-950/60 via-rose-900/30 to-transparent',
          border: 'border-rose-500/50',
          badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
          color: 'text-rose-400',
        };
      case 'HOLD':
      default:
        return {
          label: 'HOLD (รอสัญญาณ)',
          subText: 'ตลาดไซด์เวย์หรือความมั่นใจยังไม่เพียงพอ',
          icon: Target,
          bgGradient: 'from-amber-950/50 via-amber-900/20 to-transparent',
          border: 'border-amber-500/40',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]',
          color: 'text-amber-400',
        };
    }
  }, [aiSignal?.direction]);

  // Handle Action Buttons
  const handleConfirmSignal = () => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const dir = aiSignal?.direction || 'HOLD';
    const conf = aiSignal?.confidence ?? 0;
    addNotification(
      'signal',
      `✅ ยืนยันสัญญาณ AI [${dir}] ความมั่นใจ ${conf}% - เริ่มดำเนินการตามแผน`
    );
    setActionFeedback({
      type: 'confirm',
      message: `ยืนยันสัญญาณ ${dir} (${conf}%) สำเร็จแล้ว!`,
      timestamp: timeStr,
    });
  };

  const handleSkipSignal = () => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const dir = aiSignal?.direction || 'HOLD';
    addNotification(
      'signal',
      `ข้ามสัญญาณ AI [${dir}] - รอประเมินรอบถัดไป`
    );
    setActionFeedback({
      type: 'skip',
      message: `ข้ามสัญญาณ ${dir} เรียบร้อยแล้ว`,
      timestamp: timeStr,
    });
  };

  // Recent AI Signals from Trades
  const recentAiTrades = useMemo(() => {
    const filtered = trades.filter((t) => t.aiSignal || t.aiConfidence);
    return filtered.slice(0, 5);
  }, [trades]);

  // Mini Recharts confidence trend data
  const trendData = useMemo(() => {
    const items = [...trades]
      .filter((t) => t.aiConfidence !== undefined)
      .slice(0, 10)
      .reverse();

    if (items.length === 0) {
      return [
        { time: '1', conf: 60 },
        { time: '2', conf: 72 },
        { time: '3', conf: 68 },
        { time: '4', conf: 82 },
        { time: '5', conf: confidence },
      ];
    }

    return items.map((t, idx) => ({
      time: t.time || `${idx + 1}`,
      conf: t.aiConfidence ?? 50,
      result: t.result,
    }));
  }, [trades, confidence]);

  // Gauge Meter calculations (260 degree arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (confidence / 100) * arcLength;
  const DirectionIcon = directionConfig.icon;

  // Format timestamp safely
  const formattedTime = useMemo(() => {
    if (!mounted || !aiSignal?.timestamp) return 'กำลังอัปเดต...';
    try {
      const date = new Date(aiSignal.timestamp);
      return isNaN(date.getTime()) 
        ? aiSignal.timestamp 
        : date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return aiSignal.timestamp;
    }
  }, [mounted, aiSignal?.timestamp]);

  return (
    <div className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-slate-200">
      {/* Top Header Bar */}
      <div className="bg-[#131b2f] border-b border-slate-800 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Brain size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                AI SIGNAL DASHBOARD
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v2.5 PRO
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              ระบบประมวลผลสัญญาณเทรดอัตโนมัติด้วย Machine Learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0a0f1c] border border-slate-800 text-xs font-mono text-slate-300">
            <Clock size={13} className="text-slate-400" />
            <span>TF: {aiSignal?.timeframe || '5m'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0a0f1c] border border-slate-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${isAutoTrade ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></div>
            <span className="text-slate-300 font-medium">
              {isAutoTrade ? 'AI Auto-Trading ON' : 'Manual Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert (Toast Banner) */}
      {actionFeedback && (
        <div
          className={`mx-4 mt-4 px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
            actionFeedback.type === 'confirm'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'confirm' ? (
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <XCircle size={16} className="text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <span className="text-[11px] opacity-75">{actionFeedback.timestamp}</span>
        </div>
      )}

      {/* Main Body Grid */}
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Gauge & Direction Banner (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Signal & Confidence Card */}
          <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Background glowing ambient light */}
            <div 
              className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-700"
              style={{ backgroundColor: confidenceColor.stroke }}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Circular Gauge Meter */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 200 200">
                    {/* Background Arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeLinecap="round"
                    />
                    {/* Colored Progress Arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={confidenceColor.stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 8px ${confidenceColor.glow})`,
                        transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                      }}
                    />
                  </svg>

                  {/* Centered Gauge Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      AI CONFIDENCE
                    </span>
                    <div className="flex items-baseline justify-center">
                      <span className={`text-4xl font-extrabold font-mono tracking-tight ${confidenceColor.text}`}>
                        {confidence}
                      </span>
                      <span className={`text-lg font-bold ml-0.5 ${confidenceColor.text}`}>
                        %
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      0 - 100% Scale
                    </span>
                  </div>
                </div>

                {/* Level Tag under Gauge */}
                <div className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${confidenceColor.badge}`}>
                  {confidenceColor.label}
                </div>
              </div>

              {/* Signal Direction Badge & Info */}
              <div className="flex-1 w-full flex flex-col justify-center gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wide font-medium">
                  <Zap size={14} className="text-amber-400" />
                  สัญญาณการเข้าออเดอร์ปัจจุบัน
                </div>

                {/* Huge Colored Signal Badge */}
                <div
                  className={`p-4 rounded-xl border bg-gradient-to-br ${directionConfig.bgGradient} ${directionConfig.border} ${directionConfig.glow} transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${directionConfig.badgeBg}`}>
                        <DirectionIcon size={28} className={directionConfig.color} />
                      </div>
                      <div>
                        <div className={`text-2xl font-black tracking-wider ${directionConfig.color}`}>
                          {directionConfig.label}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 font-medium">
                          {directionConfig.subText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Signal Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-lg p-2.5">
                    <span className="text-slate-400 block text-[11px]">Timeframe</span>
                    <span className="font-semibold text-slate-200 font-mono">{aiSignal?.timeframe || '5m'}</span>
                  </div>
                  <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-lg p-2.5">
                    <span className="text-slate-400 block text-[11px]">อัปเดตล่าสุด</span>
                    <span className="font-semibold text-slate-200 font-mono">{formattedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Reason Text Box */}
            <div className="bg-[#0a0f1c] border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Brain size={15} />
                  <span>เหตุผลการวิเคราะห์ของ AI (Analysis Logic)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Verified Model</span>
              </div>
              
              <div className="text-sm text-slate-200 bg-[#131b2f]/80 p-3 rounded border border-slate-800/80 font-sans leading-relaxed">
                {aiSignal?.reason ? (
                  <p className="flex items-start gap-2">
                    <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{aiSignal.reason}</span>
                  </p>
                ) : (
                  <p className="text-slate-400 italic">กำลังรอการวิเคราะห์ทางเทคนิคจากโมเดล AI...</p>
                )}
              </div>

              {/* Indicator tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  RSI / Momentum
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  MACD Oscillator
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Volume Analysis
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Price Action S/R
                </span>
              </div>
            </div>

            {/* Action Buttons: Confirm AI / Skip Signal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmSignal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <CheckCircle size={18} className="shrink-0" />
                <span>ยืนยันตาม AI</span>
              </button>

              <button
                type="button"
                onClick={handleSkipSignal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-rose-500/70 hover:border-rose-400 hover:bg-rose-500/10 active:scale-[0.98] text-rose-400 hover:text-rose-300 font-semibold text-sm transition-all cursor-pointer"
              >
                <XCircle size={18} className="shrink-0" />
                <span>ข้ามสัญญาณนี้</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Accuracy & Signal History (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* AI Accuracy Card */}
          <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Target size={16} />
                <span>AI MODEL ACCURACY</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                High Performance
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-3xl font-extrabold text-white font-mono flex items-baseline">
                  {aiAccuracy.toFixed(1)}
                  <span className="text-emerald-400 text-lg ml-0.5">%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ความแม่นยำเฉลี่ยย้อนหลัง 50 รอบล่าสุด
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck size={26} />
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="w-full bg-[#0a0f1c] rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="bg-gradient-to-r from-blue-500 via-emerald-400 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(aiAccuracy, 0), 100)}%` }}
              />
            </div>

            {/* Mini Trend Area Chart */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>แนวโน้มความมั่นใจของสัญญาณล่าสุด</span>
                <span className="font-mono text-slate-300">Confidence Trend</span>
              </div>
              <div className="h-20 w-full bg-[#0a0f1c] rounded-lg border border-slate-800/80 p-1">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aiConfGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#e2e8f0',
                        }}
                        formatter={(val: any) => [`${val}%`, 'ความมั่นใจ']}
                      />
                      <Area
                        type="monotone"
                        dataKey="conf"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#aiConfGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent AI Signals History List */}
          <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Activity size={15} className="text-blue-400" />
                <span>ประวัติสัญญาณ AI ล่าสุด</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {recentAiTrades.length} สัญญาณ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 mt-1">
              {recentAiTrades.length > 0 ? (
                recentAiTrades.map((t) => {
                  const conf = t.aiConfidence ?? 50;
                  const confBadgeColor =
                    conf > 70
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : conf >= 40
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                  const signalType = t.aiSignal || t.type;
                  const isBuy = signalType === 'BUY';

                  return (
                    <div
                      key={t.id}
                      className="py-2.5 px-1.5 flex items-center justify-between text-xs hover:bg-[#0a0f1c]/50 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-[11px] border ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-semibold text-slate-200">{signalType}</span>
                            <span className="text-[10px] text-slate-400">#{t.id}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{t.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Confidence Tag */}
                        <div className={`px-2 py-0.5 rounded text-[11px] font-mono border ${confBadgeColor}`}>
                          {conf}%
                        </div>

                        {/* Trade Result */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                            t.result === 'WIN'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.result}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
                  <Info size={24} className="text-slate-600 mb-2" />
                  <p>ยังไม่มีประวัติสัญญาณ AI ในเซสชันนี้</p>
                  <p className="text-[11px] text-slate-500 mt-1">สัญญาณใหม่จะปรากฏขึ้นโดยอัตโนมัติ</p>
                </div>
              )}
            </div>

            {/* Bottom info link */}
            <div className="pt-2 mt-auto border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                บันทึกสัญญาณเข้า Trade Context
              </span>
              <span className="text-slate-400 font-mono">Real-time Feed</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
