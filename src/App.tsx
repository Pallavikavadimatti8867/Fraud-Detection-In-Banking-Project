import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { PredictionView } from './components/PredictionView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { AdminOperationsView } from './components/AdminOperationsView';
import { VsCodeHubView } from './components/VsCodeHubView';
import { CsvUploadModal } from './components/CsvUploadModal';
import { generateInitialTransactions, Transaction } from './data/initialTransactions';
import { generateProjectZip } from './utils/projectZipGenerator';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>({
    name: 'Sarah Connor',
    role: 'Lead Fraud Analyst',
    email: 'analyst@sentrabank.com'
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Transactions State (Initialized with 160 realistic synthetic banking records)
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    generateInitialTransactions(160)
  );

  // Inspector & Modal State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add single transaction from manual inference
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Transaction ${newTx.transactionId} evaluated and saved to active ledger.`);
  };

  // Add batch transactions from CSV
  const handleBatchTransactionsAdded = (newBatch: Transaction[]) => {
    setTransactions((prev) => [...newBatch, ...prev]);
    showToast(`Batch of ${newBatch.length} transactions processed and integrated.`);
  };

  // Update transaction status (Adjudication)
  const handleUpdateStatus = (txId: string, status: Transaction['status']) => {
    setTransactions((prev) =>
      prev.map((t) => (t.transactionId === txId ? { ...t, status } : t))
    );
    showToast(`Transaction ${txId} status changed to ${status.toUpperCase()}.`);
  };

  // Download complete project .ZIP
  const handleDownloadProjectZip = async () => {
    try {
      setIsDownloadingZip(true);
      const zipBlob = await generateProjectZip(transactions);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fraud_detection_banking.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Project zip bundled successfully! Open and run in VS Code.');
    } catch (err: any) {
      alert(`Failed to package ZIP: ${err.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onDownloadProjectZip={handleDownloadProjectZip}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        isDownloadingZip={isDownloadingZip}
      />

      {/* Body Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
            onNavigateToPrediction={() => setActiveTab('prediction')}
            onNavigateToLedger={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'prediction' && (
          <PredictionView onAddTransaction={handleAddTransaction} />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
            selectedTransaction={selectedTransaction}
            onCloseDetailModal={() => setSelectedTransaction(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'reports' && <ReportsView transactions={transactions} />}

        {activeTab === 'admin' && (
          <AdminOperationsView
            transactions={transactions}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onSelectTransaction={setSelectedTransaction}
          />
        )}

        {activeTab === 'vscode' && (
          <VsCodeHubView
            onDownloadProjectZip={handleDownloadProjectZip}
            isDownloadingZip={isDownloadingZip}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">SentraBank</span>
            <span>AI-Based Fraud Detection & Risk Analytics Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Data Science & ML Internship Capstone</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('vscode')}
              className="text-amber-400 hover:text-amber-300 font-semibold transition"
            >
              VS Code Source & Python Flask Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Appears if user logs out) */}
      {!currentUser && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Welcome back, ${user.name}!`);
          }}
        />
      )}

      {/* CSV Batch Ingestion Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBatchTransactionsAdded={handleBatchTransactionsAdded}
      />
    </div>
  );
}
