"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Activity,
  Filter,
  Info,
  SlidersHorizontal,
  Check,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts';
import { useTrading, HeatmapItem } from '@/context/TradingContext';

// Category classification helper
function getAssetCategory(symbol: string): { label: string; tag: string; badgeClass: string } {
  if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL')) {
    return {
      label: 'Crypto',
      tag: 'CRYPTO',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }
  if (symbol.includes('SP500') || symbol.includes('NASDAQ') || symbol.includes('DOW')) {
    return {
      label: 'ดัชนีหุ้น',
      tag: 'INDEX',
      badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    };
  }
  if (symbol.includes('GOLD') || symbol.includes('SILVER') || symbol.includes('OIL')) {
    return {
      label: 'สินค้าโภคภัณฑ์',
      tag: 'COMMODITY',
      badgeClass: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30',
    };
  }
  return {
    label: 'Forex',
    tag: 'FOREX',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };
}

// Formatting helpers
function formatPrice(symbol: string, price: number): string {
  if (symbol.includes('/') && !symbol.includes('BTC') && !symbol.includes('ETH')) {
    if (symbol.includes('JPY')) {
      return price.toFixed(2);
    }
    return price.toFixed(4);
  }
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
  return vol.toLocaleString();
}

// Color scale configuration based on percentage change
function getHeatmapColorStyle(change: number) {
  const absChange = Math.abs(change);
  const isPositive = change > 0;
  const isZero = Math.abs(change) < 0.001;

  if (isZero) {
    return {
      bg: 'bg-slate-800/80 hover:bg-slate-750',
      border: 'border-slate-700/60 hover:border-slate-500',
      text: 'text-slate-300',
      badgeBg: 'bg-slate-700/60 text-slate-300 border-slate-600',
      glow: 'shadow-none',
      indicatorColor: 'text-slate-400',
      fillHex: '#475569',
    };
  }

  if (isPositive) {
    if (absChange >= 3.0) {
      return {
        bg: 'bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600',
        border: 'border-emerald-400/80 hover:border-emerald-300',
        text: 'text-white',
        badgeBg: 'bg-black/30 text-white border-emerald-300/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
        indicatorColor: 'text-emerald-100',
        fillHex: '#059669',
      };
    } else if (absChange >= 1.5) {
      return {
        bg: 'bg-gradient-to-br from-emerald-700/90 to-green-850/90 hover:from-emerald-600/95 hover:to-green-800/95',
        border: 'border-emerald-500/60 hover:border-emerald-400',
        text: 'text-emerald-50',
        badgeBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-500/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        indicatorColor: 'text-emerald-200',
        fillHex: '#047857',
      };
    } else if (absChange >= 0.6) {
      return {
        bg: 'bg-gradient-to-br from-emerald-900/80 via-emerald-950/85 to-[#0e172a] hover:from-emerald-850 hover:to-slate-900',
        border: 'border-emerald-700/50 hover:border-emerald-600',
        text: 'text-emerald-100',
        badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/40',
        glow: 'shadow-none',
        indicatorColor: 'text-emerald-300',
        fillHex: '#065f46',
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-emerald-950/60 to-slate-900/90 hover:from-emerald-900/60 hover:to-slate-850',
        border: 'border-emerald-800/40 hover:border-emerald-700',
        text: 'text-emerald-200',
        badgeBg: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30',
        glow: 'shadow-none',
        indicatorColor: 'text-emerald-400',
        fillHex: '#064e3b',
      };
    }
  } else {
    // Negative change
    if (absChange >= 3.0) {
      return {
        bg: 'bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600',
        border: 'border-rose-400/80 hover:border-rose-300',
        text: 'text-white',
        badgeBg: 'bg-black/30 text-white border-rose-300/40',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        indicatorColor: 'text-rose-100',
        fillHex: '#e11d48',
      };
    } else if (absChange >= 1.5) {
      return {
        bg: 'bg-gradient-to-br from-rose-700/90 to-red-850/90 hover:from-rose-600/95 hover:to-red-800/95',
        border: 'border-rose-500/60 hover:border-rose-400',
        text: 'text-rose-50',
        badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-500/30',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
        indicatorColor: 'text-rose-200',
        fillHex: '#be123c',
      };
    } else if (absChange >= 0.6) {
      return {
        bg: 'bg-gradient-to-br from-rose-900/80 via-rose-950/85 to-[#0e172a] hover:from-rose-850 hover:to-slate-900',
        border: 'border-rose-700/50 hover:border-rose-600',
        text: 'text-rose-100',
        badgeBg: 'bg-rose-950/70 text-rose-300 border-rose-700/40',
        glow: 'shadow-none',
        indicatorColor: 'text-rose-300',
        fillHex: '#9f1239',
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-rose-950/60 to-slate-900/90 hover:from-rose-900/60 hover:to-slate-850',
        border: 'border-rose-800/40 hover:border-rose-700',
        text: 'text-rose-200',
        badgeBg: 'bg-rose-950/50 text-rose-400 border-rose-800/30',
        glow: 'shadow-none',
        indicatorColor: 'text-rose-400',
        fillHex: '#881337',
      };
    }
  }
}

