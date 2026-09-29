"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Medal,
  TrendingUp,
  Search,
  ArrowUpDown,
  ShieldCheck,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useTrading, type CopyTrader } from '@/context/TradingContext';

type SortField = 'totalProfit' | 'winRate' | 'followers' | 'trades';
type SortOrder = 'desc' | 'asc';

export default function SocialCopyTrade() {
  const { copyTraders, followTrader, unfollowTrader } = useTrading();

  // Sorting and Filtering states
  const [sortBy, setSortBy] = useState<SortField>('totalProfit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Selected Trader for detailed modal
  const [selectedTrader, setSelectedTrader] = useState<CopyTrader | null>(null);
  
  // Simulated copy trade settings per trader (custom multiplier / SL)
  const [copyRatio, setCopyRatio] = useState<number>(100);
  const [stopLossPercent, setStopLossPercent] = useState<number>(15);

  // SSR Mount Check for Recharts
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered and Sorted traders
  const processedTraders = useMemo(() => {
    let result = [...copyTraders];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(trader =>
        trader.name.toLowerCase().includes(q) ||
        trader.id.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (sortOrder === 'desc') {
        return valB - valA;
      }
      return valA - valB;
    });

    return result;
  }, [copyTraders, sortBy, sortOrder, searchQuery]);

  // Traders currently being followed
  const followedTraders = useMemo(() => {
    return copyTraders.filter(t => t.isFollowing);
  }, [copyTraders]);

  // Overall statistics summary
  const summaryStats = useMemo(() => {
    const totalTraders = copyTraders.length;
    const totalFollowers = copyTraders.reduce((acc, t) => acc + t.followers, 0);
    const totalProfitSum = copyTraders.reduce((acc, t) => acc + t.totalProfit, 0);
    const avgWinRate = totalTraders > 0
      ? (copyTraders.reduce((acc, t) => acc + t.winRate, 0) / totalTraders).toFixed(1)
      : '0.0';

    return {
      totalTraders,
      totalFollowers,
      totalProfitSum,
      avgWinRate,
    };
  }, [copyTraders]);

  // Toggle sort handler
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Rank badge styling helper
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-400/50 text-amber-300 font-bold shadow-md shadow-amber-500/10" title="อันดับ 1 (ทองคำ)">
          <Crown size={18} className="text-amber-400 drop-shadow" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300/20 to-slate-400/20 border border-slate-300/50 text-slate-200 font-bold" title="อันดับ 2 (เงิน)">
          <Medal size={18} className="text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-700/20 to-amber-800/20 border border-amber-600/50 text-amber-500 font-bold" title="อันดับ 3 (ทองแดง)">
          <Medal size={18} className="text-amber-600" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
        #{rank}
      </div>
    );
  };

  // Generate simulated chart data for trader detail modal (deterministic to prevent jitter)
  const generateTraderEquityCurve = (trader: CopyTrader) => {
    const points = 12;
    const data = [];
    let currentEquity = 50000;
    const stepGain = trader.totalProfit / points;

    for (let i = 1; i <= points; i++) {
      const noise = (Math.sin(i * 1.5 + (trader.winRate * 0.1)) * 0.12 + Math.cos(i * 0.9) * 0.05) * stepGain;
      currentEquity += stepGain * (trader.winRate / 70) + noise;
      data.push({
        month: `M${i}`,
        equity: Math.round(currentEquity),
      });
    }
    return data;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] text-slate-200 min-h-0 overflow-y-auto rounded-md border border-slate-800 m-2 relative">
      {/* Header */}
      <div className="bg-[#131b2f] border-b border-slate-800 p-4 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌍</span>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Copy Trade - ก็อปปี้จากคนเก่ง
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles size={12} /> Real-time Sync
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            คัดลอกคำสั่งเทรดอัตโนมัติจาก Master Trader ชั้นนำที่มีประวัติการทำกำไรสูงสุด
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2 md:gap-4 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users size={14} className="text-blue-400" />
            <span className="text-slate-400">มาสเตอร์:</span>
            <span className="font-semibold text-white">{summaryStats.totalTraders}</span>
          </div>
          <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Flame size={14} className="text-amber-400" />
            <span className="text-slate-400">กำไรรวม:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              +฿{(summaryStats.totalProfitSum / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-6">
        {/* ======================================================== */}
        {/* 1. FOLLOWING SECTION (Show if any traders are followed) */}
        {/* ======================================================== */}
        {followedTraders.length > 0 && (
          <section className="bg-gradient-to-r from-emerald-950/20 via-[#131b2f] to-[#131b2f] border border-emerald-500/30 rounded-xl p-4 md:p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 -ml-5"></div>
                <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  กำลังติดตาม (Following) ({followedTraders.length} คน)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                ระบบจะเปิดออเดอร์ตามเทรดเดอร์เหล่านี้อัตโนมัติทันที
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {followedTraders.map((trader) => (
                <div
                  key={`followed-${trader.id}`}
                  className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all rounded-lg p-3.5 flex flex-col justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner">
                        {trader.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          {trader.name}
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{trader.trades.toLocaleString()} ไม้</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Auto-Copy Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">กำไรสะสม</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        +฿{trader.totalProfit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Win Rate Bar & Action */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-emerald-400 font-semibold">{trader.winRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, trader.winRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedTrader(trader)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-500/10 transition"
                    >
                      <SlidersHorizontal size={13} />
                      ตั้งค่าไม้
                    </button>
                    <button
                      onClick={() => unfollowTrader(trader.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all font-medium"
                      title="ยกเลิกการติดตาม"
                    >
                      <UserMinus size={13} />
                      ยกเลิกติดตาม
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. FILTER & SORT CONTROLS BAR                            */}
        {/* ======================================================== */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเทรดเดอร์ (ชื่อ หรือ ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Buttons & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <ArrowUpDown size={13} /> จัดเรียง:
            </span>

            {/* Profit Sort */}
            <button
              onClick={() => handleSortChange('totalProfit')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
                sortBy === 'totalProfit'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <TrendingUp size={13} />
              กำไร
              {sortBy === 'totalProfit' && (
                <span className="text-[10px] text-blue-400 font-bold">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>

            {/* Win Rate Sort */}
            <button
              onClick={() => handleSortChange('winRate')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
                sortBy === 'winRate'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Activity size={13} />
              Win Rate
              {sortBy === 'winRate' && (
                <span className="text-[10px] text-emerald-400 font-bold">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>

            {/* Followers Sort */}
            <button
              onClick={() => handleSortChange('followers')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
                sortBy === 'followers'
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users size={13} />
              ผู้ติดตาม
              {sortBy === 'followers' && (
                <span className="text-[10px] text-purple-400 font-bold">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>

            {/* View Switcher */}
            <div className="flex bg-slate-900 rounded-lg border border-slate-800 overflow-hidden ml-auto md:ml-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 text-xs transition ${
                  viewMode === 'table' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ตาราง Leaderboard"
              >
                <Layers size={14} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 text-xs transition ${
                  viewMode === 'cards' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="การ์ด Grid"
              >
                <BarChart2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. LEADERBOARD (TABLE OR CARDS VIEW)                     */}
        {/* ======================================================== */}
        <section className="bg-[#131b2f] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Master Traders Leaderboard
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              พบ {processedTraders.length} เทรดเดอร์
            </span>
          </div>

          {processedTraders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">ไม่พบเทรดเดอร์ที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                ล้างคำค้นหา
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 w-16 text-center">อันดับ</th>
                    <th className="py-3 px-4">เทรดเดอร์</th>
                    <th className="py-3 px-4 min-w-[150px]">Win Rate</th>
                    <th className="py-3 px-4 text-right">กำไรสะสม</th>
                    <th className="py-3 px-4 text-right">ผู้ติดตาม</th>
                    <th className="py-3 px-4 text-right">จำนวนไม้</th>
                    <th className="py-3 px-4 text-center">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {processedTraders.map((trader, index) => {
                    const rank = index + 1;
                    const isFollowed = trader.isFollowing;
                    
                    return (
                      <tr
                        key={trader.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isFollowed ? 'bg-emerald-950/10' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            {renderRankBadge(rank)}
                          </div>
                        </td>

                        {/* Avatar & Name */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setSelectedTrader(trader)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:border-blue-400 flex items-center justify-center text-xl transition shadow-sm">
                              {trader.avatar}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-blue-400 transition flex items-center gap-1.5">
                                {trader.name}
                                {rank <= 3 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    TOP
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                ID: {trader.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Win Rate */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold font-mono text-emerald-400">
                                {trader.winRate}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {trader.winRate >= 70 ? 'สูงมาก 🔥' : trader.winRate >= 65 ? 'ยอดเยี่ยม ⚡' : 'มาตรฐาน'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  trader.winRate >= 70
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : trader.winRate >= 65
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                }`}
                                style={{ width: `${Math.min(100, trader.winRate)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Total Profit */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono font-bold text-emerald-400 text-sm md:text-base">
                            +฿{trader.totalProfit.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            เฉลี่ย ฿{trader.trades > 0 ? (trader.totalProfit / trader.trades).toFixed(0) : '0'}/ไม้
                          </div>
                        </td>

                        {/* Followers */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono text-slate-200 flex items-center justify-end gap-1.5">
                            <Users size={13} className="text-slate-400" />
                            {trader.followers.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">คนคัดลอก</div>
                        </td>

                        {/* Trades Count */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono text-slate-200 flex items-center justify-end gap-1.5">
                            <TrendingUp size={13} className="text-slate-400" />
                            {trader.trades.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">Orders</div>
                        </td>

                        {/* Follow / Unfollow Action Button */}
                        <td className="py-3 px-4 text-center">
                          {isFollowed ? (
                            <button
                              onClick={() => unfollowTrader(trader.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-rose-600 hover:border-rose-500 transition-all duration-200 text-xs font-semibold shadow-md shadow-emerald-950 group"
                              title="คลิกเพื่อยกเลิกติดตาม"
                            >
                              <span className="flex items-center gap-1 group-hover:hidden">
                                <CheckCircle2 size={13} />
                                กำลังติดตาม
                              </span>
                              <span className="hidden items-center gap-1 group-hover:flex">
                                <UserMinus size={13} />
                                ยกเลิกติดตาม
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => followTrader(trader.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-blue-500/60 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all duration-200 text-xs font-semibold shadow-sm"
                            >
                              <UserPlus size={13} />
                              ก็อปปี้เทรด
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {processedTraders.map((trader, index) => {
                const rank = index + 1;
                const isFollowed = trader.isFollowing;

                return (
                  <div
                    key={trader.id}
                    className={`bg-slate-900/90 rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all hover:shadow-xl ${
                      isFollowed
                        ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Rank & Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                            {trader.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            {renderRankBadge(rank)}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-white text-base flex items-center gap-1.5">
                            {trader.name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: {trader.id}
                          </div>
                        </div>
                      </div>

                      {isFollowed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">กำไรสะสม</div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          +฿{trader.totalProfit.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Win Rate</div>
                        <div className="font-mono font-bold text-white text-sm">
                          {trader.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">ผู้ติดตาม</div>
                        <div className="font-mono text-slate-300 text-xs flex items-center gap-1">
                          <Users size={11} className="text-slate-500" />
                          {trader.followers.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">จำนวนไม้</div>
                        <div className="font-mono text-slate-300 text-xs flex items-center gap-1">
                          <TrendingUp size={11} className="text-slate-500" />
                          {trader.trades.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Win Rate Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">อัตราชนะ</span>
                        <span className="text-emerald-400 font-semibold">{trader.winRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, trader.winRate)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedTrader(trader)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition text-center"
                      >
                        ดูสถิติ
                      </button>

                      {isFollowed ? (
                        <button
                          onClick={() => unfollowTrader(trader.id)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-rose-600 text-white text-xs font-semibold transition group flex items-center justify-center gap-1"
                        >
                          <span className="group-hover:hidden">กำลังตาม</span>
                          <span className="hidden group-hover:inline">ยกเลิก</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => followTrader(trader.id)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-blue-500/60 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1"
                        >
                          <UserPlus size={13} />
                          ก็อปปี้เทรด
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ======================================================== */}
      {/* 4. TRADER DETAIL & SIMULATION MODAL                      */}
      {/* ======================================================== */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2f] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                  {selectedTrader.avatar}
                </div>
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedTrader.name}
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Master Trader ID: <span className="font-mono text-slate-300">{selectedTrader.id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrader(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Win Rate</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {selectedTrader.winRate}%
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">กำไรรวม</div>
                  <div className="text-lg font-bold font-mono text-white">
                    +฿{(selectedTrader.totalProfit / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">ผู้ติดตาม</div>
                  <div className="text-lg font-bold font-mono text-blue-400">
                    {selectedTrader.followers.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">ออเดอร์ทั้งหมด</div>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    {selectedTrader.trades.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Equity Performance Curve (Recharts) */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-400" />
                    กราฟผลตอบแทนสะสม (Cumulative Performance)
                  </div>
                  <span className="text-[10px] text-slate-500">12 เดือนย้อนหลัง</span>
                </div>
                <div className="h-44 w-full">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={generateTraderEquityCurve(selectedTrader)}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                          formatter={(val: unknown) => [`฿${Number(val).toLocaleString()}`, 'ยอดพอร์ต']}
                        />
                        <Area
                          type="monotone"
                          dataKey="equity"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#equityGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Copy Trade Settings Config */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-blue-400" />
                  การตั้งค่าความเสี่ยงการคัดลอก (Copy Settings)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Copy Ratio Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">สัดส่วนขนาดไม้ (Copy Multiplier)</span>
                      <span className="font-mono text-blue-400 font-bold">{copyRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="200"
                      step="25"
                      value={copyRatio}
                      onChange={(e) => setCopyRatio(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>25% (เซฟ)</span>
                      <span>100% (ปกติ)</span>
                      <span>200% (เท่าตัว)</span>
                    </div>
                  </div>

                  {/* Stop Loss Cutoff */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">ตัดขาดทุนอัตโนมัติ (Max Drawdown SL)</span>
                      <span className="font-mono text-rose-400 font-bold">-{stopLossPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={stopLossPercent}
                      onChange={(e) => setStopLossPercent(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>-5%</span>
                      <span>-15% (แนะนำ)</span>
                      <span>-40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedTrader(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition"
              >
                ปิดหน้าต่าง
              </button>

              {selectedTrader.isFollowing ? (
                <button
                  onClick={() => {
                    unfollowTrader(selectedTrader.id);
                    setSelectedTrader(prev => prev ? { ...prev, isFollowing: false } : null);
                  }}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-rose-950"
                >
                  <UserMinus size={15} />
                  ยกเลิกการก็อปปี้
                </button>
              ) : (
                <button
                  onClick={() => {
                    followTrader(selectedTrader.id, { copyRatio, stopLossPercent });
                    setSelectedTrader(prev => prev ? { ...prev, isFollowing: true } : null);
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  <UserPlus size={15} />
                  ยืนยันการก็อปปี้เทรด ({copyRatio}%)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
