"use client";

import { Wallet, Target, Activity, Clock, BarChart2 } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { calculatePreview } from '@/lib/strategy';
import { useState, useEffect } from 'react';

export default function SidebarLeft() {
  const { 
    settings, 
    capital, 
    profit, 
    trades, 
    setIsSettingsOpen,
    takeProfitTarget,
    stopLossTarget
  } = useTrading();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCurrentCapital = capital + profit;
  const targetCapital = capital + takeProfitTarget;
  const wins = trades.filter(t => t.result === 'WIN').length;
  const losses = trades.filter(t => t.result === 'LOSE').length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

  const preview = calculatePreview(settings.strategy, settings.startAmount, settings.steps);

  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-auto md:h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-green-500 font-bold">
        <Activity size={20} className="animate-pulse" />
        <span>TRADING BOT PRO v3.0</span>
      </div>

      <div className="p-2 space-y-2">
        {/* เงินทุน & เป้าหมาย */}
        <div className="bg-slate-950/50 rounded-md border border-slate-800">
          <div className="bg-slate-800/50 px-3 py-2 text-amber-400 font-semibold text-sm border-b border-slate-800 flex items-center gap-2">
            <Wallet size={16} />
            เงินทุน & เป้าหมาย
          </div>
          <div className="p-3 text-sm">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-slate-400 text-xs">ทุนปัจจุบัน</div>
                <div className="text-blue-400 font-mono text-lg font-bold">{totalCurrentCapital.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">ยอดเป้าหมาย</div>
                <div className="text-blue-400 font-mono text-lg font-bold">{targetCapital.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-slate-400 text-xs">กำไร/ขาดทุน</div>
              <div className={`font-mono text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profit > 0 ? '+' : ''}{profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-slate-400 text-xs">TP TARGET</div>
                <div className="text-green-500 font-mono font-semibold">{takeProfitTarget.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">SL TARGET</div>
                <div className="text-red-500 font-mono font-semibold">{stopLossTarget.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* สถิติ ORDER */}
        <div className="bg-slate-950/50 rounded-md border border-slate-800">
          <div className="bg-slate-800/50 px-3 py-2 text-amber-400 font-semibold text-sm border-b border-slate-800 flex items-center gap-2">
            <BarChart2 size={16} />
            สถิติ ORDER
          </div>
          <div className="p-3 text-sm">
            <div className="mb-2">
              <div className="text-slate-400 text-xs">ORDER</div>
              <div className="text-amber-400 font-mono text-lg font-bold">{total}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-slate-400 text-xs">Win</div>
                <div className="text-green-500 font-mono font-semibold">{wins}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Loss</div>
                <div className="text-red-500 font-mono font-semibold">{losses}</div>
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Win Rate %</div>
              <div className="text-amber-400 font-mono font-bold text-base">{winRate}%</div>
            </div>
          </div>
        </div>

        {/* แผนเดินเงิน */}
        <div className="bg-slate-950/50 rounded-md border border-slate-800">
          <div className="bg-slate-800/50 px-3 py-2 text-amber-400 font-semibold text-sm border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} />
              <span>แผนเดินเงิน ({settings.strategy})</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline"
            >
              แก้ไข
            </button>
          </div>
          <div className="p-3 overflow-x-auto">
            <div className="flex gap-2 text-xs font-mono w-max">
              {preview.map((amt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setIsSettingsOpen(true)}
                  className={`px-2 py-1 rounded border hover:brightness-125 transition-all cursor-pointer ${
                    idx === 0 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-xs shadow-amber-500/20' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={`ไม้ที่ ${idx + 1}: ${amt.toLocaleString()} บาท`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* เวลาทำงาน */}
        <div className="bg-slate-950/50 rounded-md border border-slate-800">
          <div className="bg-slate-800/50 px-3 py-2 text-amber-400 font-semibold text-sm border-b border-slate-800 flex items-center gap-2">
            <Clock size={16} />
            เวลาทำงาน
          </div>
          <div className="p-3 text-sm">
            <div className="mb-2">
              <div className="text-slate-400 text-xs">วันที่</div>
              <div className="text-slate-200">{mounted ? new Date().toLocaleDateString('th-TH') : 'กำลังโหลด...'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">เวลาเดินระบบ</div>
              <div className="text-amber-400 font-mono text-lg font-bold">
                {mounted ? currentTime : '--:--:--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
