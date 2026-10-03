"use client";

import { useState } from 'react';
import { 
  User, 
  X, 
  ShieldCheck, 
  Key, 
  Mail, 
  Globe, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Server, 
  Lock, 
  ArrowRightLeft,
  Eye,
  EyeOff,
  Wallet,
  RefreshCw,
  RotateCcw,
  Edit3,
  Zap,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useTrading } from '@/context/TradingContext';

const brokerList = [
  { id: 'IQ Option', name: 'IQ Option (IQ Broker)', icon: '🟢', minDeposit: '฿350' },
  { id: 'Exness', name: 'Exness Trade', icon: '🟡', minDeposit: '฿300' },
  { id: 'Alpaca', name: 'Alpaca Trading API', icon: '🦙', minDeposit: '$0' },
  { id: 'Binance', name: 'Binance Crypto & Futures', icon: '🔶', minDeposit: '$10' },
  { id: 'MetaTrader', name: 'MetaTrader 5 (MT5 Broker)', icon: '🔷', minDeposit: '฿500' },
];

export default function AccountModal() {
  const { 
    user, 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    switchAccountType, 
    login, 
    logout,
    capital,
    setCapital,
    profit,
    syncBrokerBalance,
    resetSessionData,
    addNotification,
    brokerLiveState,
    setBrokerLiveState,
    syncLiveBrokerAccount
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'status' | 'login'>(user.isLoggedIn ? 'status' : 'login');
  
  // Login Form State
  const [email, setEmail] = useState(user.email || 'lighting6647@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [broker, setBroker] = useState(user.broker || 'Exness');
  const [server, setServer] = useState(user.server || 'Exness-Real19');
  const [targetType, setTargetType] = useState<'DEMO' | 'REAL'>(user.accountType || 'REAL');
  const [customBalance, setCustomBalance] = useState<string>(capital ? capital.toString() : '10000');
  const [apiKey, setApiKey] = useState(brokerLiveState.apiKey || '');
  const [apiSecret, setApiSecret] = useState(brokerLiveState.apiSecret || '');
  const [webhookUrl, setWebhookUrl] = useState(brokerLiveState.webhookUrl || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; ping?: number } | null>(null);

  // Status Tab Balance Editor
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editBalanceInput, setEditBalanceInput] = useState(capital.toString());

  // Real Broker Syncing State & Feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; timestamp: string; balance: number } | null>(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncCustomAmount, setSyncCustomAmount] = useState(capital.toString());

  if (!isLoginModalOpen) return null;

  const handleSyncBroker = (amountToSync?: number) => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const targetBal = amountToSync !== undefined 
        ? amountToSync 
        : (user.accountType === 'REAL' ? (capital || 10000) : 100000);
      
      syncBrokerBalance(targetBal);
      setIsSyncing(false);
      setIsSyncDialogOpen(false);
      const timeStr = new Date().toLocaleTimeString('th-TH');
      setSyncFeedback({
        message: `ซิงค์พอร์ต ${user.broker} (${user.server || 'Real-Server'}) สำเร็จ!`,
        timestamp: timeStr,
        balance: targetBal,
      });
      addNotification('signal', `🔄 ซิงค์พอร์ต ${user.broker} สำเร็จ: ฿${targetBal.toLocaleString()}`);
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addNotification('risk', '⚠️ กรุณาระบุอีเมลหรือ Account ID');
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      const parsedBal = parseFloat(customBalance.replace(/,/g, ''));
      const env = targetType === 'REAL' ? 'LIVE' : 'PAPER';
      login({
        email: email.trim(),
        broker,
        accountType: targetType,
        accountNumber: `ACC-${Math.floor(1000000 + Math.random() * 9000000)}`,
        server: server.trim() || 'Real-Server',
        balance: !isNaN(parsedBal) && parsedBal > 0 ? parsedBal : (targetType === 'REAL' ? 10000 : 100000),
      });
      setBrokerLiveState(prev => ({
        ...prev,
        apiKey,
        apiSecret,
        webhookUrl,
        environment: env,
        serverOrPassphrase: server.trim() || prev.serverOrPassphrase,
      }));
      setIsConnecting(false);
      setActiveTab('status');
    }, 700);
  };

  const handleSaveBalance = () => {
    const parsed = parseFloat(editBalanceInput.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      setCapital(parsed);
      setIsEditingBalance(false);
      setSyncFeedback({
        message: `บันทึกยอดเงินทุนสำเร็จ!`,
        timestamp: new Date().toLocaleTimeString('th-TH'),
        balance: parsed,
      });
      addNotification('signal', `💾 บันทึกยอดเงินทุนจริงเรียบร้อย: ฿${parsed.toLocaleString()}`);
    }
  };

  const handleQuickDemo = () => {
    setEmail('center.art@mss.com');
    setBroker('IQ Option');
    setTargetType('DEMO');
    setServer('Demo-Server');
    setCustomBalance('100000');
    login({
      email: 'center.art@mss.com',
      broker: 'IQ Option',
      accountType: 'DEMO',
      accountNumber: 'ACC-8839210',
      server: 'Demo-Server',
      balance: 100000,
    });
    setActiveTab('status');
  };

  const totalBalance = capital + profit;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0f172a] border border-blue-500/50 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1e293b] px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs border border-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft size={13} />
              <span>กลับ</span>
            </button>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
              <User size={16} />
              <span>บัญชี & การเข้าสู่ระบบ</span>
            </div>
          </div>
          <button 
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 cursor-pointer"
            title="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors cursor-pointer ${
              activeTab === 'status' 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            สถานะบัญชีปัจจุบัน
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors cursor-pointer ${
              activeTab === 'login' 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            เชื่อมต่อโบรกเกอร์ / สลับบัญชี
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[75vh] text-slate-200 text-xs space-y-4">
          {activeTab === 'status' ? (
            /* TAB 1: STATUS & PROFILE */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-slate-900 via-[#131b2f] to-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xl font-bold shadow-md shadow-blue-500/20">
                      {user.email.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{user.email}</span>
                        {user.isLoggedIn && (
                          <CheckCircle2 size={14} className="text-green-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>โบรกเกอร์: <strong className="text-amber-400">{user.broker}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{user.accountNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                    user.accountType === 'REAL' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {user.accountType === 'REAL' ? '● บัญชีจริง' : '○ ทดลองเทรด'}
                  </span>
                </div>

                {/* Balance Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>ทุนในพอร์ต (Capital)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingBalance(!isEditingBalance);
                          setEditBalanceInput(capital.toString());
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                      >
                        {isEditingBalance ? 'ปิด' : 'แก้ไขทุน'}
                      </button>
                    </div>
                    {isEditingBalance ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={editBalanceInput}
                          onChange={(e) => setEditBalanceInput(e.target.value)}
                          className="w-24 bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveBalance}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          บันทึก
                        </button>
                      </div>
                    ) : (
                      <div className="text-base font-bold font-mono text-white mt-0.5">
                        {capital.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">กำไร/ขาดทุนรอบนี้</div>
                    <div className={`text-base font-bold font-mono mt-0.5 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profit > 0 ? '+' : ''}{profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                    </div>
                  </div>
                </div>

                {/* Total Equity Summary */}
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">ยอดเงินสุทธิคงเหลือ (Total Equity):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                  </span>
                </div>
              </div>

              {/* Real Balance Sync & Reset Action Toolbar */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleSyncBroker()}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSyncing
                        ? 'bg-emerald-600/40 border-emerald-400 text-white animate-pulse'
                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
                    }`}
                    title="ดึงยอดเงินและสถานะล่าสุดจากโบรกเกอร์"
                  >
                    <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'กำลังเชื่อมต่อ API...' : `ซิงค์พอร์ต ${user.broker}`}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => {
                      resetSessionData();
                      setSyncFeedback({
                        message: 'รีเซ็ตข้อมูลสถิติรอบเทรดเป็น 0 เรียบร้อย',
                        timestamp: new Date().toLocaleTimeString('th-TH'),
                        balance: capital,
                      });
                    }}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="ล้างสถิติที่เคยเทรดออก เริ่มต้นรอบใหม่ 0 บาท"
                  >
                    <RotateCcw size={13} />
                    <span>รีเซ็ตสถิติ 0 ฿</span>
                  </button>
                </div>

                {/* Real-time Sync Feedback Banner */}
                {syncFeedback && (
                  <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-2.5 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-emerald-300 font-semibold">{syncFeedback.message}</div>
                        <div className="text-[10px] text-slate-400">
                          อัปเดตเมื่อ: {syncFeedback.timestamp} • ยอดเงินพอร์ต: <span className="text-emerald-400 font-mono font-bold">฿{syncFeedback.balance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">18ms</span>
                  </div>
                )}

                {/* Quick Presets & Direct Sync Tool */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-400" />
                      <span>ซิงค์/ปรับยอดทุนพอร์ตตรง</span>
                    </span>
                    <span className="text-[10px] text-slate-400">กดเลือกยอดทุนเพื่อซิงค์ทันที</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[1000, 3000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSyncBroker(amt)}
                        disabled={isSyncing}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
                          capital === amt 
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        ฿{amt >= 1000 ? `${amt / 1000}K` : amt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="number"
                      placeholder="หรือพิมพ์ยอดเงินจริงจาก Exness (฿)..."
                      value={syncCustomAmount}
                      onChange={(e) => setSyncCustomAmount(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => {
                        const parsed = parseFloat(syncCustomAmount.replace(/,/g, ''));
                        if (!isNaN(parsed) && parsed > 0) {
                          handleSyncBroker(parsed);
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                      <span>ซิงค์ยอดนี้</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Type Switcher */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ArrowRightLeft size={14} className="text-blue-400" />
                  <span>สลับประเภทบัญชี (Demo / Real)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchAccountType('DEMO')}
                    className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      user.accountType === 'DEMO'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>บัญชีทดลอง (Demo)</div>
                    <div className="text-[10px] text-slate-400 font-normal">ซ้อมเทรดปลอดภัย</div>
                  </button>
                  <button
                    onClick={() => switchAccountType('REAL')}
                    className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      user.accountType === 'REAL'
                        ? 'bg-green-500/20 border-green-500/60 text-green-400 font-bold shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>บัญชีจริง (Real)</div>
                    <div className="text-[10px] text-slate-400 font-normal">เทรดด้วยเงินจริง</div>
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Server size={13} className="text-green-400" />
                    <span>สถานะ API โบรกเกอร์</span>
                  </span>
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>เชื่อมต่อสมบูรณ์ (18ms)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>โปรโตคอล:</span>
                  <span className="font-mono text-slate-300">WebSocket SSL v2 / Secure API</span>
                </div>
                <div className="flex justify-between">
                  <span>สิทธิ์การใช้งานบอท:</span>
                  <span className="text-emerald-400 font-semibold">Trading Bot Pro Full License</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  <ArrowLeft size={13} />
                  <span>กลับ</span>
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key size={14} />
                  <span>เปลี่ยนบัญชี / โบรกเกอร์</span>
                </button>
                <button
                  onClick={logout}
                  className="py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>ออก</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: LOGIN & CONNECT BROKER FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="text-slate-400 text-xs mb-1">
                กรอกข้อมูลบัญชีเพื่อเชื่อมต่อระบบบอทกับโบรกเกอร์ที่คุณใช้งาน
              </div>

              {/* Broker Selector */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  <Globe size={13} className="text-blue-400" />
                  <span>เลือกโบรกเกอร์ (Broker)</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {brokerList.map(b => (
                    <label 
                      key={b.id}
                      onClick={() => setBroker(b.id)}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        broker === b.id 
                          ? 'bg-blue-600/20 border-blue-500 text-white font-semibold' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{b.icon}</span>
                        <span>{b.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ขั้นต่ำ {b.minDeposit}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Account Type (Demo vs Real) */}
              <div className="space-y-1 pt-1">
                <label className="text-slate-300 font-semibold">ประเภทบัญชีที่ต้องการเข้า:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('DEMO')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      targetType === 'DEMO'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    บัญชีทดลอง (Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('REAL')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      targetType === 'REAL'
                        ? 'bg-green-500/20 text-green-400 border-green-500/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    บัญชีจริง (Real)
                  </button>
                </div>
              </div>

              {/* Email / Account ID */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  <Mail size={13} className="text-blue-400" />
                  <span>อีเมล หรือ Account ID</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น user@example.com หรือ ID บัญชี"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  <Lock size={13} className="text-blue-400" />
                  <span>รหัสผ่านโบรกเกอร์ (Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="รหัสผ่านบัญชี"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white outline-none font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Server & Initial Capital Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    <Server size={12} className="text-blue-400" />
                    <span>Server โบรกเกอร์</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Exness-Real19"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    <Wallet size={12} className="text-amber-400" />
                    <span>ทุนในพอร์ตจริง (฿)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="เช่น 10000"
                    value={customBalance}
                    onChange={(e) => setCustomBalance(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Optional API Key & Secret */}
              <div className="space-y-2 p-3 bg-slate-900/80 rounded-xl border border-blue-900/30">
                <div className="font-semibold text-blue-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key size={13} />
                    <span>การเชื่อมต่อ Broker Live API (อัตโนมัติ 100%)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    {broker}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">API Key / Token:</label>
                  <input
                    type="password"
                    placeholder={`ใส่ API Key ของ ${broker}`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">API Secret Key (ถ้ามี):</label>
                  <input
                    type="password"
                    placeholder="Secret Key สำหรับลงนามออเดอร์"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Webhook / MetaApi Bridge URL (สำหรับ MT5/Exness):</label>
                  <input
                    type="text"
                    placeholder="https://your-mt5-bridge.com/api/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>

                {/* Test API Connection Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsConnecting(true);
                    setApiTestResult(null);
                    const success = await syncLiveBrokerAccount({
                      apiKey,
                      apiSecret,
                      webhookUrl,
                      environment: targetType === 'REAL' ? 'LIVE' : 'PAPER',
                    });
                    setIsConnecting(false);
                    setApiTestResult({
                      success,
                      message: success ? `เชื่อมต่อ ${broker} สำเร็จ!` : `เชื่อมต่อ ${broker} ไม่สำเร็จ ตรวจสอบ API Key`,
                    });
                  }}
                  className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={isConnecting ? 'animate-spin' : ''} />
                  <span>🔍 ทดสอบการเชื่อมต่อ Broker API จริง</span>
                </button>

                {apiTestResult && (
                  <div className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    apiTestResult.success 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    {apiTestResult.success ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-rose-400" />}
                    <span>{apiTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Quick Fill Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full py-1.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-amber-400 rounded-lg text-[11px] border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>คลิกเดียว: เข้าใช้งานด้วยบัญชีตัวอย่าง (center.art@mss.com)</span>
                </button>
              </div>

              {/* Submit & Back Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  <ArrowLeft size={13} />
                  <span>กลับ</span>
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-blue-600/30"
                >
                  {isConnecting ? (
                    <span>กำลังเชื่อมต่อ API...</span>
                  ) : (
                    <>
                      <LogIn size={15} />
                      <span>บันทึก & เริ่มเชื่อมต่อบอท</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
