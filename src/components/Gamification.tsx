"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Target, 
  Award, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Gift, 
  BarChart3, 
  Calendar, 
  ShieldCheck,
  Check
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

export default function Gamification() {
  const { 
    achievements = [], 
    xp = 1250, 
    level = 5, 
    streak = 3, 
    trades = [],
    addNotification,
    addXp
  } = useTrading();

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Level & XP calculations (progress to next level = level * 500)
  const nextLevelTarget = level * 500;
  const xpPercentage = Math.min(100, Math.max(0, Math.round((xp / (nextLevelTarget || 1)) * 100)));
  const xpRemaining = Math.max(0, nextLevelTarget - xp);

  // Player Rank Title based on level
  const rankInfo = useMemo(() => {
    if (level >= 10) return { title: 'ตำนานแห่งตลาดทุน', tier: 'Legendary', color: 'from-amber-400 to-rose-500', border: 'border-amber-400' };
    if (level >= 7) return { title: 'เซียนเทรดชั้นยอด', tier: 'Master', color: 'from-purple-500 to-indigo-500', border: 'border-purple-400' };
    if (level >= 5) return { title: 'ผู้เชี่ยวชาญการเก็งกำไร', tier: 'Pro Trader', color: 'from-blue-500 to-cyan-400', border: 'border-cyan-400' };
    if (level >= 3) return { title: 'นักเทรดวินัยเหล็ก', tier: 'Advanced', color: 'from-emerald-500 to-teal-400', border: 'border-emerald-400' };
    return { title: 'มือใหม่หัดเทรด', tier: 'Beginner', color: 'from-slate-400 to-slate-200', border: 'border-slate-500' };
  }, [level]);

  // Today's Win Rate & Daily Challenge ('Win Rate > 60% วันนี้')
  const totalTrades = trades.length;
  const winTrades = trades.filter(t => t.result === 'WIN').length;
  const currentWinRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const challengeTarget = 60;
  const challengeCompleted = currentWinRate >= challengeTarget && totalTrades >= 1;
  const challengeProgress = Math.min(100, Math.max(0, Math.round((currentWinRate / challengeTarget) * 100)));

  // Achievement stats
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const completionPercent = totalAchievements > 0 
    ? Math.round((unlockedCount / totalAchievements) * 100) 
    : 0;

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') return achievements.filter(a => a.unlocked);
    if (filter === 'locked') return achievements.filter(a => !a.unlocked);
    return achievements;
  }, [achievements, filter]);

  // Chart data for 7-day XP progression
  const xpChartData = useMemo(() => {
    return [
      { day: 'จ.', xp: Math.round(xp * 0.35), winRate: 60 },
      { day: 'อ.', xp: Math.round(xp * 0.48), winRate: 65 },
      { day: 'พ.', xp: Math.round(xp * 0.62), winRate: 58 },
      { day: 'พฤ.', xp: Math.round(xp * 0.74), winRate: 72 },
      { day: 'ศ.', xp: Math.round(xp * 0.85), winRate: 66 },
      { day: 'ส.', xp: Math.round(xp * 0.92), winRate: 75 },
      { day: 'วันนี้', xp: xp, winRate: Math.round(currentWinRate) },
    ];
  }, [xp, currentWinRate]);

  // Handle claiming daily challenge reward
  const handleClaimDaily = () => {
    if (dailyClaimed || !challengeCompleted) return;
    setDailyClaimed(true);
    if (addXp) {
      addXp(300);
    }
    if (addNotification) {
      addNotification('achievement', '🎉 ยินดีด้วย! รับรางวัล Daily Challenge ภารกิจ Win Rate > 60% สำเร็จ (+300 XP)');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#0a0f1c] text-slate-200 font-sans min-h-0 h-full">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg md:text-xl">
            <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
            <span>ระบบเลเวลและความสำเร็จ (Gamification & Achievements)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            สะสม XP จากการเทรดตามวินัย บรรลุภารกิจรายวัน และปลดล็อกเหรียญเกียรติยศ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ซีซัน 1: Alpha Trader</span>
          </div>
        </div>
      </div>

      {/* 1. Player Card Section */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden shrink-0">
        {/* Background Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 justify-between">
          {/* Left: Avatar & Level Badge */}
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="relative shrink-0">
              {/* Circular Level Badge */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 p-1 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-[#0a0f1c] flex flex-col items-center justify-center border-2 border-slate-900">
                  <span className="text-[10px] md:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> LVL
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-white font-mono leading-none my-0.5">
                    {level}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">TRADER</span>
                </div>
              </div>
              {/* Badge Mini Star */}
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Player Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                  Elite Master Trader
                </h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-900/80 text-amber-300 ${rankInfo.border}`}>
                  {rankInfo.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ตำแหน่ง: <span className="text-slate-200 font-medium">{rankInfo.title}</span>
              </p>
              
              {/* Streak Counter with Fire Icon */}
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-bounce" />
                  <span>สตรีค {streak} วันต่อเนื่อง 🔥</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  โบนัส XP +{streak * 10}%
                </span>
              </div>
            </div>
          </div>

          {/* Right: XP Bar Progress (progress to next level = level * 500) */}
          <div className="w-full lg:max-w-md flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">ค่าประสบการณ์ (XP)</span>
              </div>
              <div className="font-mono text-xs">
                <span className="text-amber-400 font-bold">{xp.toLocaleString()}</span>
                <span className="text-slate-500"> / {nextLevelTarget.toLocaleString()} XP</span>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 transition-all duration-700 relative overflow-hidden"
                style={{ width: `${xpPercentage}%` }}
              >
                {/* Shimmer light effect */}
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>ความคืบหน้า: <strong className="text-slate-200 font-mono">{xpPercentage}%</strong></span>
              <span>
                ต้องการอีก <strong className="text-amber-400 font-mono">{xpRemaining.toLocaleString()} XP</strong> สู่เลเวล {level + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily Challenge Card */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ภารกิจประจำวัน (Daily Challenge)
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" /> รีเซ็ตทุก 24 ชม.
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                Win Rate &gt; 60% วันนี้
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ทำอัตราชนะในการเทรดให้เกิน 60% สำหรับรอบวันนี้ (ปัจจุบัน: {winTrades} ชนะ / {totalTrades} ไม้)
              </p>
            </div>
          </div>

          {/* Action / Claim Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-400">รางวัลภารกิจ</div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                <Gift className="w-3.5 h-3.5" /> +300 XP & ตราเกียรติยศ
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={!challengeCompleted || dailyClaimed}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dailyClaimed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : challengeCompleted
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-lg shadow-orange-500/25 animate-pulse cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              {dailyClaimed ? (
                <>
                  <Check className="w-4 h-4" /> รับรางวัลแล้ว
                </>
              ) : challengeCompleted ? (
                <>
                  <Sparkles className="w-4 h-4" /> กดรับ +300 XP
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> ยังไม่บรรลุเป้าหมาย
                </>
              )}
            </button>
          </div>
        </div>

        {/* Daily Challenge Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400">
              อัตราชนะปัจจุบัน: <strong className={`font-mono ${currentWinRate >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentWinRate.toFixed(1)}%</strong>
            </span>
            <span className="text-slate-400 font-mono">
              เป้าหมาย: <span className="text-slate-200 font-bold">60.0%</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentWinRate >= 60 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-indigo-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, (currentWinRate / 60) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
            <span>
              {challengeCompleted 
                ? '✅ บรรลุเงื่อนไข Win Rate ประจำวันแล้ว' 
                : `ต้องการอีก ${(Math.max(0, 60 - currentWinRate)).toFixed(1)}% เพื่อพิชิตภารกิจ`}
            </span>
            <span>ความคืบหน้า {Math.min(100, Math.round((currentWinRate / 60) * 100))}%</span>
          </div>
        </div>
      </div>

      {/* 3. Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Total XP Earned */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">Total XP สะสม</div>
            <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {xp.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> เลเวลปัจจุบัน {level}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Achievements Unlocked Count */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">ความสำเร็จที่ปลดล็อก</div>
            <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
              {unlockedCount} <span className="text-xs font-normal text-slate-400">/ {totalAchievements}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-emerald-400" /> สำเร็จแล้ว {completionPercent}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">Current Streak</div>
            <div className="text-xl md:text-2xl font-black text-orange-400 font-mono flex items-center gap-1">
              {streak} <span className="text-xs font-normal text-slate-400">วันติด</span>
            </div>
            <div className="text-[11px] text-orange-400/80 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> โบนัส XP x{(1 + streak * 0.1).toFixed(1)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Win Rate & Target Stats */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">Win Rate เฉลี่ย</div>
            <div className="text-xl md:text-2xl font-black text-cyan-400 font-mono">
              {currentWinRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" /> ชนะ {winTrades} จาก {totalTrades} ไม้
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. XP Progression & Activity Chart (Recharts) */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-5 shadow-lg shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">
              แนวโน้มการสะสม XP และอัตราชนะ (7 วันย้อนหลัง)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>XP สะสม</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span>Win Rate (%)</span>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0f1c', 
                    borderColor: '#334155', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="xp" 
                  name="XP สะสม" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#xpGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="winRate" 
                  name="Win Rate (%)" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#rateGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
              กำลังโหลดกราฟสถิติ...
            </div>
          )}
        </div>
      </div>

      {/* 5. Achievement Grid Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">
            เหรียญเกียรติยศและความสำเร็จ (Achievements)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {unlockedCount}/{totalAchievements}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-amber-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'unlocked' 
                ? 'bg-amber-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ปลดล็อกแล้ว ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'locked' 
                ? 'bg-amber-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ยังไม่ปลดล็อก ({totalAchievements - unlockedCount})
          </button>
        </div>
      </div>

      {/* 6. Achievement Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 pb-12">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = achievement.unlocked;
          const targetVal = achievement.target || 1;
          const progressVal = Math.min(targetVal, achievement.progress || 0);
          const percent = isUnlocked ? 100 : Math.min(100, Math.round((progressVal / targetVal) * 100));

          return (
            <div
              key={achievement.id}
              className={`rounded-xl p-4 transition-all duration-300 relative border flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-br from-[#131b2f] via-[#15203b] to-[#1a2542] border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/20'
                  : 'bg-[#131b2f]/60 border-slate-800 opacity-65 hover:opacity-90'
              }`}
            >
              {/* Glowing Corner Badge for Unlocked */}
              {isUnlocked && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" /> ปลดล็อกแล้ว
                </div>
              )}

              {!isUnlocked && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700/50">
                  <Lock className="w-3 h-3" /> ล็อกอยู่
                </div>
              )}

              {/* Main Info */}
              <div className="flex items-start gap-3.5 pr-20">
                {/* Emoji Icon Container */}
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border transition-transform ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-900 border-slate-800 grayscale'
                  }`}
                >
                  <span>{achievement.icon}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-sm font-bold tracking-wide flex items-center gap-1.5 ${
                    isUnlocked ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Progress & Target Section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-slate-400 text-[11px]">
                    ความคืบหน้า:
                  </span>
                  <span className={isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {progressVal.toLocaleString()} / {targetVal.toLocaleString()} ({percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Subtext info */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
                  <span>
                    {isUnlocked && achievement.unlockedAt ? (
                      `ปลดล็อกเมื่อ ${achievement.unlockedAt}`
                    ) : isUnlocked ? (
                      'สำเร็จแล้ว (+XP Bonus)'
                    ) : (
                      `ต้องการอีก ${(targetVal - progressVal).toLocaleString()}`
                    )}
                  </span>
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> สำเร็จ
                    </span>
                  ) : (
                    <span className="text-slate-400">ยังไม่สำเร็จ</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
          ไม่พบรายการความสำเร็จในหมวดหมู่นี้
        </div>
      )}
    </div>
  );
}
