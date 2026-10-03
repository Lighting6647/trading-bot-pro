"use client";

import { Wallet, Target, Activity, Clock, BarChart2, Sliders, Bot, Zap, ExternalLink, ArrowRight } from 'lucide-react';
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
    stopLossTarget,
    user,
    setIsLoginModalOpen,
    aiConfig,
    setIsAiConfigModalOpen,
    setActivePanel
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
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
          <Activity size={18} className="animate-pulse" />
          <span>TRADING BOT PRO</span>
        </div>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 transition-all ${
            user.accountType === 'REAL'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
          }`}
          title="คลิกเพื่อจัดการพอร์ตและเปลี่ยนประเภทบัญชี"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${user.accountType === 'REAL' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          {user.accountType === 'REAL' ? 'พอร์ตจริง' : 'DEMO'}
        </button>
      </div>

      <div className="p-2 space-y-2">
        {/* Exness Live Bridge Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 rounded-md border border-amber-500/40 p-2.5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Zap size={14} className="animate-pulse" />
              <span>Exness Live Bridge</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              LIVE (20ms)
            </span>
          </div>
          <div className="text-[11px] space-y-1 text-slate-300 mb-2">
            <div className="flex justify-between">
              <span className="text-slate-400">เซิร์ฟเวอร์:</span>
              <span className="font-mono text-slate-200">Exness-Real19</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">บัญชี:</span>
              <span className="font-mono text-slate-200">EXN-7739210</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ยอดเงินจริง:</span>
              <span className="font-mono text-emerald-400 font-bold">฿{capital.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActivePanel('Exness เทรด')}
              className="flex-1 py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>ไปที่ Exness เทรด</span>
              <ArrowRight size={11} />
            </button>
            <a
              href="https://my.exness.com/webtrading/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center justify-center"
              title="เปิดเว็บเทรด Exness ในแท็บใหม่"
            >
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* AI Pre-Trade Requirement Card */}
        <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 rounded-md border border-blue-800/40 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
              <Bot size={15} />
              <span>AI Pre-Trade Rules</span>
            </div>
            <button
              onClick={() => setIsAiConfigModalOpen(true)}
              className="text-[10px] text-blue-400 hover:text-blue-200 font-medium flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded border border-blue-500/40 transition-colors"
            >
              <Sliders size={10} />
              ตั้งค่า
            </button>
          </div>
          <div className="text-[11px] space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">คู่เทรด:</span>
              <span className="font-semibold text-white">{aiConfig.selectedAsset.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">มั่นใจขั้นต่ำ:</span>
              <span className="font-mono text-emerald-400 font-bold">≥ {aiConfig.minConfidence}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ไม้ละ:</span>
              <span className="font-mono text-amber-400 font-bold">฿{aiConfig.baseOrderAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* เงินทุน & เป้าหมาย */}
        <div className="bg-slate-950/50 rounded-md border border-slate-800">
          <div className="bg-slate-800/50 px-3 py-2 text-amber-400 font-semibold text-sm border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={16} />
              <span>เงินทุน & เป้าหมาย</span>
            </div>
            {user.accountType === 'REAL' && (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-normal hover:underline"
              >
                แก้ไขทุน
              </button>
            )}
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
