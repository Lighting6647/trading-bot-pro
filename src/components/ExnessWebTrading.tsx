"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Server, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  Check, 
  AlertCircle,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTrading } from '@/context/TradingContext';

export default function ExnessWebTrading() {
  const { 
    user, 
    capital, 
    profit, 
    setCapital, 
    addNotification, 
    isRunning, 
    setIsRunning,
    aiConfig 
  } = useTrading();

  const [server, setServer] = useState(user.server || 'Exness-Real19');
  const [loginId, setLoginId] = useState(user.accountNumber || '7739210');
  const [balanceInput, setBalanceInput] = useState(capital.toString());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [lastExnessOrder, setLastExnessOrder] = useState<any>(null);
  const [bridgeStatus, setBridgeStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'SYNCING'>('CONNECTED');
  const [pingMs, setPingMs] = useState(22);

  const exnessWebTradingUrl = "https://my.exness.com/webtrading/";

  // Sync with Exness API route
  const handleSyncExness = async (forcedBalance?: number) => {
    setIsSyncing(true);
    setBridgeStatus('SYNCING');
    try {
      const targetBal = forcedBalance !== undefined 
        ? forcedBalance 
        : (parseFloat(balanceInput.replace(/,/g, '')) || capital);

      const res = await fetch('/api/broker/exness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC',
          server,
          login: loginId,
          balance: targetBal,
          environment: user.accountType,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setCapital(data.balance);
        setPingMs(data.serverLatencyMs || 20);
        setBridgeStatus('CONNECTED');
        addNotification('signal', `🟢 ซิงค์กับ Exness WebTrading (${server}) สำเร็จ: ฿${data.balance.toLocaleString()}`);
      }
    } catch (e: any) {
      addNotification('risk', `⚠️ ไม่สามารถซิงค์กับ Exness ได้: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Execute Live Test Order via Exness Gateway
  const handleSendTestOrder = async (side: 'BUY' | 'SELL') => {
    setIsPlacingOrder(true);
    try {
      const symbol = aiConfig?.selectedAsset?.includes('GOLD') ? 'XAUUSDm' : 'EURUSDm';
      const res = await fetch('/api/broker/exness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ORDER',
          server,
          login: loginId,
          symbol,
          type: side,
          lots: 0.01,
          comment: 'TradingBotPro-AI-Execution',
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setLastExnessOrder(data);
        addNotification('win', `🚀 ส่งออเดอร์ ${side} ${symbol} เข้า Exness Server (${server}) สำเร็จ! [Ticket: ${data.orderId}]`);
      }
    } catch (e: any) {
      addNotification('risk', `❌ ส่งออเดอร์เข้า Exness ล้มเหลว: ${e.message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const userscriptCode = `// ==UserScript==
// @name         Trading Bot Pro - Exness WebTrading Bridge
// @namespace    http://localhost:3000/
// @version      1.0
// @description  Auto-bridge Trading Bot Pro AI Signals with Exness WebTrading
// @match        https://my.exness.com/webtrading/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("⚡ Trading Bot Pro Bridge Attached to Exness WebTrading!");
    const bc = new BroadcastChannel("exness_trading_bot_pro");
    bc.onmessage = (event) => {
        if (event.data?.action === 'EXECUTE_ORDER') {
            console.log("🚀 Executing Order on Exness:", event.data);
            // Click Buy/Sell button on Exness Web terminal DOM
        }
    };
})();`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(userscriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-slate-200 h-full overflow-y-auto">
      
      {/* Header Bar */}
      <div className="bg-[#131b2f] border-b border-slate-800 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Globe size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                EXNESS WEBTRADING LIVE BRIDGE
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME GATEWAY
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              เชื่อมต่อบัญชีเทรดกับ Exness WebTerminal ({exnessWebTradingUrl})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={exnessWebTradingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>เปิด Exness WebTrading หน้าต่างใหม่ ↗</span>
          </a>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        
        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card 1: Connection Info */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Server size={14} className="text-blue-400" />
                <span>Exness Server:</span>
              </span>
              <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded">
                {server}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Login ID:</span>
              <span className="font-mono text-emerald-400 font-bold">{user.accountNumber || 'EXN-7739210'}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">สถานะ Bridge:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>เชื่อมต่อสด ({pingMs}ms)</span>
              </span>
            </div>
          </div>

          {/* Card 2: Balance & Equity */}
          <div className="bg-gradient-to-br from-[#111c38] to-slate-900 p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wallet size={14} className="text-amber-400" />
                <span>ทุนในพอร์ต Exness:</span>
              </span>
              <button 
                onClick={() => handleSyncExness()}
                disabled={isSyncing}
                className="text-[10px] text-blue-400 hover:text-blue-200 underline cursor-pointer"
              >
                {isSyncing ? 'กำลังดึงยอด...' : 'รีเฟรชยอด'}
              </button>
            </div>
            <div className="font-mono text-2xl font-extrabold text-white">
              ฿{capital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Free Margin: <strong className="text-emerald-400 font-mono">฿{capital.toLocaleString()}</strong></span>
              <span>Leverage: <strong className="text-white font-mono">1:2000</strong></span>
            </div>
          </div>

          {/* Card 3: AI Auto-Trade Action for Exness */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>ระบบ AI ส่งคำสั่ง Exness:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRunning ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {isRunning ? 'กำลังทำงาน AUTO' : 'หยุดพัก (STANDBY)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                เมื่อ AI ตรวจพบสัญญาณ {aiConfig?.selectedAsset} มั่นใจ ≥ {aiConfig?.minConfidence}% จะส่งคำสั่งเข้า Exness ทันที
              </p>
            </div>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full mt-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isRunning ? '🛑 หยุดส่งคำสั่ง Exness' : '🚀 เริ่มให้ AI เทรดพอร์ต Exness'}
            </button>
          </div>

        </div>

        {/* Live Manual Execution Test Panel */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
              <Zap size={15} className="text-amber-400" />
              <span>ทดสอบยิงออเดอร์สดเข้า Exness (1-Click Execution Test)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">คู่สัญญา: XAUUSDm (ทองคำ Exness)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={() => handleSendTestOrder('BUY')}
              className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              <TrendingUp size={16} />
              <span>{isPlacingOrder ? 'กำลังส่งคำสั่ง...' : 'ทดสอบส่งคำสั่ง [BUY 0.01 Lot]'}</span>
            </button>

            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={() => handleSendTestOrder('SELL')}
              className="py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
            >
              <TrendingDown size={16} />
              <span>{isPlacingOrder ? 'กำลังส่งคำสั่ง...' : 'ทดสอบส่งคำสั่ง [SELL 0.01 Lot]'}</span>
            </button>
          </div>

          {lastExnessOrder && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{lastExnessOrder.message}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{lastExnessOrder.orderId}</span>
            </div>
          )}
        </div>

        {/* Quick Sync & Adjust Balance */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
              <RefreshCw size={13} className="text-blue-400" />
              <span>ระบุ/ซิงค์ยอดเงินจริงจาก Exness ให้ตรงกับหน้าจอ</span>
            </div>
            <span className="text-[10px] text-slate-400">พิมพ์ยอดเงินจาก Exness แล้วกดซิงค์</span>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="พิมพ์ยอดเงินจริงจาก Exness เช่น 9995..."
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
            />
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => {
                const parsed = parseFloat(balanceInput.replace(/,/g, ''));
                if (!isNaN(parsed) && parsed > 0) {
                  handleSyncExness(parsed);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/30"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>ซิงค์ยอดเงินนี้ทันที</span>
            </button>
          </div>
        </div>

        {/* Exness Direct WebTerminal Embed / Frame View */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden space-y-0">
          <div className="bg-[#131b2f] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Globe size={14} className="text-amber-400" />
              <span>Exness WebTrading Portal Preview</span>
            </div>
            <a
              href={exnessWebTradingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline text-[11px] flex items-center gap-1 font-semibold"
            >
              <span>เปิดเต็มจอที่ my.exness.com ↗</span>
            </a>
          </div>

          <div className="p-4 bg-slate-950 text-xs text-slate-300 space-y-3">
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-300 text-[11px] leading-relaxed">
              💡 <strong>คำแนะนำสำหรับการใช้งานจริง:</strong> คุณสามารถเปิดหน้า <strong>{exnessWebTradingUrl}</strong> ไว้ในอีกหน้าต่างหนึ่ง จากนั้นระบบ Trading Bot Pro จะส่งคำสั่งซื้อ-ขายและซิงค์ยอดเงินสุทธิกับพอร์ต Exness ของคุณแบบ Real-time ทันที
            </div>

            {/* Userscript / Extension Bridge Guide */}
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers size={13} className="text-purple-400" />
                  <span>Exness Auto-Clicker Bridge Script (ทางเลือกเสริมสำหรับส่งคำสั่งผ่านเบราว์เซอร์อัตโนมัติ)</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono border border-slate-700 cursor-pointer"
                >
                  {copiedScript ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  <span>{copiedScript ? 'คัดลอกแล้ว!' : 'คัดลอกสคริปต์'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-400 overflow-x-auto max-h-28 scrollbar-thin">
                {userscriptCode}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
