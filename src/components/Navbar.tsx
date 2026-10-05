import React from 'react';
import { 
  ShieldAlert, 
  BarChart3, 
  Cpu, 
  Table, 
  FileText, 
  Sliders, 
  Code2, 
  Download, 
  LogOut, 
  UserCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { name: string; role: string; email: string } | null;
  onLogout: () => void;
  onDownloadProjectZip: () => void;
  onOpenUpload: () => void;
  isDownloadingZip?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onDownloadProjectZip,
  onOpenUpload,
  isDownloadingZip
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ML Risk Engine: Active (Random Forest v2.4 • 98.4% Acc)
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Production Banking Surveillance Protocol 802.1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Internship Capstone Project
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 border border-blue-400/30">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">SentraBank</span>
                <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  FraudShield AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Enterprise Transaction Risk Surveillance</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('prediction')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'prediction'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Risk Analysis
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Transactions
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Model Benchmark
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Audit Reports
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Operations
            </button>

            <button
              onClick={() => setActiveTab('vscode')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'vscode'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              VS Code Project
            </button>
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenUpload}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Upload batch CSV dataset"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Upload CSV
            </button>

            <button
              onClick={onDownloadProjectZip}
              disabled={isDownloadingZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950/40 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloadingZip ? 'Bundling...' : 'Download Project .ZIP'}
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="hidden xl:block text-left leading-tight">
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{currentUser.role}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden border-t border-slate-800/80 px-2 py-2 flex items-center justify-between overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'prediction' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Risk Analysis
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Ledger
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          ML Benchmark
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 ${activeTab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          Operations
        </button>
        <button
          onClick={() => setActiveTab('vscode')}
          className={`px-2.5 py-1.5 rounded-md flex-shrink-0 font-bold ${activeTab === 'vscode' ? 'bg-amber-500 text-slate-950' : 'text-amber-400'}`}
        >
          VS Code Project
        </button>
      </div>
    </header>
  );
};
