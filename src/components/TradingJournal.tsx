"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  Save,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Hash,
  BarChart3,
  RotateCcw,
  Clock,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTrading } from '@/context/TradingContext';

const PRESET_TAGS = [
  'Breakout',
  'Reversal',
  'Scalp',
  'Trend',
  'Support/Resistance',
  'News'
];

export default function TradingJournal() {
  const { trades, journalEntries, addJournalEntry } = useTrading();

  // Form State
  const [selectedTradeId, setSelectedTradeId] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSE'>('ALL');

  // SSR Mount Check for Recharts
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default trade selection if available
  useEffect(() => {
    if (trades.length > 0 && selectedTradeId === '') {
      setSelectedTradeId(trades[0].id);
    }
  }, [trades, selectedTradeId]);

  // Selected Trade Detail for form preview
  const currentSelectedTrade = useMemo(() => {
    if (selectedTradeId === '') return null;
    return trades.find(t => t.id === Number(selectedTradeId)) || null;
  }, [trades, selectedTradeId]);

  // Tag Color Helper
  const getTagBadgeStyle = (tag: string, isInteractive = false, isSelected = false) => {
    const base = 'border transition-all duration-150 font-medium text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5';
    
    let colorScheme = '';
    switch (tag.toLowerCase()) {
      case 'breakout':
        colorScheme = isSelected || !isInteractive
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-amber-300 hover:border-amber-500/30';
        break;
      case 'reversal':
        colorScheme = isSelected || !isInteractive
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/30';
        break;
      case 'scalp':
        colorScheme = isSelected || !isInteractive
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-emerald-300 hover:border-emerald-500/30';
        break;
      case 'trend':
        colorScheme = isSelected || !isInteractive
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-indigo-300 hover:border-indigo-500/30';
        break;
      case 'support/resistance':
        colorScheme = isSelected || !isInteractive
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-rose-300 hover:border-rose-500/30';
        break;
      case 'news':
        colorScheme = isSelected || !isInteractive
          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/10'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-yellow-300 hover:border-yellow-500/30';
        break;
      default:
        colorScheme = isSelected || !isInteractive
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-blue-300 hover:border-blue-500/30';
    }

    return `${base} ${colorScheme}`;
  };

  // Toggle Tag selection in form
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedTradeId === '') {
      setFormError('กรุณาเลือก Order เทรดที่ต้องการบันทึก');
      return;
    }

    if (!note.trim()) {
      setFormError('กรุณาระบุบันทึกรายละเอียดการเทรด');
      return;
    }

    addJournalEntry(Number(selectedTradeId), note.trim(), selectedTags);

    // Reset Form
    setNote('');
    setSelectedTags([]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Summary Stats Calculations
  const stats = useMemo(() => {
    const totalEntries = journalEntries.length;

    // Tag counts
    const tagCountMap: Record<string, number> = {};
    let winCount = 0;
    let loseCount = 0;

    journalEntries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
      });

      const trade = trades.find(t => t.id === entry.tradeId);
      if (trade?.result === 'WIN') winCount++;
      if (trade?.result === 'LOSE') loseCount++;
    });

    const tagEntries = Object.entries(tagCountMap);
    tagEntries.sort((a, b) => b[1] - a[1]);
    const mostUsedTag = tagEntries.length > 0 ? tagEntries[0][0] : 'ยังไม่มีข้อมูล';
    const mostUsedTagCount = tagEntries.length > 0 ? tagEntries[0][1] : 0;

    // Chart data for tags
    const chartData = PRESET_TAGS.map(tag => ({
      name: tag,
      count: tagCountMap[tag] || 0,
    })).filter(item => item.count > 0);

    return {
      totalEntries,
      mostUsedTag,
      mostUsedTagCount,
      winCount,
      loseCount,
      chartData,
    };
  }, [journalEntries, trades]);

  // Filtered Journal Entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      // Find matching trade
      const trade = trades.find(t => t.id === entry.tradeId);

      // Search match (in note, tag, or trade ID)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        entry.note?.toLowerCase().includes(query) ||
        (entry.tags?.some(t => t.toLowerCase().includes(query)) ?? false) ||
        entry.tradeId.toString().includes(query);

      // Tag filter
      const matchesTag =
        activeTagFilter === 'ALL' ||
        (entry.tags?.includes(activeTagFilter) ?? false);

      // Result filter
      const matchesResult =
        resultFilter === 'ALL' ||
        (trade && trade.result === resultFilter);

      return matchesSearch && matchesTag && matchesResult;
    });
  }, [journalEntries, trades, searchQuery, activeTagFilter, resultFilter]);

  // Format Date Helper
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] min-h-0 overflow-y-auto text-slate-200 p-4 md:p-6 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131b2f] p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
              สมุดบันทึกการเทรด
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Trading Journal
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              จดบันทึกกลยุทธ์ อารมณ์ และเหตุผลในแต่ละออเดอร์เพื่อพัฒนาวินัยการเทรด
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Layers size={14} className="text-blue-400" />
          <span>บันทึกทั้งหมด: <strong className="text-white font-mono">{journalEntries.length}</strong> รายการ</span>
        </div>
      </div>

      {/* 2. Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Entries */}
        <div className="bg-[#131b2f] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">บันทึกทั้งหมด</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-white mt-1">
              {stats.totalEntries}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">รายการที่บันทึกไว้</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BookOpen size={18} />
          </div>
        </div>

        {/* Most Used Tag */}
        <div className="bg-[#131b2f] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs text-slate-400 font-medium">แท็กที่ใช้บ่อยที่สุด</div>
            <div className="text-base md:text-lg font-bold text-amber-400 mt-1 truncate">
              {stats.mostUsedTag}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.mostUsedTagCount > 0 ? `ใช้ไปแล้ว ${stats.mostUsedTagCount} ครั้ง` : 'รอการเพิ่มข้อมูล'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Tag size={18} />
          </div>
        </div>

        {/* Win Trades Logged */}
        <div className="bg-[#131b2f] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">บันทึกไม้ชนะ (WIN)</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-green-400 mt-1">
              {stats.winCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">ออเดอร์ที่ชนะ</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Loss Trades Logged */}
        <div className="bg-[#131b2f] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">บันทึกไม้แพ้ (LOSE)</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-red-400 mt-1">
              {stats.loseCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">ออเดอร์ที่แพ้ (นำมาวิเคราะห์)</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <TrendingDown size={18} />
          </div>
        </div>
      </div>

      {/* Mini Chart for Tag Breakdown (if entries exist) */}
      {mounted && stats.chartData.length > 0 && (
        <div className="bg-[#131b2f] p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <BarChart3 size={14} className="text-blue-400" />
              การกระจายตัวของแท็กกลยุทธ์ (Tag Distribution)
            </div>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.chartData.map((entry, index) => {
                    const colors = ['#f59e0b', '#06b6d4', '#10b981', '#6366f1', '#f43f5e', '#eab308'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Main Workspace: Add Entry Form (Left) & Journal Entries List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add Entry Form (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#131b2f] border border-slate-800 rounded-xl p-5 shadow-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plus size={16} className="text-blue-400" />
                <span>เพิ่มบันทึกการเทรด</span>
              </div>
              <span className="text-[11px] text-slate-400">กรอกข้อมูลออเดอร์</span>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>บันทึกข้อมูลการเทรดสำเร็จเรียบร้อยแล้ว! 🎉</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Trade ID */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash size={13} className="text-blue-400" />
                    เลือก Order เทรด (Trade ID)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {trades.length} ออเดอร์ล่าสุด
                  </span>
                </label>

                {trades.length === 0 ? (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                    ยังไม่มีรายการเทรดในระบบ ให้ทำการเปิดบอทหรือเทรดก่อน
                  </div>
                ) : (
                  <select
                    value={selectedTradeId}
                    onChange={(e) => setSelectedTradeId(Number(e.target.value))}
                    className="w-full bg-[#0a0f1c] border border-slate-700/80 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                  >
                    <option value="" disabled>-- เลือก Order เทรด --</option>
                    {trades.map(trade => (
                      <option key={trade.id} value={trade.id}>
                        #{trade.id} - {trade.type} | {trade.result} | ฿{trade.amount.toLocaleString()} ({trade.time})
                      </option>
                    ))}
                  </select>
                )}

                {/* Selected Trade Preview Box */}
                {currentSelectedTrade && (
                  <div className="mt-2 p-2.5 bg-[#0a0f1c]/70 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">Order #{currentSelectedTrade.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentSelectedTrade.type === 'BUY' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {currentSelectedTrade.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentSelectedTrade.result === 'WIN' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {currentSelectedTrade.result}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">
                        ฿{currentSelectedTrade.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                        <Clock size={10} />
                        {currentSelectedTrade.time}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Note Textarea */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>บันทึกเหตุผล & สภาพจิตวิทยา (Trading Notes)</span>
                  <span className="text-[10px] text-slate-500">{note.length} ตัวอักษร</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เขียนบันทึก: เหตุผลที่เข้าออเดอร์, อารมณ์, แนวรับแนวต้าน, สภาพตลาด, ข้อผิดพลาดหรือสิ่งที่ทำได้ดี..."
                  rows={4}
                  className="w-full bg-[#0a0f1c] border border-slate-700/80 rounded-lg p-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Tag Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Tag size={13} className="text-blue-400" />
                    เลือกแท็กกลยุทธ์ (Strategy Tags)
                  </label>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                    >
                      ล้างแท็ก ({selectedTags.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={getTagBadgeStyle(tag, true, isSelected)}
                      >
                        <span>{tag}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={trades.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-600/20 transition-all duration-150 cursor-pointer"
                >
                  <Save size={16} />
                  <span>บันทึก</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Search & Journal Entries List (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* 4. Search and Filter Bar */}
          <div className="bg-[#131b2f] p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาข้อความ, แท็ก, หรือ Order ID..."
                className="w-full bg-[#0a0f1c] border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              {/* Tag Dropdown Filter */}
              <div className="flex items-center gap-1.5 bg-[#0a0f1c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={activeTagFilter}
                  onChange={(e) => setActiveTagFilter(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">แท็กทั้งหมด</option>
                  {PRESET_TAGS.map(tag => (
                    <option key={tag} value={tag} className="bg-slate-900 text-slate-200">{tag}</option>
                  ))}
                </select>
              </div>

              {/* Result Filter */}
              <div className="flex bg-[#0a0f1c] border border-slate-700/80 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setResultFilter('ALL')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    resultFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setResultFilter('WIN')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    resultFilter === 'WIN' ? 'bg-green-500/20 text-green-400 font-bold' : 'text-slate-400 hover:text-green-400'
                  }`}
                >
                  WIN
                </button>
                <button
                  onClick={() => setResultFilter('LOSE')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    resultFilter === 'LOSE' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  LOSE
                </button>
              </div>
            </div>
          </div>

          {/* List of Entries Header Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              แสดง <strong className="text-white">{filteredEntries.length}</strong> จาก {journalEntries.length} รายการ
            </span>
            {(searchQuery || activeTagFilter !== 'ALL' || resultFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTagFilter('ALL');
                  setResultFilter('ALL');
                }}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw size={11} /> ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Journal Entries List */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <div className="bg-[#131b2f] border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-300">
                    {journalEntries.length === 0
                      ? 'ยังไม่มีรายการบันทึกการเทรด'
                      : 'ไม่พบบันทึกที่ตรงกับเงื่อนไขการค้นหา'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {journalEntries.length === 0
                      ? 'เริ่มต้นเลือก Order จากแบบฟอร์มด้านซ้ายและเขียนบันทึกสรุปความคิดของคุณ'
                      : 'ลองปรับคำค้นหาหรือเปลี่ยนแท็กตัวกรองใหม่อีกครั้ง'}
                  </p>
                </div>
              </div>
            ) : (
              filteredEntries.map(entry => {
                const trade = trades.find(t => t.id === entry.tradeId);

                return (
                  <div
                    key={entry.id}
                    className="bg-[#131b2f] border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-150 space-y-3 shadow-sm"
                  >
                    {/* Header: Trade Info & Created Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        {/* Trade ID */}
                        <div className="flex items-center gap-1 font-mono font-bold text-xs text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          <Hash size={12} className="text-blue-400" />
                          <span>{entry.tradeId}</span>
                        </div>

                        {/* Trade Type */}
                        {trade && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              trade.type === 'BUY'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {trade.type}
                          </span>
                        )}

                        {/* Trade Result */}
                        {trade ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              trade.result === 'WIN'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {trade.result}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            RECORDED
                          </span>
                        )}

                        {/* Trade Amount */}
                        {trade && (
                          <span className="text-xs font-mono font-bold text-amber-400">
                            ฿{trade.amount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{formatDateTime(entry.createdAt)}</span>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="bg-[#0a0f1c]/70 border border-slate-800/80 rounded-lg p-3 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {entry.note}
                    </div>

                    {/* Tags List */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Tag size={12} className="text-slate-500 mr-1" />
                        {entry.tags.map(tag => (
                          <span key={tag} className={getTagBadgeStyle(tag, false, true)}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
