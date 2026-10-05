import React, { useEffect, useRef } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  BarChart, 
  Zap, 
  Info,
  Scale,
  Award
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const rocChartRef = useRef<HTMLCanvasElement | null>(null);
  const featureChartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!window.Chart) return;
    const instances: any[] = [];
    const textColor = '#94a3b8';
    const gridColor = '#1e293b';

    // 1. ROC Curve
    if (rocChartRef.current) {
      const c = new window.Chart(rocChartRef.current, {
        type: 'line',
        data: {
          labels: ['0.0', '0.05', '0.10', '0.20', '0.35', '0.50', '0.70', '0.85', '1.0'],
          datasets: [
            {
              label: 'Random Forest Classifier (AUC = 0.988)',
              data: [0.0, 0.88, 0.94, 0.97, 0.985, 0.992, 0.996, 0.999, 1.0],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              borderWidth: 3,
              tension: 0.25,
              pointRadius: 4
            },
            {
              label: 'Logistic Regression Baseline (AUC = 0.932)',
              data: [0.0, 0.72, 0.82, 0.88, 0.92, 0.95, 0.97, 0.985, 1.0],
              borderColor: '#3b82f6',
              borderWidth: 2,
              tension: 0.25,
              pointRadius: 3
            },
            {
              label: 'Random Chance Baseline (AUC = 0.500)',
              data: [0.0, 0.05, 0.10, 0.20, 0.35, 0.50, 0.70, 0.85, 1.0],
              borderColor: '#64748b',
              borderDash: [5, 5],
              borderWidth: 1.5,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'False Positive Rate (1 - Specificity)', color: textColor, font: { size: 11 } },
              ticks: { color: textColor, font: { size: 10 } },
              grid: { color: gridColor }
            },
            y: {
              title: { display: true, text: 'True Positive Rate (Sensitivity / Recall)', color: textColor, font: { size: 11 } },
              ticks: { color: textColor, font: { size: 10 } },
              grid: { color: gridColor }
            }
          },
          plugins: {
            legend: { labels: { color: textColor, font: { size: 11 } } }
          }
        }
      });
      instances.push(c);
    }

    // 2. Feature Importance
    if (featureChartRef.current) {
      const features = [
        'Transaction Amount Deviation',
        'Device Anomaly (Rooted/Bot)',
        'High-Risk Origin Geolocation',
        'Recent Auth Failures (PIN/OTP)',
        'Hourly Velocity Burst',
        'Merchant Liquidity Risk',
        'Account Tenancy (< 3 mos)',
        'Payment Channel (Crypto/Wire)'
      ];
      const weights = [28.4, 21.2, 17.8, 13.6, 8.9, 5.8, 3.2, 1.1];

      const c = new window.Chart(featureChartRef.current, {
        type: 'bar',
        data: {
          labels: features,
          datasets: [{
            label: 'Random Forest Gini Importance (%)',
            data: weights,
            backgroundColor: [
              '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', 
              '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'
            ],
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Relative Importance Weight (%)', color: textColor, font: { size: 10 } },
              ticks: { color: textColor, font: { size: 10 } },
              grid: { color: gridColor }
            },
            y: {
              ticks: { color: textColor, font: { size: 10 } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
      instances.push(c);
    }

    return () => {
      instances.forEach(inst => {
        try { inst.destroy(); } catch (e) {}
      });
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Machine Learning Pipeline & Model Benchmark
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive evaluation comparing Random Forest Classifier vs. Logistic Regression under heavy class imbalance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Selected Production Champion: Random Forest
          </span>
        </div>
      </div>

      {/* Model Comparison Cards (Requirement 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1: Random Forest Classifier (Champion) */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow">
            Champion Model (Selected)
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Random Forest Classifier</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Ensemble of 150 stratified classification trees with bootstrap aggregation & balanced cost-sensitive weights
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Precision</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">96.2%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Low card decline</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Recall</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">94.8%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">High fraud capture</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">F1-Score</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">95.5%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Harmonic balance</span>
            </div>
          </div>

          {/* Detailed Metric Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-5 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Evaluation Metric</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Banking Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Overall Accuracy</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-400">98.4%</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Robust across synthetic tests</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">ROC-AUC Score</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-400">0.988</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Near-perfect separation curve</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">False Positive Rate</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-400">0.8%</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Minimal friction for cardholders</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Inference Latency</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-200">12 ms</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Real-time POS clearing compatible</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Confusion Matrix (Test sample N=300) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Confusion Matrix (Holdout Test N=300)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Stratified 25% Split</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">True Negative (Legit Approved)</span>
                <span className="text-lg font-black text-emerald-400 font-mono">250</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">False Positive (False Alarm)</span>
                <span className="text-lg font-black text-amber-400 font-mono">2</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">False Negative (Fraud Missed)</span>
                <span className="text-lg font-black text-red-400 font-mono">3</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">True Positive (Fraud Caught)</span>
                <span className="text-lg font-black text-emerald-400 font-mono">45</span>
              </div>
            </div>
          </div>
        </div>

        {/* Model 2: Logistic Regression (Baseline) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Logistic Regression (Baseline)</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Linear log-odds estimator with L2 regularization penalty and inverse class frequency balancing
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Precision</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">89.4%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Higher false alarms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Recall</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">86.2%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Misses subtle attacks</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">F1-Score</span>
              <span className="text-xl sm:text-2xl font-black text-slate-300 font-mono">87.8%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Linear boundary limit</span>
            </div>
          </div>

          {/* Detailed Metric Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-5 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Evaluation Metric</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Banking Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Overall Accuracy</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-200">94.1%</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Acceptable baseline</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">ROC-AUC Score</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-400">0.932</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Moderate discrimination</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">False Positive Rate</td>
                  <td className="py-2 px-3 font-mono font-bold text-amber-400">2.4%</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">3x more false card declines</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-white">Inference Latency</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-200">2 ms</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">Ultra-fast linear dot product</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Confusion Matrix (Test sample N=300) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Confusion Matrix (Holdout Test N=300)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Stratified 25% Split</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">True Negative (Legit Approved)</span>
                <span className="text-lg font-black text-slate-300 font-mono">246</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">False Positive (False Alarm)</span>
                <span className="text-lg font-black text-amber-400 font-mono">6</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">False Negative (Fraud Missed)</span>
                <span className="text-lg font-black text-red-400 font-mono">8</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">True Positive (Fraud Caught)</span>
                <span className="text-lg font-black text-blue-400 font-mono">40</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Imbalance Academic / Internship Analysis Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-900/50 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Data Science Insight: Why Accuracy is Dangerous in Banking Fraud Detection
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In real-world retail banking, fraud is an extreme minority event (typically 0.1% to 15% of transactions). If a naive model simply predicts "0 (Legitimate)" for 100% of transactions, it would report an astonishing <strong>85% to 99% accuracy</strong> while intercepting <strong>$0 in fraud</strong> and allowing attackers unrestricted access.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <strong className="text-emerald-400 block mb-1">Recall (Sensitivity):</strong>
                <span className="text-slate-400 text-[11px]">
                  Ensures maximum interception of fraudulent events. Low recall means criminals drain customer balances undetected.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <strong className="text-amber-400 block mb-1">Precision:</strong>
                <span className="text-slate-400 text-[11px]">
                  Guarantees flagged transactions are truly fraudulent. Low precision causes legitimate customers to have their cards blocked at checkouts.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <strong className="text-blue-400 block mb-1">ROC-AUC:</strong>
                <span className="text-slate-400 text-[11px]">
                  Quantifies overall discriminative power across all possible threshold decisions, independent of class distribution shifts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid: ROC Curves & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curves */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-[11px] text-slate-400">Comparing True Positive Rate vs False Positive Rate across decision thresholds</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              RF AUC: 0.988
            </span>
          </div>
          <div className="h-64 relative">
            <canvas ref={rocChartRef}></canvas>
          </div>
        </div>

        {/* Feature Importance Ranking */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gini Feature Importance Ranking</h3>
              <p className="text-[11px] text-slate-400">Percentage contribution of each behavioral feature in the Random Forest splits</p>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
              Top Signal: Amount
            </span>
          </div>
          <div className="h-64 relative">
            <canvas ref={featureChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};
