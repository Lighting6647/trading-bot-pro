"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, YAxis, ReferenceLine } from 'recharts';
import { useTrading } from '@/context/TradingContext';

export default function BottomBar() {
  const { trades } = useTrading();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create chart data from trades
  const tradeBars = trades.slice(0, 40).reverse().map((t) => ({
    id: t.id,
    value: t.result === 'WIN' ? t.amount * 0.85 : -t.amount,
  }));

  // Pad to ensure stable width
  const data = [...tradeBars];
  if (data.length < 30) {
    const padCount = 30 - data.length;
    for (let i = 0; i < padCount; i++) {
      data.unshift({ id: -i, value: 0 });
    }
  }

  const winCount = trades.filter(t => t.result === 'WIN').length;
  const loseCount = trades.filter(t => t.result === 'LOSE').length;

  return (
    <div className="h-36 bg-slate-900 border-t border-slate-800 p-2 flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-1.5 px-2">
        <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Performance Chart (ผลลัพธ์ย้อนหลังแต่ละไม้)</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          ไม้ล่าสุด: <strong className="text-amber-400">{trades.length > 0 ? `#${trades[0].id}` : '-'}</strong>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[70px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -25 }}>
              <YAxis 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
                domain={['auto', 'auto']}
                tickFormatter={(val) => val === 0 ? '' : val}
              />
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`bar-${entry.id || index}`} 
                    fill={entry.value > 0 ? '#22c55e' : entry.value < 0 ? '#ef4444' : 'transparent'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            กำลังโหลด Performance Chart...
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 pt-1 text-[10px] text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-green-400 font-mono">
           <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
           <span>รอบปัจจุบัน (กำลังบันทึก)</span>
        </div>
        <div className="flex gap-4 font-medium">
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
             WIN ({winCount})
           </span>
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 bg-red-500 rounded-full"></span> 
             LOSE ({loseCount})
           </span>
        </div>
      </div>
    </div>
  );
}
