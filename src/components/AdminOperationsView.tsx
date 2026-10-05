import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  ShieldCheck, 
  UploadCloud, 
  Users, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertOctagon,
  RefreshCw,
  Eye,
  Lock,
  PhoneCall,
  SlidersHorizontal
} from 'lucide-react';
import { Transaction } from '../data/initialTransactions';

interface AdminOperationsViewProps {
  transactions: Transaction[];
  onOpenUpload: () => void;
  onUpdateStatus: (txId: string, status: Transaction['status']) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const AdminOperationsView: React.FC<AdminOperationsViewProps> = ({
  transactions,
  onOpenUpload,
  onUpdateStatus,
  onSelectTransaction
}) => {
  const [threshold, setThreshold] = useState<number>(70);
  const [analystFilter, setAnalystFilter] = useState<'all' | 'flagged' | 'pending'>('all');

  const highRiskQueue = transactions.filter((t) => {
    if (analystFilter === 'flagged') return t.status === 'Flagged';
    if (analystFilter === 'pending') return t.status === 'Pending Review';
    return t.riskScore >= threshold;
  });

  const staffPersonnel = [
    { name: 'Sarah Connor', role: 'Lead Fraud Analyst', email: 'analyst@sentrabank.com', clearance: 'Level 4 (Direct Card Freeze)', activeCases: 14 },
    { name: 'Marcus Vance', role: 'Risk Operations VP', email: 'manager@sentrabank.com', clearance: 'Level 5 (Threshold Policy)', activeCases: 6 },
    { name: 'Elena Rostova', role: 'Compliance Auditor', email: 'auditor@sentrabank.com', clearance: 'Level 3 (Read & Audit)', activeCases: 2 },
    { name: 'David Chen', role: 'Junior Fraud Analyst', email: 'dchen@sentrabank.com', clearance: 'Level 2 (Triage Only)', activeCases: 22 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-400" />
            Fraud Operations & Surveillance Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            High-risk case adjudication, ML sensitivity threshold controls, and analyst team management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-900/30"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Ingest New CSV Batch
          </button>
        </div>
      </div>

      {/* Control Strip: ML Threshold & Triage Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ML Sensitivity Slider */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Automated Fraud Flagging Cutoff Threshold
              </span>
            </div>
            <span className="font-mono text-sm font-black text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
              Risk Score ≥ {threshold}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Lowering the threshold intercepts more subtle attacks at the cost of slight customer friction. Raising it focuses exclusively on blatant critical anomalies.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-mono">Sensitive (50)</span>
            <input
              type="range"
              min="50"
              max="90"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-500 font-mono">Conservative (90)</span>
          </div>
        </div>

        {/* Batch CSV Ingestion Shortcut */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Batch CSV Pipeline
            </span>
            <p className="text-[11px] text-slate-400">
              Drop any transaction CSV to trigger Pandas preprocessing, missing value imputation, and batch ML scoring.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Launch Batch Upload Wizard
          </button>
        </div>
      </div>

      {/* Urgent High-Risk Adjudication Queue */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-sm font-bold text-white">High-Risk Case Adjudication Queue</h2>
              <p className="text-[11px] text-slate-400">
                {highRiskQueue.length} transactions requiring immediate analyst adjudication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setAnalystFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                analystFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Alerts ({highRiskQueue.length})
            </button>
            <button
              onClick={() => setAnalystFilter('flagged')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                analystFilter === 'flagged'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Flagged Only
            </button>
            <button
              onClick={() => setAnalystFilter('pending')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                analystFilter === 'pending'
                  ? 'bg-amber-600 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pending Review
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Channel / Merchant</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-center">Analyst Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {highRiskQueue.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">
                    {tx.transactionId}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {tx.customerId}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white block font-medium">{tx.transactionType}</span>
                    <span className="text-slate-400 text-[11px] block">{tx.merchantCategory}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-red-400 text-sm">
                        {tx.riskScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/ 100</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'Blocked'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : tx.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onUpdateStatus(tx.transactionId, 'Blocked')}
                        className="px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-[11px] font-bold transition"
                        title="Halt funds & freeze digital card"
                      >
                        Block Card
                      </button>
                      <button
                        onClick={() => onUpdateStatus(tx.transactionId, 'Verified')}
                        className="px-2 py-1 bg-amber-500/80 hover:bg-amber-500 text-slate-950 rounded text-[11px] font-bold transition"
                        title="Dispatch out-of-band SMS OTP"
                      >
                        Request 2FA
                      </button>
                      <button
                        onClick={() => onUpdateStatus(tx.transactionId, 'Approved')}
                        className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-[11px] font-bold transition"
                        title="Mark as False Alarm & Clear"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Inspect full forensics"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Operations Personnel Roster */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Active Security Analyst Staff & Access Clearances</h2>
          </div>
          <span className="text-xs text-slate-500">RBAC Security Level: Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {staffPersonnel.map((person, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{person.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-blue-400 text-[11px] block">{person.role}</span>
              <span className="font-mono text-slate-500 text-[10px] block">{person.email}</span>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>{person.clearance}</span>
                <span className="font-mono text-amber-400">{person.activeCases} active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
