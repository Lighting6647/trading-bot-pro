"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart2, 
  Layers, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { useTrading, type TimeframeAnalysis } from '@/context/TradingContext';

// Default fallback timeframes if context data is empty
const defaultTimeframeFallback: TimeframeAnalysis[] = [
  { timeframe: '1m', trend: 'UP', strength: 65 },
  { timeframe: '5m', trend: 'UP', strength: 72 },
  { timeframe: '15m', trend: 'DOWN', strength: 45 },
  { timeframe: '1h', trend: 'UP', strength: 80 },
  { timeframe: '4h', trend: 'SIDEWAYS', strength: 50 },
  { timeframe: '1D', trend: 'UP', strength: 88 },
];

// Timeframe meta configuration for labels and trade styles
const timeframeMeta: Record<string, { labelTh: string; role: string; horizon: string }> = {
  '1m': { labelTh: '1 นาที', role: 'Scalping จุดเข้าเร็ว', horizon: 'สั้นพิเศษ' },
  '5m': { labelTh: '5 นาที', role: 'Micro Trend โมเมนตัม', horizon: 'ระยะสั้น' },
  '15m': { labelTh: '15 นาที', role: 'Short Term แนวรับต้าน', horizon: 'สั้นกลาง' },
  '1h': { labelTh: '1 ชั่วโมง', role: 'Intraday แนวโน้มประจำวัน', horizon: 'รายวัน' },
  '4h': { labelTh: '4 ชั่วโมง', role: 'Swing กรอบสวิงหลัก', horizon: 'ระยะกลาง' },
  '1D': { labelTh: '1 วัน', role: 'Major Trend โครงสร้างใหญ่', horizon: 'ระยะยาว' },
};

