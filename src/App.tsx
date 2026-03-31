/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Search, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  PieChart as PieChartIcon,
  Info,
  Settings,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { predictGrowth } from './services/gemini';
import { cn } from './lib/utils';

// --- Types ---
interface DataPoint {
  year: string;
  value: number;
}

interface SectorPoint {
  sector: string;
  contribution: number;
}

interface KeyDriver {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

interface EconomicData {
  summary: string;
  gdpGrowth: DataPoint[];
  inflation: DataPoint[];
  sectoralGrowth: SectorPoint[];
  keyDrivers: KeyDriver[];
}

// --- Constants ---
const COLORS = ['#141414', '#F27D26', '#5A5A40', '#00FF00', '#FF4444'];
const DEFAULT_PROMPT = "Predict India's economic growth for the next 5 years (2024-2029). Focus on GDP, inflation, and sectoral shifts.";

export default function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EconomicData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictGrowth(customPrompt || prompt);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch predictions. Please check your API key and connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6" />
          <h1 className="font-serif italic text-xl tracking-tight">India Growth Predictor</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
            {new Date().toLocaleDateString()} // Real-time Analysis
          </div>
          <button className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Search Section */}
        <section className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="font-serif italic text-xs uppercase tracking-wider opacity-60">
                Economic Inquiry
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt for economic prediction..."
                  className="w-full bg-transparent border-b-2 border-[#141414] py-4 pr-12 text-2xl font-light focus:outline-none focus:border-[#F27D26] transition-colors placeholder:opacity-20"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:text-[#F27D26] disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Search className="w-8 h-8" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {["2024-2030 Outlook", "Sectoral Analysis", "Inflation Impact"].map((tag) => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => {
                    const p = `Predict India's economic growth focusing on ${tag} for the next 5 years.`;
                    setPrompt(p);
                    fetchData(p);
                  }}
                  className="text-[10px] uppercase font-mono border border-[#141414] px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#FF4444] text-white p-4 font-mono text-xs flex items-center gap-3"
            >
              <Activity className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-500",
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          {/* Summary Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white border border-[#141414] p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif italic text-lg">Executive Summary</h2>
                <Activity className="w-4 h-4 opacity-30" />
              </div>
              <div className="flex-1 font-sans text-sm leading-relaxed prose prose-sm">
                {data ? (
                  <ReactMarkdown>{data.summary}</ReactMarkdown>
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-[#141414]/10 w-full" />
                    <div className="h-4 bg-[#141414]/10 w-5/6" />
                    <div className="h-4 bg-[#141414]/10 w-4/6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GDP Growth Chart */}
            <div className="bg-white border border-[#141414] p-6 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-mono opacity-50">GDP Growth Rate (%)</h3>
                <TrendingUp className="w-4 h-4 text-[#00FF00]" />
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.gdpGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: 'none', color: '#E4E3E0', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#00FF00' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#141414" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#141414' }} 
                      activeDot={{ r: 6, fill: '#F27D26' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inflation Chart */}
            <div className="bg-white border border-[#141414] p-6 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-mono opacity-50">Inflation Forecast (%)</h3>
                <Activity className="w-4 h-4 text-[#FF4444]" />
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.inflation || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f5f5f5' }}
                      contentStyle={{ backgroundColor: '#141414', border: 'none', color: '#E4E3E0', fontSize: '10px', fontFamily: 'monospace' }}
                    />
                    <Bar dataKey="value" fill="#141414" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sectoral Contribution */}
            <div className="bg-white border border-[#141414] p-6 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-mono opacity-50">Sectoral GDP Share</h3>
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.sectoralGrowth || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="contribution"
                      nameKey="sector"
                    >
                      {(data?.sectoralGrowth || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: 'none', color: '#E4E3E0', fontSize: '10px', fontFamily: 'monospace' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Drivers List */}
            <div className="bg-white border border-[#141414] p-6 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-mono opacity-50">Key Growth Drivers</h3>
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {data?.keyDrivers.map((driver, idx) => (
                  <div key={idx} className="border-b border-[#141414]/10 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{driver.factor}</span>
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase",
                        driver.impact === 'High' ? "bg-[#00FF00]/10 text-[#00FF00]" : 
                        driver.impact === 'Medium' ? "bg-[#F27D26]/10 text-[#F27D26]" : 
                        "bg-[#141414]/10 text-[#141414]"
                      )}>
                        {driver.impact} Impact
                      </span>
                    </div>
                    <p className="text-[10px] leading-tight opacity-70">{driver.description}</p>
                  </div>
                ))}
                {!data && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 bg-[#141414]/10 w-1/2" />
                    <div className="h-2 bg-[#141414]/10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#141414] p-8 text-center bg-white">
        <div className="max-w-xl mx-auto space-y-4">
          <p className="font-serif italic text-sm opacity-60">
            "The future of India's economy lies in its ability to innovate and integrate."
          </p>
          <div className="flex justify-center gap-8 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <span>Data Source: Gemini AI</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            <span>Region: South Asia</span>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
