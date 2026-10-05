import React, { useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Percent, 
  Clock, 
  CreditCard,
  ArrowUpRight,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { Transaction } from '../data/initialTransactions';

// Declare Chart.js global window type
declare global {
  interface Window {
    Chart: any;
  }
}

interface DashboardViewProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToPrediction: () => void;
  onNavigateToLedger: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onSelectTransaction,
  onNavigateToPrediction,
  onNavigateToLedger
}) => {
  // Chart canvas refs
  const ratioChartRef = useRef<HTMLCanvasElement | null>(null);
  const typeChartRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartRef = useRef<HTMLCanvasElement | null>(null);
  const amountChartRef = useRef<HTMLCanvasElement | null>(null);
  const locationChartRef = useRef<HTMLCanvasElement | null>(null);
  const riskDistChartRef = useRef<HTMLCanvasElement | null>(null);

  // Stats calculation
  const totalCount = transactions.length;
  const legitCount = transactions.filter(t => t.prediction === 'Legitimate').length;
  const fraudCount = transactions.filter(t => t.prediction === 'Fraudulent').length;
  const susCount = transactions.filter(t => t.prediction === 'Suspicious').length;
  
  const highRiskCount = transactions.filter(t => t.riskScore >= 70).length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
  const fraudRate = totalCount > 0 ? (fraudCount / totalCount) * 100 : 0;

  // Recent high risk queue
  const recentHighRisk = [...transactions]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  useEffect(() => {
    if (!window.Chart) return;

    const chartInstances: any[] = [];

    // Helper default styling
    const textColor = '#94a3b8';
    const gridColor = '#1e293b';

    // 1. Ratio Chart (Doughnut)
    if (ratioChartRef.current) {
      const c = new window.Chart(ratioChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Legitimate', 'Fraudulent', 'Suspicious'],
          datasets: [{
            data: [legitCount, fraudCount, susCount],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#0f172a'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 11 } }
            }
          },
          cutout: '70%'
        }
      });
      chartInstances.push(c);
    }

    // 2. Fraud by Transaction Type (Bar)
    if (typeChartRef.current) {
      const types = ['Online Checkout', 'Wire Transfer', 'ATM Withdrawal', 'POS Swipe', 'Mobile Banking', 'Crypto Exchange'];
      const legitByType = types.map(tp => transactions.filter(t => t.transactionType === tp && t.prediction !== 'Fraudulent').length);
      const fraudByType = types.map(tp => transactions.filter(t => t.transactionType === tp && t.prediction === 'Fraudulent').length);

      const c = new window.Chart(typeChartRef.current, {
        type: 'bar',
        data: {
          labels: types.map(t => t.replace(' Checkout', '').replace(' Withdrawal', '').replace(' Swipe', '')),
          datasets: [
            { label: 'Legitimate / Sus', data: legitByType, backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: 'Fraudulent', data: fraudByType, backgroundColor: '#ef4444', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
          },
          plugins: {
            legend: { position: 'top', labels: { color: textColor, font: { size: 10 } } }
          }
        }
      });
      chartInstances.push(c);
    }

    // 3. Fraud Trend Over Time (Line)
    if (trendChartRef.current) {
      const c = new window.Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
          datasets: [
            {
              label: 'Fraud Infiltration Volume',
              data: [18, 26, 12, 14, 21, 32, 28],
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3
            },
            {
              label: 'Legitimate Baseline (x10)',
              data: [35, 15, 65, 88, 92, 85, 45],
              borderColor: '#3b82f6',
              borderDash: [4, 4],
              borderWidth: 1.5,
              tension: 0.35,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
          },
          plugins: {
            legend: { labels: { color: textColor, font: { size: 10 } } }
          }
        }
      });
      chartInstances.push(c);
    }

    // 4. Transaction Amount Distribution (Histogram)
    if (amountChartRef.current) {
      const buckets = ['$0-100', '$101-500', '$501-1.5k', '$1.5k-4k', '$4k-10k+'];
      const fraudBuckets = [
        transactions.filter(t => t.amount <= 100 && t.prediction === 'Fraudulent').length,
        transactions.filter(t => t.amount > 100 && t.amount <= 500 && t.prediction === 'Fraudulent').length,
        transactions.filter(t => t.amount > 500 && t.amount <= 1500 && t.prediction === 'Fraudulent').length,
        transactions.filter(t => t.amount > 1500 && t.amount <= 4000 && t.prediction === 'Fraudulent').length,
        transactions.filter(t => t.amount > 4000 && t.prediction === 'Fraudulent').length,
      ];
      const legitBuckets = [
        transactions.filter(t => t.amount <= 100 && t.prediction !== 'Fraudulent').length,
        transactions.filter(t => t.amount > 100 && t.amount <= 500 && t.prediction !== 'Fraudulent').length,
        transactions.filter(t => t.amount > 500 && t.amount <= 1500 && t.prediction !== 'Fraudulent').length,
        transactions.filter(t => t.amount > 1500 && t.amount <= 4000 && t.prediction !== 'Fraudulent').length,
        transactions.filter(t => t.amount > 4000 && t.prediction !== 'Fraudulent').length,
      ];

      const c = new window.Chart(amountChartRef.current, {
        type: 'bar',
        data: {
          labels: buckets,
          datasets: [
            { label: 'Legitimate', data: legitBuckets, backgroundColor: '#10b981', borderRadius: 4 },
            { label: 'Fraudulent', data: fraudBuckets, backgroundColor: '#ef4444', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
          },
          plugins: {
            legend: { position: 'top', labels: { color: textColor, font: { size: 10 } } }
          }
        }
      });
      chartInstances.push(c);
    }

    // 5. Fraud by Location
    if (locationChartRef.current) {
      const topLocs = ['Proxy/VPN', 'Lagos, NG', 'Moscow, RU', 'New York', 'London', 'Toronto'];
      const fraudLocCounts = [28, 22, 19, 8, 5, 4];
      const c = new window.Chart(locationChartRef.current, {
        type: 'bar',
        data: {
          labels: topLocs,
          datasets: [{
            label: 'Intercepted Fraud Instances',
            data: fraudLocCounts,
            backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981'],
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
      chartInstances.push(c);
    }

    // 6. Risk Score Distribution (Histogram)
    if (riskDistChartRef.current) {
      const riskBuckets = ['0-20 (Minimal)', '21-40 (Low)', '41-60 (Moderate)', '61-80 (Elevated)', '81-100 (Critical)'];
      const counts = [
        transactions.filter(t => t.riskScore <= 20).length,
        transactions.filter(t => t.riskScore > 20 && t.riskScore <= 40).length,
        transactions.filter(t => t.riskScore > 40 && t.riskScore <= 60).length,
        transactions.filter(t => t.riskScore > 60 && t.riskScore <= 80).length,
        transactions.filter(t => t.riskScore > 80).length,
      ];

      const c = new window.Chart(riskDistChartRef.current, {
        type: 'bar',
        data: {
          labels: riskBuckets,
          datasets: [{
            label: 'Transaction Count',
            data: counts,
            backgroundColor: ['#10b981', '#34d399', '#f59e0b', '#f97316', '#ef4444'],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
      chartInstances.push(c);
    }

    return () => {
      chartInstances.forEach(inst => {
        try {
          inst.destroy();
        } catch (e) {
          // ignore cleanup
        }
      });
    };
  }, [transactions, legitCount, fraudCount, susCount]);

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Banking Risk Telemetry Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time machine learning fraud detection surveillance & behavioral anomaly monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPrediction}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-900/30"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Analyze New Transaction
          </button>
          <button
            onClick={onNavigateToLedger}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            View Full Ledger
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transactions */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +8.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Live Ingested & Evaluated</span>
        </div>

        {/* Legitimate Transactions */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Legitimate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {legitCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">
              ({totalCount > 0 ? ((legitCount / totalCount) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-emerald-500 mt-1 block">Auto-Approved / Zero Friction</span>
        </div>

        {/* Fraudulent Flagged */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-red-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Fraudulent Flagged</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight">
              {fraudCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-red-400 font-semibold">High Risk</span>
          </div>
          <span className="text-[11px] text-red-400/80 mt-1 block">Settlement Intercepted</span>
        </div>

        {/* Suspicious in Review */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Suspicious Cases</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {susCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-400">Risk 35-69</span>
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Step-Up 2FA Challenge</span>
        </div>

        {/* Fraud Detection Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraud Detection Rate</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {fraudRate.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-400">of portfolio</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Within expected banking bound</span>
        </div>

        {/* Total Transaction Volume */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Volume Monitored</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              ${(totalAmount / 1000).toFixed(1)}k
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active settlement window</span>
        </div>

        {/* Average Transaction Amount */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Tx Amount</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              ${avgAmount.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mean ticket across channels</span>
        </div>

        {/* High Risk Transactions */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight">
              {highRiskCount}
            </span>
            <span className="text-[11px] text-slate-400">Score ≥ 70</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Surveillance triage queue</span>
        </div>
      </div>

      {/* Visualizations Grid (6 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Fraud vs Legitimate (Doughnut) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fraud vs. Legitimate Ratio</h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Binary Class</span>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <canvas ref={ratioChartRef}></canvas>
          </div>
        </div>

        {/* 2. Fraud by Transaction Type (Bar) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fraud by Payment Channel</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">Channel Risk</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={typeChartRef}></canvas>
          </div>
        </div>

        {/* 3. Fraud Velocity Trend Over Time (Line) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fraud Trend Over Time</h3>
            <span className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded">Hourly Velocity</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* 4. Transaction Amount Distribution (Histogram) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Amount Distribution</h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Tier Slices</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={amountChartRef}></canvas>
          </div>
        </div>

        {/* 5. Fraud by Location (Bar) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fraud by Geolocation / IP</h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">Cross-Border</span>
          </div>
          <div className="h-56 relative">
            <canvas ref={locationChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* 6. Risk Score Distribution (Full Width) */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Score Spectrum (0 to 100)</h3>
            <p className="text-[11px] text-slate-400">Distribution of machine-learning calibrated risk scores across the active banking stream</p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Random Forest Inference</span>
        </div>
        <div className="h-44 relative mt-2">
          <canvas ref={riskDistChartRef}></canvas>
        </div>
      </div>

      {/* High-Risk Live Review Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Priority High-Risk Incident Queue</h3>
          </div>
          <button
            onClick={onNavigateToLedger}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
          >
            Open Transaction Ledger <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Channel</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">ML Prediction</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {recentHighRisk.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-mono font-medium text-blue-400">
                    {tx.transactionId}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">
                    {tx.customerId}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${tx.riskScore >= 70 ? 'bg-red-500' : tx.riskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${tx.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-red-400">{tx.riskScore}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                      FRAUDULENT
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => onSelectTransaction(tx)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 transition"
                    >
                      <Eye className="w-3 h-3 text-blue-400" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
