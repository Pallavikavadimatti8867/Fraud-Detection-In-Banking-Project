import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Clock,
  MapPin,
  Smartphone,
  Store,
  DollarSign
} from 'lucide-react';
import { Transaction } from '../data/initialTransactions';

interface TransactionsViewProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  selectedTransaction: Transaction | null;
  onCloseDetailModal: () => void;
  onUpdateStatus?: (txId: string, status: Transaction['status']) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onSelectTransaction,
  selectedTransaction,
  onCloseDetailModal,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'transactionTime' | 'amount' | 'riskScore'>('transactionTime');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        searchTerm === '' ||
        tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.merchantCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || tx.prediction.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === 'all' || tx.transactionType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'transactionTime') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'transactionTime' | 'amount' | 'riskScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportFilteredCSV = () => {
    const headers = [
      'Transaction ID',
      'Customer ID',
      'Amount',
      'Type',
      'Date/Time',
      'Location',
      'Merchant Category',
      'Device Type',
      'Prediction',
      'Fraud Probability',
      'Risk Score',
      'Risk Level',
      'Status'
    ];

    const rows = filteredTransactions.map((t) => [
      t.transactionId,
      t.customerId,
      t.amount,
      t.transactionType,
      t.transactionTime,
      `"${t.location}"`,
      `"${t.merchantCategory}"`,
      `"${t.deviceType}"`,
      t.prediction,
      t.fraudProbability,
      t.riskScore,
      t.riskLevel,
      t.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `banking_transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Table className="w-6 h-6 text-blue-400" />
            Transaction Surveillance Ledger & Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying {filteredTransactions.length} of {transactions.length} total banking transactions with machine-learning risk predictions
          </p>
        </div>

        <button
          onClick={exportFilteredCSV}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          Export Ledger CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Transaction ID, Customer, Location, Merchant..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-blue-500"
          >
            <option value="all">All Predictions</option>
            <option value="legitimate">Legitimate Only</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="fraudulent">Fraudulent Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-blue-500"
          >
            <option value="all">All Payment Channels</option>
            <option value="Online Checkout">Online Checkout</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="ATM Withdrawal">ATM Withdrawal</option>
            <option value="POS Swipe">POS Swipe</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Crypto Exchange">Crypto Exchange</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-blue-500 font-mono"
          >
            <option value={10}>10 / page</option>
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer ID</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Channel / Type</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => toggleSort('transactionTime')}
                >
                  <div className="flex items-center gap-1">
                    Timestamp <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => toggleSort('riskScore')}
                >
                  <div className="flex items-center gap-1">
                    Risk Score <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => onSelectTransaction(tx)}
                  >
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
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {tx.transactionTime}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              tx.riskScore >= 70
                                ? 'bg-red-500'
                                : tx.riskScore >= 35
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${tx.riskScore}%` }}
                          ></div>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            tx.riskScore >= 70
                              ? 'text-red-400'
                              : tx.riskScore >= 35
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {tx.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {tx.prediction === 'Fraudulent' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/30">
                          FRAUDULENT
                        </span>
                      ) : tx.prediction === 'Suspicious' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          SUSPICIOUS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          LEGITIMATE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold ${
                          tx.riskLevel === 'High'
                            ? 'text-red-400'
                            : tx.riskLevel === 'Medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {tx.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-400">{tx.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition"
                        title="Inspect transaction forensic record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                    No transactions matched your current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-white font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Deep Dive Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Forensic Transaction Audit
                </span>
                <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                  {selectedTransaction.transactionId}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedTransaction.riskLevel === 'High'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : selectedTransaction.riskLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {selectedTransaction.prediction}
                  </span>
                </h3>
              </div>
              <button
                onClick={onCloseDetailModal}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Key Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Amount</span>
                <span className="text-white font-bold font-mono text-sm">
                  ${selectedTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Customer Account</span>
                <span className="text-blue-400 font-bold font-mono">
                  {selectedTransaction.customerId}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Risk Score</span>
                <span className="text-amber-400 font-bold font-mono text-sm">
                  {selectedTransaction.riskScore} / 100
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Channel</span>
                <span className="text-slate-200">{selectedTransaction.transactionType}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Merchant</span>
                <span className="text-slate-200">{selectedTransaction.merchantCategory}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Device</span>
                <span className="text-slate-200 truncate block">{selectedTransaction.deviceType}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">IP / Geolocation</span>
                <span className="text-slate-200">{selectedTransaction.location}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Timestamp</span>
                <span className="text-slate-400 font-mono text-[11px]">{selectedTransaction.transactionTime}</span>
              </div>
            </div>

            {/* Contributing Risk Factors */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ML Contributing Risk Signals:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedTransaction.riskFactors?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>{f}</span>
                  </li>
                )) || <li>Normal historical transactional parameters.</li>}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus?.(selectedTransaction.transactionId, 'Blocked');
                    alert(`Transaction ${selectedTransaction.transactionId} marked as BLOCKED and card frozen.`);
                    onCloseDetailModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                >
                  Block & Freeze
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus?.(selectedTransaction.transactionId, 'Verified');
                    alert(`Step-up SMS OTP challenge dispatched to Customer ${selectedTransaction.customerId}.`);
                    onCloseDetailModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition"
                >
                  Request 2FA
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus?.(selectedTransaction.transactionId, 'Approved');
                    alert(`Transaction ${selectedTransaction.transactionId} cleared and approved.`);
                    onCloseDetailModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Clear / Approve
                </button>
              </div>
              <button
                onClick={onCloseDetailModal}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