// Fallback dataset if context is not yet populated
const fallbackHeatmapData: HeatmapItem[] = [
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

export default function MarketHeatmap() {
  const { heatmapData = [] } = useTrading();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'symbol'>('volume');
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HeatmapItem | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'dual' | 'chart'>('heatmap');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use context data or fallback
  const rawData = useMemo(() => {
    if (heatmapData && heatmapData.length > 0) return heatmapData;
    return fallbackHeatmapData;
  }, [heatmapData]);

  // Total market volume
  const totalVolume = useMemo(() => {
    return rawData.reduce((sum, item) => sum + item.volume, 0);
  }, [rawData]);

  // Max volume for proportional calculations
  const maxVolume = useMemo(() => {
    return Math.max(...rawData.map(d => d.volume), 1);
  }, [rawData]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    return rawData
      .filter(item => {
        // Category filter
        if (activeCategory !== 'ALL') {
          const cat = getAssetCategory(item.symbol).tag;
          if (activeCategory === 'GAINERS' && item.change <= 0) return false;
          if (activeCategory === 'LOSERS' && item.change >= 0) return false;
          if (activeCategory === 'CRYPTO' && cat !== 'CRYPTO') return false;
          if (activeCategory === 'FOREX' && cat !== 'FOREX') return false;
          if (activeCategory === 'COMMODITY' && cat !== 'COMMODITY') return false;
          if (activeCategory === 'INDEX' && cat !== 'INDEX') return false;
        }
        // Search query filter
        if (searchQuery.trim() !== '') {
          return item.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim());
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'volume') return b.volume - a.volume;
        if (sortBy === 'change') return b.change - a.change;
        return a.symbol.localeCompare(b.symbol);
      });
  }, [rawData, activeCategory, searchQuery, sortBy]);

  // Market Summary Statistics
  const summaryStats = useMemo(() => {
    let greenCount = 0;
    let redCount = 0;
    let neutralCount = 0;
    let strongestGainer = rawData[0] || null;
    let biggestLoser = rawData[0] || null;
    let totalChange = 0;

    for (const item of rawData) {
      if (item.change > 0) greenCount++;
      else if (item.change < 0) redCount++;
      else neutralCount++;

      totalChange += item.change;

      if (!strongestGainer || item.change > strongestGainer.change) {
        strongestGainer = item;
      }
      if (!biggestLoser || item.change < biggestLoser.change) {
        biggestLoser = item;
      }
    }

    const avgChange = rawData.length > 0 ? totalChange / rawData.length : 0;
    const greenPercent = rawData.length > 0 ? (greenCount / rawData.length) * 100 : 50;

    return {
      greenCount,
      redCount,
      neutralCount,
      strongestGainer,
      biggestLoser,
      avgChange,
      greenPercent,
      totalCount: rawData.length,
    };
  }, [rawData]);

  // Dynamic CSS Grid Spanning based on relative volume
  // Proportional sizing using CSS grid spans
  const getGridSpans = (item: HeatmapItem) => {
    // If user filtered down to few items, adjust spans to fill grid smoothly
    if (processedData.length <= 4) {
      return 'col-span-1 md:col-span-2 row-span-1 md:row-span-2';
    }

    const volumeRatio = item.volume / maxVolume;

    // High volume assets (e.g., BTC, NASDAQ): 2 columns x 2 rows
    if (volumeRatio >= 0.75) {
      return 'col-span-2 row-span-2';
    }
    // Medium-high volume assets (e.g., SP500, ETH): 2 columns x 1 row or 1 col x 2 rows
    if (volumeRatio >= 0.55) {
      return 'col-span-2 sm:col-span-2 md:col-span-2 row-span-1';
    }
    // Medium volume assets: 1 column x 1 row
    return 'col-span-1 row-span-1';
  };

  // Recharts chart data
  const chartData = useMemo(() => {
    return [...rawData]
      .sort((a, b) => b.change - a.change)
      .map(item => ({
        symbol: item.symbol,
        change: Number(item.change.toFixed(2)),
        volume: item.volume,
        price: item.price,
      }));
  }, [rawData]);

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col bg-[#0a0f1c] min-h-[500px] rounded-lg border border-slate-800 p-6 items-center justify-center text-slate-400">
        <Activity className="animate-spin text-emerald-400 mb-2" size={28} />
        <span className="text-sm">กำลังโหลดข้อมูลแผนที่ความร้อนตลาด...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] min-h-0 overflow-hidden rounded-lg border border-slate-800 shadow-2xl relative text-slate-200">
      
      {/* ================= HEADER ================= */}
      <div className="bg-[#131b2f] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-wide">
                แผนที่ความร้อนตลาด
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                เรียลไทม์
              </span>
            </div>
            <p className="text-xs text-slate-400">
              วิเคราะห์สัดส่วนปริมาณการซื้อขายและทิศทางราคาของคู่สินทรัพย์ทั้งหมด
            </p>
          </div>
        </div>

        {/* View Mode Switches & Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-[#0a0f1c] p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'heatmap'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={13} />
              <span className="hidden sm:inline">ตาราง</span>ความร้อน
            </button>
            <button
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'dual'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={13} />
              <span className="hidden sm:inline">มุมมอง</span>คู่
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'chart'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={13} />
              <span className="hidden sm:inline">กราฟ</span>เปรียบเทียบ
            </button>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY STATS ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-4 bg-[#0d1424] border-b border-slate-800">
        
        {/* Metric 1: Total Green vs Red Count (สัดส่วนตลาด) */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity size={14} className="text-emerald-400" />
              สัดส่วนตลาด (เขียว / แดง)
            </span>
            <span className="text-[10px] text-slate-500">
              รวม {summaryStats.totalCount} คู่
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">
              {summaryStats.greenCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">บวก</span>
            <span className="text-slate-600 font-mono">/</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-rose-400">
              {summaryStats.redCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">ลบ</span>
          </div>

          {/* Visual Market Breadth Bar */}
          <div className="w-full mt-2">
            <div className="h-1.5 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${summaryStats.greenPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
              <span className="text-emerald-400">
                {summaryStats.greenPercent.toFixed(0)}% ขาขึ้น
              </span>
              <span className="text-rose-400">
                {(100 - summaryStats.greenPercent).toFixed(0)}% ขาลง
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Strongest Gainer (บวกแรงสุด) */}
        <div className="bg-[#131b2f] border border-emerald-900/40 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <TrendingUp size={14} />
              บวกแรงที่สุด
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Top Gainer
            </span>
          </div>

          {summaryStats.strongestGainer ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg md:text-xl font-bold font-mono text-slate-100">
                  {summaryStats.strongestGainer.symbol}
                </span>
                <span className="text-base md:text-lg font-bold font-mono text-emerald-400 flex items-center">
                  +{summaryStats.strongestGainer.change.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                <span>ราคา: ${formatPrice(summaryStats.strongestGainer.symbol, summaryStats.strongestGainer.price)}</span>
                <span className="text-slate-500">Vol: {formatVolume(summaryStats.strongestGainer.volume)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">-</div>
          )}
        </div>

        {/* Metric 3: Biggest Loser (ลบหนักสุด) */}
        <div className="bg-[#131b2f] border border-rose-900/40 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-rose-400">
              <TrendingDown size={14} />
              ลบหนักที่สุด
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Top Loser
            </span>
          </div>

          {summaryStats.biggestLoser ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg md:text-xl font-bold font-mono text-slate-100">
                  {summaryStats.biggestLoser.symbol}
                </span>
                <span className="text-base md:text-lg font-bold font-mono text-rose-400 flex items-center">
                  {summaryStats.biggestLoser.change.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                <span>ราคา: ${formatPrice(summaryStats.biggestLoser.symbol, summaryStats.biggestLoser.price)}</span>
                <span className="text-slate-500">Vol: {formatVolume(summaryStats.biggestLoser.volume)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">-</div>
          )}
        </div>

        {/* Metric 4: Total Volume & Market Average */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <BarChart3 size={14} className="text-blue-400" />
              ปริมาณการซื้อขายรวม
            </span>
            <span className="text-[10px] text-slate-500">24H Volume</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl md:text-2xl font-bold font-mono text-blue-400">
                {formatVolume(totalVolume)}
              </span>
              <span
                className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                  summaryStats.avgChange >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                เฉลี่ย {summaryStats.avgChange >= 0 ? '+' : ''}{summaryStats.avgChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
              <span className="text-slate-400">ความผันผวนรวม</span>
              <span className="text-slate-300 font-semibold">ปานกลาง-สูง</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="px-4 py-2.5 bg-[#0a0f1c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'GAINERS', label: '🟢 ขาขึ้น' },
            { id: 'LOSERS', label: '🔴 ขาลง' },
            { id: 'CRYPTO', label: 'Crypto' },
            { id: 'FOREX', label: 'Forex' },
            { id: 'INDEX', label: 'ดัชนี' },
            { id: 'COMMODITY', label: 'สินค้า' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeCategory === tab.id
                  ? 'bg-slate-700 text-white font-semibold shadow-inner'
                  : 'bg-[#131b2f] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคู่เงิน..."
              className="w-32 sm:w-44 bg-[#131b2f] border border-slate-700/80 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-1 bg-[#131b2f] border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="volume" className="bg-slate-900 text-slate-200">เรียงตาม Volume</option>
              <option value="change" className="bg-slate-900 text-slate-200">เรียงตาม % เปลี่ยนแปลง</option>
              <option value="symbol" className="bg-slate-900 text-slate-200">เรียงตามชื่อ</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        
        {/* 1. HEATMAP GRID VIEW (Visible in 'heatmap' and 'dual' modes) */}
        {(viewMode === 'heatmap' || viewMode === 'dual') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-400" />
                <span>มุมมองสัดส่วนปริมาณตลาด (Heatmap Treemap Grid)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (ขนาดกล่องแปรผันตาม Volume การซื้อขาย)
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                แสดงผล <span className="font-mono text-emerald-400">{processedData.length}</span> จาก{' '}
                <span className="font-mono text-slate-300">{rawData.length}</span> คู่
              </div>
            </div>

            {processedData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center bg-[#131b2f] rounded-lg border border-slate-800 text-slate-400 text-sm">
                <Search size={32} className="text-slate-600 mb-2" />
                <p>ไม่พบคู่สินทรัพย์ที่ตรงกับเงื่อนไขการค้นหา</p>
                <button
                  onClick={() => {
                    setActiveCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded border border-slate-700"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 auto-rows-[115px] sm:auto-rows-[130px] md:auto-rows-[145px] grid-flow-dense">
                {processedData.map(item => {
                  const colorTheme = getHeatmapColorStyle(item.change);
                  const categoryInfo = getAssetCategory(item.symbol);
                  const isHovered = hoveredSymbol === item.symbol;
                  const isSelected = selectedItem?.symbol === item.symbol;
                  const gridSpanClass = getGridSpans(item);
                  const volumePercentage = ((item.volume / (totalVolume || 1)) * 100).toFixed(1);

                  return (
                    <div
                      key={item.symbol}
                      onMouseEnter={() => setHoveredSymbol(item.symbol)}
                      onMouseLeave={() => setHoveredSymbol(null)}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative rounded-lg border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${gridSpanClass} ${colorTheme.bg} ${colorTheme.border} ${colorTheme.glow} ${
                        isHovered ? 'scale-[1.015] z-20 ring-2 ring-white/30 shadow-xl' : 'z-10'
                      } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                    >
                      {/* Top Bar: Symbol Name & Category Tag */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm md:text-base font-mono text-slate-100 tracking-tight drop-shadow-sm">
                              {item.symbol}
                            </span>
                            {/* Flame icon for top gainers */}
                            {item.change >= 2.5 && (
                              <Flame size={13} className="text-amber-300 animate-bounce" />
                            )}
                          </div>
                          <span className={`text-[9px] uppercase font-semibold px-1 py-0.5 rounded border ${categoryInfo.badgeClass}`}>
                            {categoryInfo.tag}
                          </span>
                        </div>

                        {/* Change Percentage Badge */}
                        <div
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold tracking-tight ${colorTheme.badgeBg}`}
                        >
                          {item.change > 0 ? (
                            <ArrowUpRight size={13} className="stroke-[2.5]" />
                          ) : item.change < 0 ? (
                            <ArrowDownRight size={13} className="stroke-[2.5]" />
                          ) : null}
                          <span>
                            {item.change > 0 ? '+' : ''}
                            {item.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Middle: Price */}
                      <div className="my-auto py-1">
                        <div className="text-xs text-slate-400/90 font-medium">ราคาปัจจุบัน</div>
                        <div className="text-base md:text-lg font-bold font-mono text-white drop-shadow-sm truncate">
                          ${formatPrice(item.symbol, item.price)}
                        </div>
                      </div>

                      {/* Bottom Bar: Volume Details & Proportional Indicator */}
                      <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300/90">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[10px]">Vol:</span>
                          <span className="font-semibold text-slate-200">
                            {formatVolume(item.volume)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {volumePercentage}% ตลาด
                        </div>
                      </div>

                      {/* Extended Hover Tooltip Popover */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-3 rounded-lg flex flex-col justify-between text-xs z-30 transition-all border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
                            <div>
                              <div className="font-bold text-slate-100 text-sm font-mono flex items-center gap-1">
                                {item.symbol}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({categoryInfo.label})
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ส่วนแบ่ง Volume: <span className="text-emerald-400 font-mono font-semibold">{volumePercentage}%</span>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                                item.change >= 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-1 text-[11px] font-mono">
                            <div className="bg-[#131b2f] p-1.5 rounded border border-slate-800">
                              <div className="text-[9px] text-slate-400">ราคาซื้อขาย</div>
                              <div className="text-slate-100 font-semibold">${formatPrice(item.symbol, item.price)}</div>
                            </div>
                            <div className="bg-[#131b2f] p-1.5 rounded border border-slate-800">
                              <div className="text-[9px] text-slate-400">Volume 24H</div>
                              <div className="text-slate-100 font-semibold">{item.volume.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 text-blue-400">
                              <Zap size={11} /> คลิกเพื่อดูเจาะลึก
                            </span>
                            <span className="text-slate-500">
                              {item.change >= 0 ? 'สัญญาณซื้อเป็นต่อ' : 'สัญญาณขายเป็นต่อ'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. RECHARTS COMPARISON CHART (Visible in 'dual' and 'chart' modes) */}
        {(viewMode === 'chart' || viewMode === 'dual') && (
          <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  กราฟเปรียบเทียบการเปลี่ยนแปลงราคา (% Change Comparison)
                </h3>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> ขาขึ้น (+%)
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> ขาลง (-%)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                >
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="symbol"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={val => `${val}%`}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                            <div className="font-bold text-white mb-1 flex items-center justify-between gap-4">
                              <span>{data.symbol}</span>
                              <span className={data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {data.change >= 0 ? '+' : ''}{data.change}%
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              ราคา: ${formatPrice(data.symbol, data.price)}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Volume: {data.volume.toLocaleString()}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="change" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.change >= 0 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ================= COLOR SCALE LEGEND ================= */}
        <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info size={14} className="text-blue-400 shrink-0" />
            <span>
              <strong className="text-slate-200">คำอธิบายสี:</strong> ยิ่งสีเข้ม = เปอร์เซ็นต์การเคลื่อนไหวของราคายิ่งสูง
            </span>
          </div>

          {/* Color Scale Gradient Bar */}
          <div className="flex flex-col items-center gap-1 w-full md:w-auto">
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span className="text-rose-400 font-bold">&le; -3%</span>
              
              {/* Discrete Color Steps */}
              <div className="flex h-4 rounded overflow-hidden border border-slate-700 shadow-inner">
                <div className="w-7 bg-rose-600" title="≤ -3.0%" />
                <div className="w-7 bg-rose-700" title="-2.0%" />
                <div className="w-7 bg-rose-900" title="-1.0%" />
                <div className="w-7 bg-rose-950" title="-0.5%" />
                <div className="w-6 bg-slate-800" title="0.0% (เป็นกลาง)" />
                <div className="w-7 bg-emerald-950" title="+0.5%" />
                <div className="w-7 bg-emerald-900" title="+1.0%" />
                <div className="w-7 bg-emerald-700" title="+2.0%" />
                <div className="w-7 bg-emerald-600" title="≥ +3.0%" />
              </div>

              <span className="text-emerald-400 font-bold">&ge; +3%</span>
            </div>

            <div className="flex justify-between w-full text-[10px] text-slate-500 font-mono px-1">
              <span>ลบหนัก</span>
              <span>เป็นกลาง</span>
              <span>บวกแรง</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-[#0a0f1c] px-3 py-1.5 rounded border border-slate-800 text-center">
            ขนาดพื้นที่กล่อง = <span className="text-amber-400 font-semibold">Volume สัดส่วนตลาด</span>
          </div>
        </div>
      </div>

      {/* ================= MODAL: DETAILED ASSET INSPECTOR ================= */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#131b2f] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Flame size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
                    {selectedItem.symbol}
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getAssetCategory(selectedItem.symbol).badgeClass}`}>
                      {getAssetCategory(selectedItem.symbol).label}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">ข้อมูลรายละเอียดสินทรัพย์แบบเรียลไทม์</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0a0f1c] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 mb-0.5">ราคาปัจจุบัน</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${formatPrice(selectedItem.symbol, selectedItem.price)}
                </div>
              </div>

              <div className="bg-[#0a0f1c] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 mb-0.5">การเปลี่ยนแปลง 24H</div>
                <div
                  className={`text-lg font-bold font-mono ${
                    selectedItem.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedItem.change >= 0 ? '+' : ''}{selectedItem.change.toFixed(2)}%
                </div>
              </div>

              <div className="bg-[#0a0f1c] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 mb-0.5">ปริมาณซื้อขาย (Volume)</div>
                <div className="text-base font-bold font-mono text-blue-400">
                  {selectedItem.volume.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#0a0f1c] p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 mb-0.5">ส่วนแบ่งตลาดทั้งหมด</div>
                <div className="text-base font-bold font-mono text-amber-400">
                  {((selectedItem.volume / (totalVolume || 1)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Quick status insight */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>
                {selectedItem.change >= 2.0
                  ? 'สินทรัพย์มีแรงซื้อสะสมสูง มีโมเมนตัมขาขึ้นโดดเด่นในตลาด'
                  : selectedItem.change <= -2.0
                  ? 'สินทรัพย์เผชิญแรงเทขายอย่างหนัก ควรระมัดระวังความเสี่ยง'
                  : 'สินทรัพย์แกว่งตัวในกรอบปกติ เหมาะสำหรับการเทรดระยะสั้นตามรอบ'}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
