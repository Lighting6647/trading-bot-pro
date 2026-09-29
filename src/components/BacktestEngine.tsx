"use client";

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ShieldCheck,
  Target,
  BarChart3,
  Percent,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useTrading } from '@/context/TradingContext';

interface PeriodOption {
  label: string;
  days: number;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: '7 วัน', days: 7 },
  { label: '30 วัน', days: 30 },
  { label: '90 วัน', days: 90 },
  { label: '365 วัน', days: 365 },
];

export default function BacktestEngine() {
  const { backtestResult, runBacktest, isBacktesting, settings } = useTrading();
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartBacktest = () => {
    if (isBacktesting) return;
    runBacktest(selectedDays);
  };

  const winRate =
    backtestResult && backtestResult.totalTrades > 0
      ? ((backtestResult.wins / backtestResult.totalTrades) * 100).toFixed(1)
      : '0.0';

  const isNetProfitPositive = (backtestResult?.netProfit ?? 0) >= 0;

  // Format equity curve for Recharts AreaChart
  const chartData =
    backtestResult?.equityCurve.map((value, index) => ({
      tradeIndex: index + 1,
      equity: Math.round(value),
    })) ?? [];

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] text-slate-200 min-h-0 overflow-y-auto rounded-lg border border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            <FlaskConical size={22} className={isBacktesting ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Backtesting Engine
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                Simulation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ทดสอบและจำลองผลลัพธ์ย้อนหลังด้วยระบบคำนวณตามกลยุทธ์ปัจจุบัน
            </p>
          </div>
        </div>

        {/* Current status */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isBacktesting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-400">
            สถานะ: {isBacktesting ? 'กำลังทดสอบ...' : 'พร้อมทำงาน'}
          </span>
        </div>
      </div>

      {/* Strategy & Settings Display */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Layers size={16} className="text-indigo-400" />
            <span>กลยุทธ์และการตั้งค่าปัจจุบัน (Current Settings)</span>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            อ้างอิงจาก Settings หลัก
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-md p-3">
            <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <Zap size={13} className="text-amber-400" /> กลยุทธ์
            </div>
            <div className="text-sm font-bold text-amber-400 truncate">
              {settings.strategy || 'Anti-Martingale'}
            </div>
          </div>

          <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-md p-3">
            <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <Activity size={13} className="text-blue-400" /> ไม้เริ่มต้น (Start)
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {settings.startAmount?.toLocaleString()} ฿
            </div>
          </div>

          <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-md p-3">
            <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <ShieldCheck size={13} className="text-purple-400" /> ไม้สูงสุด (Max)
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {settings.maxAmount?.toLocaleString()} ฿
            </div>
          </div>

          <div className="bg-[#0a0f1c] border border-slate-800/80 rounded-md p-3">
            <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <BarChart3 size={13} className="text-emerald-400" /> จำนวนสเต็ป (Steps)
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {settings.steps || 4} ไม้
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Period Selection & Run Button */}
      <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <Calendar size={15} className="text-blue-400" />
            <span>เลือกช่วงเวลาทดสอบ:</span>
          </div>
          <div className="grid grid-cols-4 sm:flex gap-1.5 w-full sm:w-auto bg-[#0a0f1c] p-1 rounded-lg border border-slate-800">
            {PERIOD_OPTIONS.map((period) => {
              const isSelected = selectedDays === period.days;
              return (
                <button
                  key={period.days}
                  onClick={() => setSelectedDays(period.days)}
                  disabled={isBacktesting}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStartBacktest}
          disabled={isBacktesting}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
            isBacktesting
              ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-[0.98]'
          }`}
        >
          {isBacktesting ? (
            <>
              <Loader2 size={16} className="animate-spin text-blue-300" />
              <span>กำลังประมวลผล Backtest...</span>
            </>
          ) : (
            <>
              <Play size={16} className="fill-current" />
              <span>เริ่ม Backtest ({selectedDays} วัน)</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {backtestResult ? (
        <div className="space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Trades */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>จำนวนออเดอร์</span>
                <BarChart3 size={14} className="text-blue-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {backtestResult.totalTrades.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <span className="text-emerald-400 font-semibold">{backtestResult.wins}W</span>
                <span>/</span>
                <span className="text-rose-400 font-semibold">{backtestResult.losses}L</span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>Win Rate</span>
                <Percent size={14} className="text-emerald-400" />
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  Number(winRate) >= 50 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {winRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                อัตราการชนะรวม
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>กำไรสุทธิ (Net)</span>
                {isNetProfitPositive ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-rose-400" />
                )}
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isNetProfitPositive ? '+' : ''}
                {backtestResult.netProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{' '}
                ฿
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {isNetProfitPositive ? 'กำไรสะสมตลอดช่วง' : 'ขาดทุนสะสมตลอดช่วง'}
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>Max Drawdown</span>
                <ShieldCheck size={14} className="text-rose-400" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {backtestResult.maxDrawdown > 0 
                  ? `-${backtestResult.maxDrawdown.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿`
                  : '0 ฿'
                }
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                ขาดทุนสะสมสูงสุด
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>Sharpe Ratio</span>
                <Target size={14} className="text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {backtestResult.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                อัตราผลตอบแทนต่อเสี่ยง
              </div>
            </div>

            {/* Recovery Factor */}
            <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
                <span>Recovery Factor</span>
                <TrendingUp size={14} className="text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-indigo-400">
                {backtestResult.recoveryFactor.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                อัตราการฟื้นตัวของพอร์ต
              </div>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div className="bg-[#131b2f] border border-slate-800 rounded-lg p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    เส้นการเติบโตของพอร์ต (Equity Curve)
                  </h3>
                  <p className="text-xs text-slate-400">
                    การเปลี่ยนแปลงมูลค่าพอร์ตสะสมตลอด {backtestResult.totalTrades} ไม้
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isNetProfitPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  พอร์ตสุทธิ:{' '}
                  <span
                    className={`font-mono font-semibold ${
                      isNetProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isNetProfitPositive ? '+' : ''}
                    {backtestResult.netProfit.toLocaleString()} ฿
                  </span>
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="backtestEquityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isNetProfitPositive ? '#10b981' : '#f43f5e'}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={isNetProfitPositive ? '#10b981' : '#f43f5e'}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="tradeIndex"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(val) => `ไม้ ${val}`}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val.toLocaleString()}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload as { tradeIndex?: number; equity?: number } | undefined;
                          if (!data || data.equity == null) return null;
                          const isPos = data.equity >= 0;
                          return (
                            <div className="bg-[#131b2f] border border-slate-700 p-2.5 rounded-md shadow-xl text-xs">
                              <div className="text-slate-400 mb-1">
                                ออเดอร์ที่ #{data.tradeIndex ?? 1}
                              </div>
                              <div
                                className={`font-mono font-bold text-sm ${
                                  isPos ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isPos ? '+' : ''}
                                {data.equity.toLocaleString()} ฿
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={isNetProfitPositive ? '#10b981' : '#f43f5e'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#backtestEquityGradient)"
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  กำลังโหลดกราฟ...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#131b2f] border border-slate-800 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-500">
            <FlaskConical size={32} />
          </div>
          <div>
            <h4 className="text-slate-300 font-semibold text-base">
              ยังไม่มีผลการทดสอบ Backtest
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              เลือกช่วงเวลา (7 วัน, 30 วัน, 90 วัน หรือ 365 วัน) แล้วคลิกปุ่ม &quot;เริ่ม Backtest&quot; เพื่อจำลองการซื้อขายตามกลยุทธ์ของคุณ
            </p>
          </div>
          <button
            onClick={handleStartBacktest}
            disabled={isBacktesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Play size={14} className="fill-current" />
            <span>เริ่มการทดสอบตอนนี้</span>
          </button>
        </div>
      )}
    </div>
  );
}
export { BacktestEngine };
