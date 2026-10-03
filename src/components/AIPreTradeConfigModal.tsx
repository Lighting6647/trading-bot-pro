"use client";

import React, { useState } from "react";
import { 
  Brain, 
  Target, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  X, 
  Sliders, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  Sparkles,
  Wallet,
  Clock,
  Flame,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { useTrading, AIAutoTradeConfig } from "@/context/TradingContext";
import { calculatePreview } from "@/lib/strategy";

const assetOptions = [
  { id: "GOLD (XAU/USD)", name: "ทองคำ GOLD (XAU/USD)", icon: "🥇", payout: "85%", volatility: "สูง (High)" },
  { id: "SP500 Index", name: "ดัชนี SP500", icon: "📈", payout: "85%", volatility: "ปานกลาง" },
  { id: "EUR/USD", name: "EUR/USD Forex", icon: "💶", payout: "82%", volatility: "เสถียร" },
  { id: "BTC/USD", name: "Bitcoin (BTC/USD)", icon: "₿", payout: "80%", volatility: "สูงมาก (Very High)" },
  { id: "ETH/USD", name: "Ethereum (ETH/USD)", icon: "🔷", payout: "80%", volatility: "สูง" },
  { id: "NASDAQ 100", name: "NASDAQ 100 Tech", icon: "💻", payout: "85%", volatility: "ปานกลาง" },
];

const strategyOptions = [
  { id: "Anti-Martingale", name: "Anti-Martingale", desc: "เพิ่มเงินเมื่อชนะ ล็อกกำไรเมื่อแพ้ (แนะนำสำหรับเริ่มปั้นพอร์ต)", tag: "แนะนำ ★" },
  { id: "Martingale", name: "Martingale", desc: "ทวีคูณเงินเมื่อแพ้ เพื่อดึงทุนคืนในไม้เดียว (เหมาะกับพอร์ตใหญ่)", tag: "ก้าวร้าว" },
  { id: "Fibonacci", name: "Fibonacci Sequence", desc: "เดินเงินตามลำดับฟีโบนัชชี (1, 1, 2, 3, 5, 8...)", tag: "สายเทคนิค" },
  { id: "Flat", name: "Flat Amount (คงที่)", desc: "เทรดด้วยจำนวนเงินคงที่เท่ากันทุกไม้ 100%", tag: "ปลอดภัยสูงสุด" },
];

export default function AIPreTradeConfigModal() {
  const { 
    isAiConfigModalOpen, 
    setIsAiConfigModalOpen, 
    aiConfig, 
    startAiTradingWithConfig, 
    capital, 
    profit,
    user,
    setIsLoginModalOpen,
    addNotification
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'signals' | 'money' | 'risk' | 'summary'>('signals');

  // Local draft state initialized with context config
  const [draft, setDraft] = useState<AIAutoTradeConfig>({ ...aiConfig });

  if (!isAiConfigModalOpen) return null;

  // Calculate required capital for max steps
  const previewSteps = calculatePreview(draft.strategy, draft.baseOrderAmount, draft.maxSteps);
  const totalMaxDrawdownCapital = previewSteps.reduce((a, b) => a + b, 0);
  const isCapitalSufficient = capital >= totalMaxDrawdownCapital;

  const handleStartTrading = () => {
    startAiTradingWithConfig(draft);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#0c1222] border border-blue-500/50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#131b2f] via-[#1a2542] to-[#131b2f] px-5 py-3.5 border-b border-slate-700/80 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Brain size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>ตั้งค่าความต้องการ AI ก่อนเทรดจริง</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Pre-Trade Setup
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                กำหนดกติกา กลยุทธ์ และเป้าหมาย เพื่อให้ AI ออกออเดอร์อย่างปลอดภัยและแม่นยำ
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAiConfigModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#090e1a] text-xs shrink-0 overflow-x-auto">
          {[
            { id: 'signals', label: '1. สัญญาณ & สินทรัพย์', icon: Target },
            { id: 'money', label: '2. แผนเดินเงิน', icon: Sliders },
            { id: 'risk', label: '3. เป้าหมาย & ความเสี่ยง', icon: ShieldCheck },
            { id: 'summary', label: '4. โหมด & ตรวจสอบ', icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isActive 
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-200 text-xs space-y-4">
          
          {/* TAB 1: SIGNALS & ASSETS */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              {/* Asset Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <span>เลือกคู่เงิน / สินทรัพย์ที่ต้องการให้ AI เทรด:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assetOptions.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, selectedAsset: asset.id }))}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        draft.selectedAsset === asset.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{asset.icon}</span>
                        <div>
                          <div className="font-semibold text-xs text-slate-200">{asset.name}</div>
                          <div className="text-[10px] text-slate-500">Payout {asset.payout} • ความผันผวน: {asset.volatility}</div>
                        </div>
                      </div>
                      {draft.selectedAsset === asset.id && (
                        <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min AI Confidence Threshold Slider */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>ระดับความมั่นใจของ AI ขั้นต่ำ (Minimum AI Confidence)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      AI จะออกไม้เฉพาะเมื่อวิเคราะห์พบความมั่นใจมากกว่าหรือเท่ากับค่านี้
                    </div>
                  </div>
                  <div className="font-mono text-lg font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    ≥ {draft.minConfidence}%
                  </div>
                </div>

                <input
                  type="range"
                  min="65"
                  max="95"
                  step="5"
                  value={draft.minConfidence}
                  onChange={(e) => setDraft(p => ({ ...p, minConfidence: Number(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex gap-2 pt-1">
                  {[
                    { val: 70, label: "70% (เน้นออกไม้บ่อย)" },
                    { val: 80, label: "80% (สมดุล แนะนำ ★)" },
                    { val: 85, label: "85% (เน้นปลอดภัย)" },
                    { val: 90, label: "90% (คมพิเศษ)" },
                  ].map(preset => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, minConfidence: preset.val }))}
                      className={`flex-1 py-1.5 px-1 text-center rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${
                        draft.minConfidence === preset.val
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe & News Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-slate-300 flex items-center gap-1">
                    <Clock size={13} className="text-blue-400" />
                    <span>ไทม์เฟรมสัญญาณ (Timeframe):</span>
                  </div>
                  <div className="flex gap-2">
                    {['1m (Scalp)', '5m (Intraday)', '15m (Swing)'].map(tf => {
                      const cleanTf = tf.split(' ')[0];
                      return (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setDraft(p => ({ ...p, timeframe: cleanTf }))}
                          className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            draft.timeframe === cleanTf
                              ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {tf}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-300">ตัวกรองข่าวแรง (News Filter)</div>
                    <div className="text-[10px] text-slate-400">หยุดพักเทรดช่วงมีข่าวเศรษฐกิจผันผวน</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.newsFilter}
                      onChange={(e) => setDraft(p => ({ ...p, newsFilter: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONEY MANAGEMENT */}
          {activeTab === 'money' && (
            <div className="space-y-4">
              {/* Base Order Sizing */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Wallet size={14} className="text-amber-400" />
                    <span>ขนาดเงินไม้เริ่มต้น (Base Amount):</span>
                  </span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    ฿{draft.baseOrderAmount.toLocaleString()}
                  </span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 200, 500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, baseOrderAmount: amt }))}
                      className={`px-3 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                        draft.baseOrderAmount === amt
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">หรือระบุยอดเอง:</span>
                  <input
                    type="number"
                    value={draft.baseOrderAmount || ""}
                    onChange={(e) => setDraft(p => ({ ...p, baseOrderAmount: Math.max(10, Number(e.target.value)) }))}
                    className="w-32 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                    placeholder="จำนวนเงิน (฿)"
                  />
                </div>
              </div>

              {/* Strategy Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  เลือกสูตรการเดินเงิน (Money Management Strategy):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {strategyOptions.map(strat => (
                    <button
                      key={strat.id}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, strategy: strat.id }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        draft.strategy === strat.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-200">{strat.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                          {strat.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed">{strat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Sizing & Max Steps */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">จำนวนไม้แก้พอร์ตสูงสุด (Max Steps):</span>
                  <span className="font-mono text-sm font-bold text-blue-400">{draft.maxSteps} ไม้</span>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(step => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, maxSteps: step }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer ${
                        draft.maxSteps === step
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {step} ไม้
                    </button>
                  ))}
                </div>

                {/* Real-time Step Sizing Matrix Preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1.5 flex justify-between">
                    <span>จำลองขนาดเงินในแต่ละไม้:</span>
                    <span>ทุนรวมสูงสุดที่ใช้: <strong className="text-amber-400 font-mono">฿{totalMaxDrawdownCapital.toLocaleString()}</strong></span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-center font-mono">
                    {previewSteps.map((amt, idx) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800 p-1 rounded">
                        <div className="text-[9px] text-slate-500">ไม้ {idx + 1}</div>
                        <div className="text-[11px] font-bold text-slate-200">฿{amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RISK & TARGET LIMITS */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              {/* Daily Take Profit Target */}
              <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp size={15} />
                    <span>เป้าหมายกำไรรายวัน (Daily Take Profit):</span>
                  </span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    +฿{draft.dailyTakeProfit.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">เมื่อ AI ทำกำไรสะสมถึงยอดนี้ ระบบจะสั่งหยุดบอทเพื่อล็อกกำไรทันที</div>
                <div className="flex gap-1.5">
                  {[1000, 2000, 3000, 5000, 10000].map(tp => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, dailyTakeProfit: tp }))}
                      className={`flex-1 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                        draft.dailyTakeProfit === tp
                          ? 'bg-emerald-600/40 border-emerald-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      +฿{tp >= 1000 ? `${tp/1000}K` : tp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Stop Loss Target */}
              <div className="bg-rose-950/20 border border-rose-500/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>เพดานตัดขาดทุนสูงสุด (Daily Stop Loss):</span>
                  </span>
                  <span className="font-mono text-base font-black text-rose-400">
                    -฿{draft.dailyStopLoss.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">เมื่อขาดทุนแตะเพดานนี้ ระบบจะตัดขาดทุนและหยุดเทรดทันทีเพื่อรักษาพอร์ต</div>
                <div className="flex gap-1.5">
                  {[500, 1000, 1500, 3000, 5000].map(sl => (
                    <button
                      key={sl}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, dailyStopLoss: sl }))}
                      className={`flex-1 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                        draft.dailyStopLoss === sl
                          ? 'bg-rose-600/40 border-rose-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      -฿{sl >= 1000 ? `${sl/1000}K` : sl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consecutive Loss Cooldown Rule */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Flame size={14} className="text-orange-400" />
                      <span>พักเทรดอัตโนมัติเมื่อแพ้ติดต่อกัน (Consecutive Loss Cooldown)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">ป้องกันภาวะตลาดผันผวนผิดปกติ</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    แพ้ติดกัน {draft.maxConsecutiveLosses} ไม้ → พัก 5 นาที
                  </span>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDraft(p => ({ ...p, maxConsecutiveLosses: num }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        draft.maxConsecutiveLosses === num
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      แพ้ {num} ไม้ติด
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUMMARY & PRE-FLIGHT CHECKLIST */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Mode Selection (Full-Auto vs Semi-Auto) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  เลือกโหมดการส่งคำสั่งของ AI (Execution Mode):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(p => ({ ...p, executionMode: 'FULL_AUTO' }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      draft.executionMode === 'FULL_AUTO'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 text-blue-400 mb-1">
                      <span>🤖 อัตโนมัติ 100% (Full Autonomous)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      เมื่อครบเงื่อนไขทั้งหมด AI จะคำนวณเงินและส่งคำสั่งซื้อขายทันทีโดยไม่ต้องรอยืนยัน
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraft(p => ({ ...p, executionMode: 'SEMI_AUTO' }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      draft.executionMode === 'SEMI_AUTO'
                        ? 'bg-amber-600/20 border-amber-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 text-amber-400 mb-1">
                      <span>⚡ กึ่งอัตโนมัติ (Semi-Auto / Signal Alert)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      AI ส่งสัญญาณพร้อมคำนวณไม้ และแสดงปุ่มแจ้งเตือนให้คุณกดยืนยัน 1-Click ก่อนออกไม้จริง
                    </div>
                  </button>
                </div>
              </div>

              {/* Pre-Flight Checklist */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>สรุปรายการตรวจสอบความพร้อม (Pre-Flight Checklist):</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">1. บัญชีที่ใช้เทรด:</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] border ${
                      user.accountType === 'REAL' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {user.accountType === 'REAL' ? `● บัญชีจริง (${user.broker})` : `○ บัญชีทดลอง (Demo)`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">2. ยอดเงินทุนในพอร์ต:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      ฿{capital.toLocaleString()} (ทุนพอสำหรับ {draft.maxSteps} ไม้: ฿{totalMaxDrawdownCapital.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">3. สินทรัพย์ & ไทม์เฟรม:</span>
                    <span className="font-semibold text-slate-200">
                      {draft.selectedAsset} • {draft.timeframe}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">4. กรองความมั่นใจ AI:</span>
                    <span className="font-bold text-blue-400">
                      ≥ {draft.minConfidence}% (สัญญาณต่ำกว่านี้จะไม่เทรด)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">5. แผนเดินเงิน & เป้าหมาย:</span>
                    <span className="font-semibold text-slate-200">
                      {draft.strategy} (ไม้แรก ฿{draft.baseOrderAmount}) | TP +฿{draft.dailyTakeProfit.toLocaleString()} | SL -฿{draft.dailyStopLoss.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capital Sufficiency Alert if needed */}
              {!isCapitalSufficient && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                  <span>
                    เงินทุนปัจจุบัน (฿{capital.toLocaleString()}) น้อยกว่าทุนสูงสุดที่คำนวณไว้ (฿{totalMaxDrawdownCapital.toLocaleString()}) แนะนำให้ปรับขนาดไม้เริ่มต้นลง หรือเติมทุนในพอร์ต
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#131b2f] p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft({ ...aiConfig });
                addNotification('signal', '🔄 รีเซ็ตค่าการตั้งค่า AI กลับเป็นค่ามาตรฐาน');
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>คืนค่าเดิม</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'summary' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs: Array<'signals' | 'money' | 'risk' | 'summary'> = ['signals', 'money', 'risk', 'summary'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>ขั้นตอนถัดไป</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartTrading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Play size={15} fill="currentColor" />
                <span>🚀 บันทึกและเริ่มให้ AI เทรดทันที</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
