/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDietStore } from '../store/dietStore';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { 
  LineChart as LucideLineChart, TrendingUp, Sparkles, Droplets, HeartPulse, 
  Cpu, RotateCw, Database, DollarSign, List, ArrowDownUp, CheckCircle, 
  AlertTriangle, Eye, ShieldAlert, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { mealPhases } from '../data/protocol';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export const Insights: React.FC = () => {
  const {
    dailyLogs,
    calculateScoresForDate,
    onboarding
  } = useDietStore();

  const [selectedMetric, setSelectedMetric] = useState<'compliance' | 'protein' | 'iron' | 'hydration' | 'hairScore'>('compliance');
  const [activeModule, setActiveModule] = useState<'biometrics' | 'aiTelemetry'>('biometrics');
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchTelemetryLogs = async () => {
    setLoadingTelemetry(true);
    try {
      const logsCol = collection(db, 'geminiLogs');
      const q = query(logsCol, orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const logs: any[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setTelemetryLogs(logs);
    } catch (err) {
      console.error('Failed to fetch telemetry logs from Firebase:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    if (activeModule === 'aiTelemetry') {
      fetchTelemetryLogs();
    }
  }, [activeModule]);

  // Compute live cumulative totals
  const totalQueries = telemetryLogs.length;
  const cumulativePromptTokens = telemetryLogs.reduce((acc, log) => acc + (log.promptTokens || 0), 0);
  const cumulativeCandidatesTokens = telemetryLogs.reduce((acc, log) => acc + (log.candidatesTokens || 0), 0);
  const cumulativeTotalTokens = telemetryLogs.reduce((acc, log) => acc + (log.totalTokens || 0), 0);
  const cumulativeCostUSD = telemetryLogs.reduce((acc, log) => acc + (log.estimatedCost || 0), 0);
  const cumulativeCostINR = cumulativeCostUSD * 83.5;

  // Compile dates sorted
  const sortedDates = Object.keys(dailyLogs).sort();

  // Compile structured chart data
  const chartData = sortedDates.map((dateStr) => {
    const scores = calculateScoresForDate(dateStr);
    const dLog = dailyLogs[dateStr] || { waterIntake: 0 };
    
    // Calculate actual nutrients consumed
    let actualProtein = 0;
    let actualIron = 0;
    mealPhases.forEach(phase => {
      const pLog = dLog.meals[phase.id];
      if (pLog && pLog.completed) {
        const mealId = pLog.replacedWithId || phase.options[0].id;
        const mealOpt = phase.options.find(o => o.id === mealId) || phase.options[0];
        actualProtein += mealOpt.nutrition.protein;
        actualIron += mealOpt.nutrition.iron;
      }
    });

    // Label formatting (e.g. "Jun 8")
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    return {
      date: formattedDate,
      rawDate: dateStr,
      compliance: scores.dailyScore,
      protein: actualProtein,
      iron: actualIron,
      hydration: dLog.waterIntake,
      hairScore: scores.hairHealthCompliance
    };
  });

  const getMetricMetadata = () => {
    switch (selectedMetric) {
      case 'compliance': return {
        title: 'Daily Compliance Score',
        color: '#0057FF', // Electric blue
        bg: '#E0DCFF',
        targetLabel: 'Target Benchmark: 80',
        target: 80,
        unit: '%'
      };
      case 'protein': return {
        title: 'Daily Protein Consumption',
        color: '#4F46E5', // Indigo
        bg: '#EEF2FF',
        targetLabel: `Onboarding Target: ${onboarding?.weight ? Math.round(onboarding.weight * 1.5) : 85}g`,
        target: onboarding?.weight ? Math.round(onboarding.weight * 1.5) : 85,
        unit: 'g'
      };
      case 'iron': return {
        title: 'Iron Accumulation Index',
        color: '#FF7A00', // Warning orange
        bg: '#FFE2CC',
        targetLabel: 'Clinical target: 15mg',
        target: 15,
        unit: 'mg'
      };
      case 'hydration': return {
        title: 'Hydration Intake Volume',
        color: '#0EA5E9', // Sky blue
        bg: '#E0F2FE',
        targetLabel: `Hydration Cap: ${onboarding?.waterIntakeTarget || 3000}ml`,
        target: onboarding?.waterIntakeTarget || 3000,
        unit: 'ml'
      };
      case 'hairScore': return {
        title: 'Hair Health Score',
        color: '#FFB703', // Yellow Amber
        bg: '#FDF0A6',
        targetLabel: 'Rejuvenation Target: 85',
        target: 85,
        unit: '%'
      };
    }
  };

  const meta = getMetricMetadata();

  return (
    <div id="insights-root" className="space-y-6 pb-28 font-sans text-black dark:text-white">
      {/* Dynamic Module Navigation Tabs */}
      <div className="flex gap-3 bg-[#FFFDF7] dark:bg-[#1E293B] p-2 border-4 border-black dark:border-[#475569] rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#000000]">
        <button
          onClick={() => setActiveModule('biometrics')}
          className={`flex-1 py-3 px-4 rounded-[18px] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeModule === 'biometrics'
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white pb-3'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Biometric Progress
        </button>
        <button
          onClick={() => setActiveModule('aiTelemetry')}
          className={`flex-1 py-3 px-4 rounded-[18px] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeModule === 'aiTelemetry'
              ? 'bg-[#E22765] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white pb-3'
          }`}
        >
          <Cpu className="w-4 h-4" /> AI Costs Telemetry
        </button>
      </div>

      {activeModule === 'biometrics' ? (
        <div className="space-y-6">
          {/* Selector switches */}
          <div className="bg-[#FFFDF7] dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-3 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-5 gap-1 text-center font-bold text-[10px] uppercase">
            <button
              onClick={() => setSelectedMetric('compliance')}
              className={`py-2 px-1 text-center rounded-xl cursor-pointer ${selectedMetric === 'compliance' ? 'bg-[#0057FF] text-white border-2 border-black font-black' : 'text-gray-500'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedMetric('protein')}
              className={`py-2 px-1 text-center rounded-xl cursor-pointer ${selectedMetric === 'protein' ? 'bg-[#4F46E5] text-white border-2 border-black font-black' : 'text-gray-500'}`}
            >
              Protein
            </button>
            <button
              onClick={() => setSelectedMetric('iron')}
              className={`py-2 px-1 text-center rounded-xl cursor-pointer ${selectedMetric === 'iron' ? 'bg-[#FF7A00] text-black border-2 border-black font-black' : 'text-gray-500'}`}
            >
              Iron
            </button>
            <button
              onClick={() => setSelectedMetric('hydration')}
              className={`py-2 px-1 text-center rounded-xl cursor-pointer ${selectedMetric === 'hydration' ? 'bg-[#0EA5E9] text-white border-2 border-black font-black' : 'text-gray-500'}`}
            >
              Water
            </button>
            <button
              onClick={() => setSelectedMetric('hairScore')}
              className={`py-2 px-1 text-center rounded-xl cursor-pointer ${selectedMetric === 'hairScore' ? 'bg-[#FFB703] text-black border-2 border-black font-black' : 'text-gray-500'}`}
            >
              Scalp
            </button>
          </div>

          {/* Dynamic Summary Card */}
          <div className="border-4 border-black rounded-[24px] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black" style={{ backgroundColor: meta.bg }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">FOLLICLE INTENSITY METRIC</span>
            <h2 className="text-xl font-black uppercase tracking-tight leading-none mt-1 mb-1">{meta.title}</h2>
            <span className="text-xs font-bold font-mono border-2 border-black bg-white px-2 py-0.5 rounded-md inline-block mt-1">
              {meta.targetLabel}
            </span>
          </div>

          {/* The Recharts Graphical container */}
          <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-4 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-64 mt-2">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center font-bold text-xs uppercase tracking-wider text-gray-500">
                  Complete daily logging tasks to populate charts
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={meta.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={meta.color} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#FFFDF7',
                        border: '3px solid #000000',
                        borderRadius: '16px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#000000'
                      }}
                      cursor={{ stroke: '#000000', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke={meta.color} 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#chartColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Advanced diagnostics panel below graph */}
          <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-4 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-5 h-5 text-[#0057FF]" /> Diagnostic Synthesis
            </h4>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
              {selectedMetric === 'compliance' && 'A sustained compliance score of over 80 ensures steady keratin flow, protecting expanding follicle cells from anagen-interruption stress.'}
              {selectedMetric === 'protein' && `Your protein target helps sustain keratinization. If you fall below ${meta.target}g/day, cellular rebuilding shifts energy focus away from hair roots.`}
              {selectedMetric === 'iron' && 'Iron is primary to hemoglobin function, ensuring oxygen reaches the follicle matrix. High values reduce the chances of sudden telogen fallout.'}
              {selectedMetric === 'hydration' && 'Optimal hydration volume regulates sebum thickness at the dermis level, reducing dandruff flaking and keeping hair roots resilient.'}
              {selectedMetric === 'hairScore' && 'This composite index represents micronutrients (Biotin, Zinc, and Vitamin D) crucial for structural hair shaft resistance.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cost Cumulative Statistics Block */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#FFF1EE] dark:bg-[#341F24] border-4 border-black dark:border-[#475569] p-4 rounded-[20px] shadow-[4px_4px_0px_0px_#000000]">
              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 block tracking-wider">Estimated Cost</span>
              <p className="text-lg font-black mt-1 text-[#E22765] dark:text-[#FB7185] leading-none">
                ${cumulativeCostUSD.toFixed(6)}
              </p>
              <p className="text-[10px] font-mono font-bold text-gray-500 mt-1">
                ≈ ₹{cumulativeCostINR.toFixed(4)}
              </p>
            </div>

            <div className="bg-[#E0FBF9] dark:bg-[#1D323E] border-4 border-black dark:border-[#475569] p-4 rounded-[20px] shadow-[4px_4px_0px_0px_#000000]">
              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 block tracking-wider">Tokens Consumed</span>
              <p className="text-xl font-black mt-1 text-[#00C2B8] leading-none">
                {cumulativeTotalTokens.toLocaleString()}
              </p>
              <div className="text-[9px] font-mono text-gray-400 hover:text-black dark:text-gray-400 font-bold mt-1.5 flex justify-between">
                <span>In: {cumulativePromptTokens}</span>
                <span>Out: {cumulativeCandidatesTokens}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#E0DCFF] dark:bg-[#1C203E] border-4 border-black dark:border-[#475569] p-4 rounded-[20px] shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 block tracking-wider">Queries Logged</span>
                <p className="text-xl font-black mt-1 text-[#4F46E5] dark:text-[#818CF8] leading-none">
                  {totalQueries} API Runs
                </p>
              </div>
              <button 
                onClick={fetchTelemetryLogs}
                disabled={loadingTelemetry}
                className="w-full mt-2.5 py-1 px-2.5 bg-white dark:bg-[#1B1B1B] border-2 border-black dark:border-[#475569] text-[9px] font-black uppercase flex items-center justify-center gap-1.5 h-6 cursor-pointer transition-all active:translate-y-0.5 rounded-lg text-black dark:text-zinc-200"
              >
                <RotateCw className={`w-3 h-3 ${loadingTelemetry ? 'animate-spin' : ''}`} />
                {loadingTelemetry ? "Loading" : "Refresh CRM Logs"}
              </button>
            </div>
          </div>

          {/* Core Telemetry Engine Table Console */}
          <div className="bg-white dark:bg-[#1E293B] border-4 border-black dark:border-[#475569] rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b-4 border-black dark:border-[#475569] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#E22765]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-black dark:text-white">Active Gemini telemetry stream</h3>
              </div>
              <span className="text-[9px] font-mono bg-[#E22765]/10 text-[#E22765] border-2 border-[#E22765] px-2.5 py-1 font-black rounded-lg uppercase">
                Model: Gemini 2.5 Flash
              </span>
            </div>

            {telemetryLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-bold uppercase text-xs tracking-wider space-y-3">
                <p>No telemetry logged in Firestore yet.</p>
                <p className="text-[10px] text-gray-400 font-medium">Interact with Copilots or perform diagnostics to capture active token usage metrics.</p>
              </div>
            ) : (
              <div className="p-1.5 divide-y border-0 divide-gray-150 dark:divide-gray-600">
                {telemetryLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const logDate = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  return (
                    <div key={log.id} className="p-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 cursor-pointer" onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">{logDate}</span>
                            <h4 className="font-black text-xs uppercase text-slate-800 dark:text-[#F8FAFC]">
                              {log.process}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
                            <span>Tokens: <strong>{log.totalTokens}</strong></span>
                            <span>•</span>
                            <span>Model: <strong>{log.model}</strong></span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {log.status === 'success' ? 'Live API' : 'Fallback'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 dark:text-[#F8FAFC] block leading-none">
                              ${(log.estimatedCost || 0).toFixed(6)}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-gray-400">
                              ≈ ₹{((log.estimatedCost || 0) * 83.5).toFixed(4)}
                            </span>
                          </div>
                          
                          <button className="text-gray-400 hover:text-[#E22765] p-1 cursor-pointer">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable JSON details of actual request & response */}
                      {isExpanded && (
                        <div className="mt-3 bg-slate-900 text-[#00FF66] p-3 rounded-lg border-2 border-black font-mono text-[10px] leading-relaxed relative overflow-x-auto max-h-80 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.5)]">
                          <span className="absolute top-2 right-2 text-[8px] uppercase bg-black text-gray-500 font-bold px-1.5 py-0.5 rounded">
                            Telemetry payload block
                          </span>
                          <div>
                            <span className="text-[#FFB703] font-bold block mb-1">PROMPT SENT (PREVIEW):</span>
                            <p className="text-gray-300 whitespace-pre-wrap break-words border-b border-gray-800 pb-2 mb-2">
                              {log.prompt || "(Empty prompt)"}
                            </p>
                          </div>
                          <div className="mt-2 text-[#00E5FF]">
                            <span className="text-indigo-400 font-bold block mb-1">GENERATED MODEL RESPONSE:</span>
                            <p className="whitespace-pre-wrap break-words">
                              {log.response || "(Empty response)"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Telemetry Cost Strategy Card */}
          <div className="bg-[#FFFDF7] dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-4 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wide flex items-center gap-1.5 text-[#E22765]">
              <ShieldAlert className="w-4 h-4" /> Developer Estimation Note
            </h4>
            <p className="text-[10px] font-semibold text-gray-500 leading-relaxed dark:text-zinc-300">
              Pricing calculated dynamically based on stable live Google Gemini platform parameters. Input (prompt) queries cost <strong>$0.075 / 1,000,000 tokens</strong> and output (candidate) generations cost <strong>$0.30 / 1,000,000 tokens</strong>. Local Fallback simulations record zero-token values.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
