import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  Transaction, 
  SAMPLE_LOCATIONS, 
  TRANSACTION_TYPES, 
  MERCHANT_CATEGORIES, 
  DEVICE_TYPES, 
  evaluateTransactionRisk 
} from '../data/initialTransactions';

interface PredictionViewProps {
  onAddTransaction: (tx: Transaction) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ onAddTransaction }) => {
  // Form fields
  const [transactionId, setTransactionId] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customerId, setCustomerId] = useState(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
  const [amount, setAmount] = useState<number>(3850.0);
  const [transactionType, setTransactionType] = useState<Transaction['transactionType']>('Online Checkout');
  const [transactionTime, setTransactionTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));
  const [accountAge, setAccountAge] = useState<number>(14);
  const [location, setLocation] = useState('High-Risk IP Proxy');
  const [merchantCategory, setMerchantCategory] = useState('Crypto & Gambling');
  const [deviceType, setDeviceType] = useState('Headless Browser / Bot');
  const [previousTransactions, setPreviousTransactions] = useState<number>(8);
  const [previousFraudCount, setPreviousFraudCount] = useState<number>(1);
  const [transactionFrequency, setTransactionFrequency] = useState<number>(5.4);
  const [failedTransactions, setFailedTransactions] = useState<number>(3);

  // Live evaluation state
  const [evaluation, setEvaluation] = useState(() =>
    evaluateTransactionRisk({
      amount: 3850.0,
      transactionType: 'Online Checkout',
      location: 'High-Risk IP Proxy',
      merchantCategory: 'Crypto & Gambling',
      deviceType: 'Headless Browser / Bot',
      previousTransactions: 8,
      previousFraudCount: 1,
      transactionFrequency: 5.4,
      failedTransactions: 3,
      accountAge: 14
    })
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute live prediction on form changes
  const runPrediction = (customParams?: Partial<Transaction>) => {
    const params = {
      amount,
      transactionType,
      location,
      merchantCategory,
      deviceType,
      previousTransactions,
      previousFraudCount,
      transactionFrequency,
      failedTransactions,
      accountAge,
      ...customParams
    };
    const res = evaluateTransactionRisk(params);
    setEvaluation(res);
    setSavedSuccess(false);
  };

  const handleSaveToDatabase = () => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      transactionId,
      customerId,
      amount: Number(amount),
      transactionType,
      transactionTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      accountAge,
      location,
      merchantCategory,
      deviceType,
      previousTransactions,
      previousFraudCount,
      transactionFrequency,
      failedTransactions,
      isFraud: evaluation.prediction === 'Fraudulent' ? 1 : 0,
      prediction: evaluation.prediction,
      fraudProbability: evaluation.fraudProbability,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      status: evaluation.prediction === 'Fraudulent' ? 'Flagged' : (evaluation.prediction === 'Suspicious' ? 'Pending Review' : 'Approved'),
      riskFactors: evaluation.riskFactors
    };

    onAddTransaction(newTx);
    setSavedSuccess(true);
    // Generate new ID for next entry
    setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Scenario Presets
  const applyPreset = (preset: 'takeover' | 'legit' | 'crypto' | 'atm') => {
    if (preset === 'takeover') {
      setAmount(4950.0);
      setTransactionType('Online Checkout');
      setLocation('High-Risk IP Proxy');
      setMerchantCategory('Jewelry & Luxury');
      setDeviceType('Headless Browser / Bot');
      setFailedTransactions(3);
      setPreviousFraudCount(1);
      setTransactionFrequency(6.5);
      setAccountAge(2);
      runPrediction({
        amount: 4950.0,
        transactionType: 'Online Checkout',
        location: 'High-Risk IP Proxy',
        merchantCategory: 'Jewelry & Luxury',
        deviceType: 'Headless Browser / Bot',
        failedTransactions: 3,
        previousFraudCount: 1,
        transactionFrequency: 6.5,
        accountAge: 2
      });
    } else if (preset === 'legit') {
      setAmount(42.5);
      setTransactionType('POS Swipe');
      setLocation('New York, US');
      setMerchantCategory('Grocery & Supermarket');
      setDeviceType('Known Mobile (iOS)');
      setFailedTransactions(0);
      setPreviousFraudCount(0);
      setTransactionFrequency(0.8);
      setAccountAge(36);
      runPrediction({
        amount: 42.5,
        transactionType: 'POS Swipe',
        location: 'New York, US',
        merchantCategory: 'Grocery & Supermarket',
        deviceType: 'Known Mobile (iOS)',
        failedTransactions: 0,
        previousFraudCount: 0,
        transactionFrequency: 0.8,
        accountAge: 36
      });
    } else if (preset === 'crypto') {
      setAmount(8500.0);
      setTransactionType('Crypto Exchange');
      setLocation('Lagos, NG');
      setMerchantCategory('Crypto & Gambling');
      setDeviceType('Rooted/Jailbroken Phone');
      setFailedTransactions(2);
      setPreviousFraudCount(0);
      setTransactionFrequency(4.8);
      setAccountAge(4);
      runPrediction({
        amount: 8500.0,
        transactionType: 'Crypto Exchange',
        location: 'Lagos, NG',
        merchantCategory: 'Crypto & Gambling',
        deviceType: 'Rooted/Jailbroken Phone',
        failedTransactions: 2,
        previousFraudCount: 0,
        transactionFrequency: 4.8,
        accountAge: 4
      });
    } else {
      setAmount(800.0);
      setTransactionType('ATM Withdrawal');
      setLocation('Toronto, CA');
      setMerchantCategory('Utilities & Bills');
      setDeviceType('Known Mobile (Android)');
      setFailedTransactions(1);
      setPreviousFraudCount(0);
      setTransactionFrequency(1.2);
      setAccountAge(18);
      runPrediction({
        amount: 800.0,
        transactionType: 'ATM Withdrawal',
        location: 'Toronto, CA',
        merchantCategory: 'Utilities & Bills',
        deviceType: 'Known Mobile (Android)',
        failedTransactions: 1,
        previousFraudCount: 0,
        transactionFrequency: 1.2,
        accountAge: 18
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            Machine Learning Fraud Risk Scoring Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate or evaluate individual banking transactions against the dual Random Forest / Logistic Regression classifier
          </p>
        </div>

        {/* Preset quick test buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Test Presets:
          </span>
          <button
            onClick={() => applyPreset('takeover')}
            className="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg transition"
          >
            Botnet Attack
          </button>
          <button
            onClick={() => applyPreset('crypto')}
            className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition"
          >
            Crypto Surge
          </button>
          <button
            onClick={() => applyPreset('atm')}
            className="px-2.5 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg transition"
          >
            Suspicious ATM
          </button>
          <button
            onClick={() => applyPreset('legit')}
            className="px-2.5 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
          >
            Normal Grocery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" /> Transaction Parameters
            </h2>
            <button
              onClick={() => runPrediction()}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-Evaluate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Transaction ID */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Account ID</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Amount */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Transaction Amount ($ USD)</label>
                <span className="text-amber-400 font-mono font-bold">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="100000"
                  value={amount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setAmount(val);
                    runPrediction({ amount: val });
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Channel / Type</label>
              <select
                value={transactionType}
                onChange={(e) => {
                  const val = e.target.value as Transaction['transactionType'];
                  setTransactionType(val);
                  runPrediction({ transactionType: val });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500"
              >
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Merchant Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Merchant Category</label>
              <select
                value={merchantCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setMerchantCategory(val);
                  runPrediction({ merchantCategory: val });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500"
              >
                {MERCHANT_CATEGORIES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device Fingerprint</label>
              <select
                value={deviceType}
                onChange={(e) => {
                  const val = e.target.value;
                  setDeviceType(val);
                  runPrediction({ deviceType: val });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500"
              >
                {DEVICE_TYPES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Origin Geolocation / IP</label>
              <select
                value={location}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocation(val);
                  runPrediction({ location: val });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500"
              >
                {SAMPLE_LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Account Age */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Age: {accountAge} months</label>
              <input
                type="range"
                min="1"
                max="120"
                value={accountAge}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAccountAge(val);
                  runPrediction({ accountAge: val });
                }}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Transaction Frequency */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Velocity: {transactionFrequency} txs/hr</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={transactionFrequency}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTransactionFrequency(val);
                  runPrediction({ transactionFrequency: val });
                }}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Failed Transactions */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Recent Auth Failures (PIN/OTP)</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setFailedTransactions(num);
                      runPrediction({ failedTransactions: num });
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-bold transition ${
                      failedTransactions === num
                        ? 'bg-red-500/20 text-red-300 border-red-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Past Fraud Strikes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Historical Fraud Strikes</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setPreviousFraudCount(num);
                      runPrediction({ previousFraudCount: num });
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-bold transition ${
                      previousFraudCount === num
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-slate-500">Live inference updates automatically as you adjust parameters.</span>
            <button
              onClick={handleSaveToDatabase}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-900/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              Save Transaction to Active Database
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Transaction <strong>{transactionId}</strong> successfully recorded into database with risk score <strong>{evaluation.riskScore}/100</strong>!
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Model Prediction Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Model Inference Verdict
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                Random Forest v2.4
              </span>
            </div>

            {/* Verdict Display */}
            <div
              className={`p-5 rounded-2xl text-center border transition-all ${
                evaluation.riskLevel === 'High'
                  ? 'bg-gradient-to-b from-red-950/40 to-slate-900 border-red-500/50 shadow-lg shadow-red-950/30'
                  : evaluation.riskLevel === 'Medium'
                  ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-950/30'
                  : 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Predicted Classification
              </div>
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  evaluation.riskLevel === 'High'
                    ? 'text-red-400'
                    : evaluation.riskLevel === 'Medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {evaluation.prediction.toUpperCase()}
              </div>

              {/* Risk Level Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border">
                {evaluation.riskLevel === 'High' ? (
                  <span className="bg-red-500/20 text-red-300 border-red-500/40 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> High Risk
                  </span>
                ) : evaluation.riskLevel === 'Medium' ? (
                  <span className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Medium Risk
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Low Risk
                  </span>
                )}
              </div>
            </div>

            {/* Probability & Risk Score Bars */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Fraud Probability</span>
                  <span className="font-mono font-bold text-white">
                    {Math.round(evaluation.fraudProbability * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      evaluation.riskScore >= 70 ? 'bg-red-500' : evaluation.riskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evaluation.fraudProbability * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Risk Score Metric</span>
                  <span className="font-mono font-bold text-amber-300">
                    {evaluation.riskScore} / 100
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      evaluation.riskScore >= 70 ? 'bg-red-500' : evaluation.riskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evaluation.riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Explainable AI (SHAP-style Feature Impact) */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" /> Model Feature Contributions:
              </h3>
              <div className="space-y-1.5">
                {evaluation.riskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendation */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Surveillance Protocol Action
              </span>
              <p className="text-xs font-semibold text-white leading-relaxed">
                {evaluation.recommendation}
              </p>
            </div>

            {/* Compliance Disclaimer as requested */}
            <div className="mt-4 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 leading-tight">
              <span className="font-semibold text-slate-300 block mb-0.5">
                Compliance & Governance Notice:
              </span>
              This score represents a machine-learning statistical risk prediction designed to support human analyst review. It does not legally certify or guarantee fraud.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
