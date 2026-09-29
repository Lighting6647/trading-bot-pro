"use client";

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Info } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { calculatePreview } from '@/lib/strategy';

const strategies = [
  'Manual', 'Martingale', 'Anti-Martingale',
  'Fibonacci', "D'Alembert", 'Labouchere',
  'Flat', "Oscar's Grind", '1-3-2-6'
];

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, settings, setSettings, addNotification } = useTrading();
  
  // Local draft state to allow cancelling
  const [draft, setDraft] = useState(settings);
  const [calcMode, setCalcMode] = useState('ตามทุนก่อนหน้า');
  const [enableRR, setEnableRR] = useState(true);

  useEffect(() => {
    if (isSettingsOpen) {
      setDraft(settings);
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  // Calculate preview array using draft values
  const preview = calculatePreview(draft.strategy, draft.startAmount, draft.steps);

  const handleSave = () => {
    setSettings(draft);
    setIsSettingsOpen(false);
    addNotification('signal', `💾 บันทึกแผนเดินเงิน [${draft.strategy}] ไม้แรก ${draft.startAmount.toLocaleString()} ฿ (${draft.steps} ไม้)`);
  };

  const handleCancel = () => {
    setDraft(settings);
    setIsSettingsOpen(false);
  };

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-2 bottom-2 w-[95%] md:w-[420px] bg-[#0a0f1c] border border-blue-500/50 rounded-lg shadow-2xl flex flex-col z-20 overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-[#131b2f] border-b border-slate-800 flex justify-between items-center px-4 cursor-move">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <SettingsIcon size={16} className="text-amber-400" />
          <span>ตั้งค่าระบบ (System Settings)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCancel} className="text-slate-400 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="text-amber-500 font-semibold mb-1">Money Management</div>
        <div className="text-xs text-slate-400 mb-4">เงินทุนที่ปลอดภัย - เน้นเป้าหมายที่ชัดเจน - เล่นแต่ละจุดเข้าที่แม่นยำด้วยการเดินเงิน</div>

        {/* Strategy Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {strategies.map(s => (
            <button 
              key={s}
              onClick={() => setDraft(prev => ({ ...prev, strategy: s }))}
              className={`py-2 px-1 text-xs text-center rounded border transition-all cursor-pointer ${
                draft.strategy === s 
                  ? 'bg-blue-600/25 border-blue-500 text-blue-400 font-semibold shadow-xs shadow-blue-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="flex gap-4 mb-3 text-xs">
          {['ตามทุนก่อนหน้า', 'ตามเป้าหมาย', 'ตามออเดอร์'].map((mode) => (
            <label key={mode} className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input 
                type="radio" 
                name="calc" 
                checked={calcMode === mode}
                onChange={() => setCalcMode(mode)}
                className="accent-blue-500" 
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-4 mb-3 text-xs">
           <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={enableRR}
              onChange={(e) => setEnableRR(e.target.checked)}
              className="accent-blue-500" 
            />
            <span><strong className="text-amber-500 font-bold">%</strong> RR เดินเงินอัตโนมัติ</span>
          </label>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2.5 mb-4 text-[10px] text-amber-500/90 leading-relaxed">
          ทิศทาง = ตามตัวก่อนหน้า (เอาตลาดออกช้า) - ไม้แรกต้องเงินน้อยสุดขั้นทศลภาคก่อน - แล้วไม้ 1 ลงเต็ม &quot;ตาม&quot; ฝั่งที่ตลาดออกจริงๆก่อน
          <br/><br/>
          <span className="flex items-start gap-1">
             <Info size={13} className="shrink-0 mt-0.5 text-amber-400" />
             <span>ใช้ได้เฉพาะโหมด auto-click (คลิกอัตโนมัติ) เท่านั้น - โหมดต่อ API/โบรกเกอร์ (IQ/Alpaca) ยังไม่รองรับ</span>
          </span>
        </div>

        {/* Inputs */}
        <div className="space-y-3 mb-4 text-xs">
           <div className="flex items-center justify-between">
              <span className="text-slate-300">รูปแบบการเดินเงิน</span>
              <select 
                value={draft.strategy}
                onChange={(e) => setDraft(prev => ({ ...prev, strategy: e.target.value }))}
                className="bg-slate-900 border border-slate-700 text-blue-400 text-xs rounded px-3 py-1.5 w-48 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                 {strategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
           
           <div className="flex items-center gap-2">
              <span className="text-slate-300 w-16">จำนวนไม้</span>
              <input 
                type="number" 
                value={draft.steps}
                onChange={(e) => setDraft(prev => ({ ...prev, steps: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-center rounded px-2 py-1.5 w-20 outline-none focus:border-blue-500 font-mono" 
              />
              <span className="text-slate-300 ml-2">ไม้สูงสุด</span>
              <input 
                type="number" 
                value={draft.maxAmount}
                onChange={(e) => setDraft(prev => ({ ...prev, maxAmount: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-center rounded px-2 py-1.5 flex-1 outline-none focus:border-blue-500 font-mono" 
              />
           </div>

           <div className="flex items-center gap-2">
              <span className="text-slate-300 w-16">เงินไม้แรก</span>
              <input 
                type="number" 
                value={draft.startAmount}
                onChange={(e) => setDraft(prev => ({ ...prev, startAmount: Math.max(1, parseInt(e.target.value, 10) || 0) }))}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-center rounded px-2 py-1.5 flex-1 outline-none focus:border-blue-500 font-mono" 
              />
              <span className="text-slate-400 font-bold">฿</span>
           </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
           <div className="text-xs text-slate-400 mb-2">พรีวิวเงินแต่ละไม้ (คำนวณจากไม้ออร์เดอร์ + สูตร {draft.strategy})</div>
           <div className="flex flex-wrap gap-2 text-xs font-mono">
              {preview.map((amt, idx) => (
                <div 
                  key={idx}
                  className={`px-2.5 py-1 rounded border ${
                    idx === preview.length - 1 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold' 
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {idx + 1}: {amt.toLocaleString()}
                </div>
              ))}
           </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-4 flex justify-end gap-2 border-t border-slate-800">
           <button 
             onClick={handleCancel} 
             className="px-4 py-1.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer transition-colors"
           >
             ยกเลิก
           </button>
           <button 
             onClick={handleSave} 
             className="px-6 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-blue-600/20"
           >
             บันทึก
           </button>
        </div>
      </div>
    </div>
  );
}
