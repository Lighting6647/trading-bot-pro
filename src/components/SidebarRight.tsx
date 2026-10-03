"use client";

import { 
  Settings, 
  Play, 
  Square, 
  LayoutDashboard, 
  Globe, 
  Brain, 
  Shield, 
  Bell, 
  Zap,
  Lock
} from 'lucide-react';
import { useTrading } from '@/context/TradingContext';

const menuItems = [
  { key: 'แดชบอร์ด', icon: LayoutDashboard, color: 'text-green-400', label: 'แดชบอร์ดหลัก' },
  { key: 'Exness เทรด', icon: Zap, color: 'text-amber-400', label: 'Exness WebTrading (สด)' },
  { key: 'AI สัญญาณ', icon: Brain, color: 'text-purple-400', label: 'AI สัญญาณเทรด' },
  { key: 'ความเสี่ยง', icon: Shield, color: 'text-amber-400', label: 'จัดการความเสี่ยง' },
  { key: 'แจ้งเตือน', icon: Bell, color: 'text-blue-400', label: 'แจ้งเตือน & บันทึก' },
];

export default function SidebarRight() {
  const { 
    isRunning, 
    setIsRunning, 
    setIsSettingsOpen, 
    trades, 
    activePanel, 
    setActivePanel, 
    notifications, 
    isCooldown, 
    cooldownSeconds, 
    language, 
    setLanguage,
    addNotification,
    user,
    setIsLoginModalOpen
  } = useTrading();

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleLanguage = () => {
    const nextLang = language === 'TH' ? 'EN' : 'TH';
    setLanguage(nextLang);
    addNotification('signal', `🌐 เปลี่ยนภาษาเป็น ${nextLang === 'TH' ? 'ภาษาไทย' : 'English'}`);
  };

  return (
    <div className="w-full xl:w-72 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
      {/* Top Status */}
      <div className="p-3 border-b border-slate-800 flex justify-between items-center text-xs">
        <div className={`flex items-center gap-2 font-semibold ${isRunning ? 'text-green-500' : 'text-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          {isRunning ? (isCooldown ? `COOLDOWN ${Math.floor(cooldownSeconds/60)}:${(cooldownSeconds%60).toString().padStart(2,'0')}` : 'RUNNING') : 'STOPPED'}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-400 font-mono font-bold text-[11px]">#{user.accountNumber || '160187619'}</span>
        </div>
      </div>

      {/* Trade List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[120px]">
        {trades.slice(0, 15).map((trade) => (
          <div key={trade.id} className="flex items-center justify-between text-xs font-mono p-1.5 hover:bg-slate-800 rounded">
            <span className="text-slate-500 w-6">#{trade.id}</span>
            <span className="text-amber-400 w-14 text-right">{trade.amount.toLocaleString()}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] w-12 text-center ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
              {trade.type}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] w-12 text-center ${trade.result === 'WIN' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {trade.result}
            </span>
            <span className="text-slate-400 text-[11px]">{trade.time}</span>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-blue-400 text-xs font-bold">&gt; INFO</span>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            จัดการบัญชี
          </button>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">BROKER</span>
            <span className="text-slate-200 font-semibold">{user.broker}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">บัญชี</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                user.accountType === 'REAL' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {user.accountType === 'REAL' ? '● บัญชีจริง' : '○ ทดลองเทรด'}
            </button>
          </div>
          <div className="flex justify-between"><span className="text-slate-400">SYMBOL</span><span className="text-slate-200">SP500/Gold</span></div>
          <div className="flex justify-between"><span className="text-slate-400">LOT</span><span className="text-slate-200">1 / 4</span></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-2 border-t border-slate-800 max-h-[260px] overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActivePanel(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                isActive
                  ? `bg-slate-800 ${item.color} border border-slate-700 shadow-xs font-medium`
                  : `hover:bg-slate-800 text-slate-400 border border-transparent`
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
              {item.key === 'แจ้งเตือน' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Settings & Actions */}
      <div className="p-2 space-y-2 border-t border-slate-800">
        <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-sm transition-colors cursor-pointer">
          <Settings size={16} /> ตั้งค่าระบบ
        </button>
        <div className="flex gap-2">
          <button 
            onClick={toggleLanguage}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-[11px] transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-blue-400" />
            <span>ภาษา: <strong className="text-amber-400">{language}</strong></span>
          </button>
        </div>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded transition-all cursor-pointer ${
            isRunning 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30' 
              : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25'
          }`}
        >
          {isRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {isRunning ? 'STOP' : 'START'}
        </button>
      </div>
    </div>
  );
}
