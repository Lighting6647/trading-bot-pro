"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Globe, ShieldAlert, CheckCircle2, AlertTriangle, Moon, Sun, Info } from 'lucide-react';
import { getMarketStatus, MarketStatus } from '@/lib/marketHours';
import { useTrading } from '@/context/TradingContext';

export default function MarketTimezoneClock({ compact = false }: { compact?: boolean }) {
  const { aiConfig, autoStopOnMarketClose, setAutoStopOnMarketClose } = useTrading();
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(() => getMarketStatus(aiConfig?.selectedAsset));

  useEffect(() => {
    const update = () => {
      setMarketStatus(getMarketStatus(aiConfig?.selectedAsset));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [aiConfig?.selectedAsset]);

  if (compact) {
    return (
      <div className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
        marketStatus.isOpen
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">
              {marketStatus.isOpen ? '🟢 ตลาดเปิดทำการ (Market Open)' : '🛑 ตลาดปิด (Market Closed)'}
            </span>
            <span className="text-[10px] text-slate-400">
              เวลาไทย: <strong className="font-mono text-slate-200">{marketStatus.localTimeTh}</strong> | Exness: <strong className="font-mono text-slate-200">{marketStatus.serverTimeUtc} UTC</strong>
            </span>
          </div>
        </div>
        {!marketStatus.isOpen && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
            เปิดอีก: {marketStatus.timeUntilNextEvent}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5 sm:p-4 text-slate-200 shadow-lg space-y-3">
      {/* Header: Market Status Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            marketStatus.isOpen
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}>
            <Clock size={16} className={marketStatus.isOpen ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                สถานะตลาด & เวลาสากล (Global Market Time)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                marketStatus.isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                {marketStatus.statusBadge === 'OPEN' && '● ตลาดเปิดทำการ'}
                {marketStatus.statusBadge === 'CLOSED_WEEKEND' && '🛑 ปิดสุดสัปดาห์ (WEEKEND)'}
                {marketStatus.statusBadge === 'CLOSED_DAILY_BREAK' && '⏸️ พักประจำวัน (ROLLOVER)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              สินทรัพย์: <strong className="text-amber-400 font-medium">{aiConfig?.selectedAsset}</strong> • {marketStatus.statusText}
            </p>
          </div>
        </div>

        {/* Auto Pause on Market Close Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <input
            type="checkbox"
            id="autoStopMarketClose"
            checked={autoStopOnMarketClose}
            onChange={(e) => setAutoStopOnMarketClose(e.target.checked)}
            className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="autoStopMarketClose" className="text-[11px] text-slate-300 cursor-pointer select-none">
            🛡️ <span className="font-semibold text-white">หยุดเทรดอัตโนมัติเมื่อตลาดปิด</span>
          </label>
        </div>
      </div>

      {/* World Timezones Clock Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Thai Time */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-amber-400 font-semibold flex items-center justify-center gap-1">
            <span>🇹🇭 เวลาไทย (ICT)</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white mt-0.5">
            {marketStatus.localTimeTh}
          </div>
          <div className="text-[9px] text-slate-400">UTC+7</div>
        </div>

        {/* Exness Server Time */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-blue-400 font-semibold flex items-center justify-center gap-1">
            <span>🌐 Exness Server</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white mt-0.5">
            {marketStatus.serverTimeUtc}
          </div>
          <div className="text-[9px] text-slate-400">UTC+0 (GMT)</div>
        </div>

        {/* London Time */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-purple-400 font-semibold flex items-center justify-center gap-1">
            <span>🇬🇧 London</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white mt-0.5">
            {marketStatus.londonTime}
          </div>
          <div className="text-[9px] text-slate-400">ตลาดลอนดอน</div>
        </div>

        {/* New York Time */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <span>🇺🇸 New York</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-white mt-0.5">
            {marketStatus.nyTime}
          </div>
          <div className="text-[9px] text-slate-400">ตลาดนิวยอร์ก</div>
        </div>
      </div>

      {/* Global Market Session Status Bar */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px]">เซสชันตลาดโลก:</span>
          {[
            { id: 'SYDNEY', name: 'Sydney (04:00-13:00)', flag: '🇦🇺' },
            { id: 'TOKYO', name: 'Tokyo (07:00-16:00)', flag: '🇯🇵' },
            { id: 'LONDON', name: 'London (14:00-23:00)', flag: '🇬🇧' },
            { id: 'NEW_YORK', name: 'New York (19:00-04:00)', flag: '🇺🇸' },
          ].map(s => {
            const isActive = marketStatus.currentSessions.includes(s.id as any);
            return (
              <span
                key={s.id}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 transition-all ${
                  isActive && marketStatus.isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                    : 'bg-slate-800/60 text-slate-500 border-slate-800'
                }`}
              >
                <span>{s.flag}</span>
                <span>{s.name}</span>
                {isActive && marketStatus.isOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
              </span>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-300 flex items-center gap-1">
          <span className="text-slate-400">{marketStatus.nextEvent}:</span>
          <span className="font-mono text-amber-400 font-bold">{marketStatus.timeUntilNextEvent}</span>
        </div>
      </div>
    </div>
  );
}
