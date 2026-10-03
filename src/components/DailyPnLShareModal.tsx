"use client";

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Award, Zap, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DailyPnLShareModal({ isOpen, onClose }: Props) {
  const { user, capital, profit, trades } = useTrading();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const wins = trades.filter(t => t.result === 'WIN').length;
  const losses = trades.filter(t => t.result === 'LOSE').length;
  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const isProfit = profit >= 0;

  const handleCopyText = () => {
    const text = `📊 สรุปผลเทรด Trading Bot Pro AI
🏦 พอร์ต: Exness ${user.server || 'Exness-MT5Real20'} (#${user.accountNumber || '160187619'})
💰 ยอดเงินคงเหลือ: ${capital.toLocaleString()} USC
📈 กำไร/ขาดทุนรอบนี้: ${isProfit ? '+' : ''}${profit.toLocaleString()} บาท (${isProfit ? 'กำไร' : 'ขาดทุน'})
🎯 Win Rate: ${winRate}% (ชนะ ${wins} / แพ้ ${losses})
🤖 รันด้วยระบบ: Trading Bot Pro AI 2.0 (https://trading-bot-pro-ivory.vercel.app/)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 text-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Sparkles size={18} />
          <span>การ์ดสรุปผลงานเทรด (Shareable PnL Card)</span>
        </div>

        {/* Styled Visual Card */}
        <div className="bg-gradient-to-br from-[#0c1a30] via-[#091122] to-[#140f2b] p-5 rounded-xl border border-amber-500/40 shadow-inner space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                ⚡
              </div>
              <div>
                <span className="font-extrabold text-white text-xs tracking-wider block">TRADING BOT PRO AI</span>
                <span className="text-[10px] text-slate-400 font-mono">Exness MT5 Standard Cent</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              LIVE ACC
            </span>
          </div>

          <div className="py-2 border-y border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400">กำไร/ขาดทุนสะสมรอบนี้:</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-3xl font-extrabold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? `+${profit.toLocaleString()}` : profit.toLocaleString()} <span className="text-sm">USC</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">WIN RATE</span>
              <span className="font-bold text-amber-400 text-xs">{winRate}%</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">ออเดอร์</span>
              <span className="font-bold text-white text-xs">{totalTrades} ไม้</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">ยอดเงินสุทธิ</span>
              <span className="font-bold text-emerald-400 text-xs">{capital.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-mono">
            <span># {user.accountNumber || '160187619'} ({user.server || 'Exness-MT5Real20'})</span>
            <span>trading-bot-pro-ivory.vercel.app</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleCopyText}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'คัดลอกข้อความสรุปผลงานแล้ว!' : '📋 คัดลอกข้อความสรุปผลงาน (สำหรับแชร์)'}</span>
        </button>

      </div>
    </div>
  );
}