export default function MultiTimeframe() {
  const { timeframeAnalysis, isRunning } = useTrading();
  const [mounted, setMounted] = useState(false);
  const [selectedTf, setSelectedTf] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure ordered list of timeframes (1m, 5m, 15m, 1h, 4h, 1D)
  const orderedKeys = ['1m', '5m', '15m', '1h', '4h', '1D'];

  const timeframes: TimeframeAnalysis[] = useMemo(() => {
    const source = (timeframeAnalysis && timeframeAnalysis.length > 0) 
      ? timeframeAnalysis 
      : defaultTimeframeFallback;
    
    // Sort according to standard order
    return [...source].sort((a, b) => {
      const idxA = orderedKeys.indexOf(a.timeframe);
      const idxB = orderedKeys.indexOf(b.timeframe);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [timeframeAnalysis]);

  // Calculations for confluence
  const {
    upCount,
    downCount,
    sidewaysCount,
    dominantTrend,
    dominantCount,
    confluenceFraction,
    confluencePercentage,
    interpretation,
    alignmentScore,
    avgStrength
  } = useMemo(() => {
    const total = timeframes.length || 6;
    const up = timeframes.filter(t => t.trend === 'UP').length;
    const down = timeframes.filter(t => t.trend === 'DOWN').length;
    const sideways = timeframes.filter(t => t.trend === 'SIDEWAYS').length;

    let dominant: 'UP' | 'DOWN' | 'SIDEWAYS' = 'UP';
    let maxCount = up;

    if (down > maxCount) {
      dominant = 'DOWN';
      maxCount = down;
    }
    if (sideways > maxCount) {
      dominant = 'SIDEWAYS';
      maxCount = sideways;
    }

    // Check if there is a tie between UP and DOWN
    const isMixedTie = (up === down && up === maxCount && up > 0);

    const fraction = isMixedTie ? `${up}/${total} MIXED` : `${maxCount}/${total} ${dominant}`;
    const percentage = Math.round((maxCount / total) * 100);

    // Confluence interpretation text
    let interp = {
      level: 'Moderate',
      title: 'สัญญาณปานกลาง (Moderate Signal)',
      description: 'มีแนวโน้มหลักสนับสนุนแต่ยังมีความเห็นต่างในบางกรอบเวลา ควรใช้สัญญาณยืนยันเพิ่มเติมก่อนเข้าออเดอร์',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      barColor: 'bg-amber-500',
      recommendation: 'เทรดตามเทรนด์หลัก แต่ลดขนาดไม้ลง 20-30%',
      risk: 'ปานกลาง (Medium)'
    };

    if (maxCount >= 5) {
      interp = {
        level: 'Strong',
        title: maxCount === 6 ? 'สัญญาณแข็งแกร่งสูงสุด (Ultra Strong Signal)' : 'สัญญาณแข็งแกร่ง (Strong Signal)',
        description: `มีความสอดคล้องกันสูงมาก (${maxCount}/${total} ไทม์เฟรมชี้ไปในทาง ${dominant}) โมเมนตัมมีพลังผลักดันสูงมาก เหมาะแก่การเข้า Follow Trend`,
        color: dominant === 'UP' ? 'text-emerald-400' : dominant === 'DOWN' ? 'text-rose-400' : 'text-amber-400',
        badgeBg: dominant === 'UP' 
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
          : dominant === 'DOWN'
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barColor: dominant === 'UP' ? 'bg-emerald-500' : dominant === 'DOWN' ? 'bg-rose-500' : 'bg-amber-500',
        recommendation: dominant === 'UP' ? 'เปิดสถานะ BUY ตามแนวโน้มหลัก' : dominant === 'DOWN' ? 'เปิดสถานะ SELL ตามแนวโน้มหลัก' : 'รอสัญญาณเบรกเอาท์',
        risk: 'ต่ำ (Low Risk High Confluence)'
      };
    } else if (maxCount === 4) {
      interp = {
        level: 'Moderate',
        title: 'สัญญาณปานกลางค่อนข้างดี (Moderate Signal)',
        description: `ไทม์เฟรมส่วนใหญ่ (${maxCount}/${total}) สอดคล้องกันทาง ${dominant} แต่ยังมีสัญญาณขัดแย้งในกรอบเวลาย่อยหรือใหญ่ ระวังจุดพักตัว`,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barColor: 'bg-amber-500',
        recommendation: 'เน้นเข้าออเดอร์ตามโครงสร้างใหญ่เมื่อราคาย่อตัว (Buy Dip / Sell Rally)',
        risk: 'ปานกลาง (Moderate Risk)'
      };
    } else if (isMixedTie || maxCount <= 3) {
      if (sideways >= 3) {
        interp = {
          level: 'Weak',
          title: 'ตลาดแกว่งตัวไซด์เวย์ (Range-Bound / Consolidation)',
          description: 'ตลาดไร้ทิศทางชัดเจน กรอบราคากำลังสะสมพลัง (Chop Zone) เสี่ยงโดนตัดขาดทุนจากความผันผวนย่อย',
          color: 'text-yellow-400',
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          barColor: 'bg-yellow-500',
          recommendation: 'งดเทรดหรือเล่นเฉพาะกรอบแนวรับ-แนวต้านสั้นๆ (Scalp Only)',
          risk: 'สูง (High Risk)'
        };
      } else {
        interp = {
          level: 'Mixed',
          title: 'สัญญาณผสม/ขัดแย้ง (Mixed / Conflicting Signal)',
          description: `ทิศทางไม่เป็นเอกภาพ (${up} UP vs ${down} DOWN vs ${sideways} SIDEWAYS) กรอบเวลาสั้นและยาววิ่งสวนทางกันอย่างมีนัยสำคัญ`,
          color: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barColor: 'bg-rose-500',
          recommendation: 'พักรอความชัดเจน (Stand Aside) หรือรอให้ไทม์เฟรมเล็กปรับตัวสอดคล้อง',
          risk: 'สูงมาก (Very High Risk)'
        };
      }
    }

    // Weighted score: giving higher weight to higher timeframes (1D: 30%, 4h: 25%, 1h: 20%, 15m: 12%, 5m: 8%, 1m: 5%)
    const weights: Record<string, number> = {
      '1m': 0.05,
      '5m': 0.08,
      '15m': 0.12,
      '1h': 0.20,
      '4h': 0.25,
      '1D': 0.30,
    };

    let weightedScore = 0;
    timeframes.forEach(tf => {
      const w = weights[tf.timeframe] || (1 / total);
      if (tf.trend === dominant) {
        weightedScore += w * (tf.strength / 100);
      } else if (tf.trend === 'SIDEWAYS') {
        weightedScore += w * (tf.strength / 100) * 0.4;
      }
    });

    const dominantTfs = timeframes.filter(t => t.trend === dominant);
    const meanStrength = dominantTfs.length > 0
      ? Math.round(dominantTfs.reduce((acc, curr) => acc + curr.strength, 0) / dominantTfs.length)
      : Math.round(timeframes.reduce((acc, curr) => acc + curr.strength, 0) / total);

    return {
      upCount: up,
      downCount: down,
      sidewaysCount: sideways,
      dominantTrend: dominant,
      dominantCount: maxCount,
      confluenceFraction: fraction,
      confluencePercentage: percentage,
      interpretation: interp,
      alignmentScore: Math.round(weightedScore * 100),
      avgStrength: meanStrength
    };
  }, [timeframes]);

  // Helper functions for Trend Display
  const getTrendConfig = (trend: 'UP' | 'DOWN' | 'SIDEWAYS') => {
    switch (trend) {
      case 'UP':
        return {
          label: 'UP',
          thaiLabel: 'ขาขึ้น',
          symbol: '↑',
          Icon: TrendingUp,
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          barGradient: 'from-emerald-500 to-green-400',
          dotColor: 'bg-emerald-500',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          fillColor: '#10b981',
          shadowColor: 'shadow-emerald-950/40',
        };
      case 'DOWN':
        return {
          label: 'DOWN',
          thaiLabel: 'ขาลง',
          symbol: '↓',
          Icon: TrendingDown,
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          barGradient: 'from-rose-600 to-red-400',
          dotColor: 'bg-rose-500',
          badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          fillColor: '#f43f5e',
          shadowColor: 'shadow-rose-950/40',
        };
      case 'SIDEWAYS':
      default:
        return {
          label: 'SIDEWAYS',
          thaiLabel: 'ไซด์เวย์',
          symbol: '→',
          Icon: Minus,
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          barGradient: 'from-amber-500 to-yellow-400',
          dotColor: 'bg-amber-500',
          badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          fillColor: '#f59e0b',
          shadowColor: 'shadow-amber-950/40',
        };
    }
  };

  // Chart data for Recharts
  const chartData = useMemo(() => {
    return timeframes.map(tf => {
      const config = getTrendConfig(tf.trend);
      return {
        timeframe: tf.timeframe,
        strength: Math.round(tf.strength),
        trend: tf.trend,
        thaiLabel: config.thaiLabel,
        color: config.fillColor,
        role: timeframeMeta[tf.timeframe]?.role || ''
      };
    });
  }, [timeframes]);

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] text-slate-200 min-h-0 overflow-y-auto rounded-lg border border-slate-800 p-3 sm:p-5 gap-4 sm:gap-6">
      
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-lg text-blue-400 shadow-inner">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                วิเคราะห์หลายไทม์เฟรม
              </h1>
              <span className="hidden xs:inline-flex px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                MTFA Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Timeframe Trend Confluence & Alignment Scanner
            </p>
          </div>
        </div>

        {/* Status / Live Pulse Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131b2f] border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-400">สถานะ:</span>
            <span className={`font-medium ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isRunning ? 'กำลังสแกนสด' : 'สแตนด์บาย'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-800">
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-slate-300">6 TF Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONFLUENCE HERO & INTERPRETATION (Requirements 3 & 4) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Confluence Score Card (Requirement 3: Large text fraction) */}
        <div className="lg:col-span-5 bg-[#131b2f] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                คะแนนความสอดคล้อง (Confluence Score)
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${interpretation.badgeBg}`}>
                {interpretation.level}
              </span>
            </div>

            {/* Large text Confluence Score */}
            <div className="flex items-baseline gap-3 my-2">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>{confluenceFraction.split(' ')[0]}</span>
                <span className={`text-2xl sm:text-3xl font-extrabold ${getTrendConfig(dominantTrend).textColor}`}>
                  {confluenceFraction.split(' ')[1] || dominantTrend}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>เห็นพ้องต้องกัน:</span>
              <span className="font-semibold text-slate-200">{confluencePercentage}% ของกรอบเวลา</span>
              <span className="text-slate-600">•</span>
              <span>ความแรงเฉลี่ย:</span>
              <span className="font-semibold text-slate-200 font-mono">{avgStrength}%</span>
            </div>
          </div>

          {/* Quick breakdown of direction votes */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0a0f1c] p-2 rounded border border-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-semibold mb-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>UP</span>
              </div>
              <div className="text-lg font-mono font-bold text-emerald-400">{upCount}</div>
              <div className="text-[10px] text-slate-500">ไทม์เฟรม</div>
            </div>

            <div className="bg-[#0a0f1c] p-2 rounded border border-rose-500/20">
              <div className="flex items-center justify-center gap-1 text-rose-400 font-semibold mb-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>DOWN</span>
              </div>
              <div className="text-lg font-mono font-bold text-rose-400">{downCount}</div>
              <div className="text-[10px] text-slate-500">ไทม์เฟรม</div>
            </div>

            <div className="bg-[#0a0f1c] p-2 rounded border border-amber-500/20">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-semibold mb-0.5">
                <Minus className="w-3.5 h-3.5" />
                <span>SIDE</span>
              </div>
              <div className="text-lg font-mono font-bold text-amber-400">{sidewaysCount}</div>
              <div className="text-[10px] text-slate-500">ไทม์เฟรม</div>
            </div>
          </div>
        </div>

        {/* Confluence Interpretation Card (Requirement 4: Interpretation Text) */}
        <div className="lg:col-span-7 bg-[#131b2f] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                การแปลความหมายสัญญาณ (Signal Interpretation)
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>ระดับความเสี่ยง:</span>
                <span className="font-semibold text-slate-200">{interpretation.risk}</span>
              </div>
            </div>

            {/* Interpretation Title */}
            <div className={`text-base sm:text-lg font-bold ${interpretation.color} flex items-center gap-2 mt-1 mb-2`}>
              {interpretation.level === 'Strong' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : interpretation.level === 'Moderate' ? (
                <ShieldCheck className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{interpretation.title}</span>
            </div>

            {/* Interpretation Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0a0f1c]/70 p-3 rounded-lg border border-slate-800/80 mb-3">
              {interpretation.description}
            </p>
          </div>

          {/* Actionable Strategy Recommendation */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30 uppercase shrink-0">
                คำแนะนำ AI
              </span>
              <span className="text-xs text-slate-200 font-medium truncate">
                {interpretation.recommendation}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 shrink-0 self-end sm:self-auto">
              <span>ดัชนีหนุนหลัง:</span>
              <span className="text-cyan-400 font-bold">{alignmentScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL SUMMARY BAR SHOWING ALL TIMEFRAMES ALIGNED (Requirement 5) */}
      {/* ========================================================================= */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              แถบความสอดคล้องภาพรวม (Aligned Summary Ribbon)
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> ขาขึ้น (UP)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> ขาลง (DOWN)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> ไซด์เวย์ (SIDEWAYS)
            </span>
          </div>
        </div>

        {/* Visual Aligned Bar */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#0a0f1c] p-1.5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {timeframes.map((tf) => {
              const config = getTrendConfig(tf.trend);
              const Icon = config.Icon;
              const isSelected = selectedTf === tf.timeframe;

              return (
                <div
                  key={tf.timeframe}
                  onClick={() => setSelectedTf(isSelected ? null : tf.timeframe)}
                  className={`cursor-pointer transition-all duration-200 rounded-md p-2 flex flex-col items-center justify-center border text-center relative ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 border-transparent bg-slate-800' 
                      : `${config.bgColor} ${config.borderColor} hover:bg-slate-800/80`
                  }`}
                  title={`${tf.timeframe}: ${config.thaiLabel} (${Math.round(tf.strength)}% Strength)`}
                >
                  <div className="text-[11px] font-bold text-slate-200 font-mono mb-0.5">
                    {tf.timeframe}
                  </div>
                  <div className={`flex items-center justify-center gap-0.5 text-xs font-bold ${config.textColor}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{config.symbol}</span>
                  </div>
                  <div className="w-full bg-slate-900/80 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${config.barGradient}`} 
                      style={{ width: `${Math.min(100, Math.max(5, tf.strength))}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeframe Flow description */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>กรอบเวลาสั้น (Micro / Scalping) 1m</span>
          <span className="text-slate-600">┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈►</span>
          <span>กรอบเวลากลาง-ใหญ่ (Swing / Macro) 1D</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW OF TIMEFRAME CARDS (1m, 5m, 15m, 1h, 4h, 1D) (Requirement 2) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              การวิเคราะห์รายไทม์เฟรม (Timeframe Matrix)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            คลิกที่การ์ดเพื่อดูรายละเอียดเฉพาะเจาะจง
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {timeframes.map((tf) => {
            const config = getTrendConfig(tf.trend);
            const Icon = config.Icon;
            const meta = timeframeMeta[tf.timeframe] || { labelTh: tf.timeframe, role: 'Timeframe', horizon: '' };
            const isSelected = selectedTf === tf.timeframe;

            return (
              <div 
                key={tf.timeframe}
                onClick={() => setSelectedTf(isSelected ? null : tf.timeframe)}
                className={`bg-[#131b2f] border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isSelected 
                    ? 'border-blue-500 shadow-blue-950/50 ring-1 ring-blue-500/50' 
                    : `border-slate-800 hover:border-slate-700`
                }`}
              >
                {/* Card Header: Timeframe label */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-white font-mono">{tf.timeframe}</span>
                      <span className="text-[11px] text-slate-400">({meta.labelTh})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono px-1.5 py-0.5 bg-[#0a0f1c] rounded border border-slate-800">
                      {meta.horizon}
                    </span>
                  </div>

                  {/* Subtitle / Role */}
                  <div className="text-[10px] text-slate-400 line-clamp-1 mb-3">
                    {meta.role}
                  </div>

                  {/* Arrow Icon & Trend Badge: ↑ green for UP, ↓ red for DOWN, → yellow for SIDEWAYS */}
                  <div className={`p-2.5 rounded-lg border ${config.bgColor} ${config.borderColor} flex items-center justify-between mb-3 shadow-inner`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${config.textColor} stroke-[2.5]`} />
                      <span className={`text-xs font-bold ${config.textColor}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${config.textColor}`}>
                      {config.symbol}
                    </span>
                  </div>
                </div>

                {/* Strength bar (0-100%) with color */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] text-slate-400">ความแข็งแกร่ง</span>
                    <span className={`font-mono font-bold text-xs ${config.textColor}`}>
                      {Math.round(tf.strength)}%
                    </span>
                  </div>

                  {/* Progress bar container & fill */}
                  <div className="w-full bg-[#0a0f1c] h-2 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${config.barGradient} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(3, tf.strength))}%` }}
                    />
                  </div>

                  {/* Strength Level Tag */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>{tf.strength >= 75 ? 'แรงมาก' : tf.strength >= 50 ? 'ปานกลาง' : 'อ่อนแอ'}</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECHARTS COMPONENT: STRENGTH & MOMENTUM CHART */}
      {/* ========================================================================= */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              กราฟเปรียบเทียบกำลังโมเมนตัมข้ามไทม์เฟรม (Relative Momentum Distribution)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">เกณฑ์ความชัดเจน: 70%</span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-56 sm:h-64 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="timeframe" 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} 
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white flex items-center justify-between gap-4">
                            <span>ไทม์เฟรม: {data.timeframe} ({data.thaiLabel})</span>
                            <span className="font-mono text-cyan-400">{data.strength}%</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">{data.role}</div>
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 font-semibold" style={{ color: data.color }}>
                            <span>ทิศทาง: {data.trend}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Strong (70%)', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={50} stroke="#475569" strokeDasharray="2 2" label={{ value: 'Mid (50%)', fill: '#64748b', fontSize: 10, position: 'left' }} />
                <Bar dataKey="strength" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. TRADING MATRIX / MULTI-TIMEFRAME STRATEGY PROTOCOL */}
      {/* ========================================================================= */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            คู่มือการเทรดตามระดับความสอดคล้อง (Trading Playbook)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0a0f1c] border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>กรณี Confluence สูง (&gt;= 5/6)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              โอกาสทำกำไรสูงสุด ให้เน้นเทรดตามทิศทางหลักอย่างมั่นใจ ไม่เปิดสวนเทรนด์ รอย่อใน 1m-5m เพื่อเข้าตาม 1h-1D
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0f1c] border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <Compass className="w-4 h-4" />
              <span>กรณี Confluence ปานกลาง (4/6)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              เทรดได้แต่เน้นเก็บกำไรระยะสั้นตามแนวรับแนวต้าน และตั้ง Stop Loss รัดกุมเนื่องจากกรอบเวลาอื่นยังไม่ยืนยัน
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0f1c] border border-slate-800">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>กรณีสัญญาณขัดแย้ง (&lt;= 3/6)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ตลาดกำลังเปลี่ยนผ่านโครงสร้าง (Trend Reversal) หรืออยู่ในภาวะสะสมราคา ควรงดออกออเดอร์ใหญ่จนกว่าจะมีเบรกเอาท์
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
