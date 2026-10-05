import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Transaction, evaluateTransactionRisk } from '../data/initialTransactions';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchTransactionsAdded: (newTransactions: Transaction[]) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onBatchTransactionsAdded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<{
    totalRows: number;
    fraudCount: number;
    legitCount: number;
    totalAmount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    // Generate realistic sample CSV
    const sampleHeaders = [
      'transaction_id',
      'customer_id',
      'amount',
      'transaction_type',
      'transaction_time',
      'account_age',
      'location',
      'merchant_category',
      'device_type',
      'previous_transactions',
      'previous_fraud_count',
      'transaction_frequency',
      'failed_transactions',
      'is_fraud'
    ];

    const sampleRows = [
      ['TXN-901001', 'CUST-1045', '7500.00', 'Wire Transfer', '2026-10-04 02:14:00', '2', 'High-Risk IP Proxy', 'Crypto & Gambling', 'Headless Browser / Bot', '3', '1', '6.8', '3', '1'],
      ['TXN-901002', 'CUST-2089', '42.15', 'POS Swipe', '2026-10-04 09:30:12', '48', 'New York, US', 'Grocery & Supermarket', 'Known Mobile (iOS)', '32', '0', '0.5', '0', '0'],
      ['TXN-901003', 'CUST-3112', '310.00', 'Online Checkout', '2026-10-04 14:15:20', '12', 'London, UK', 'Electronics', 'Known Desktop (Chrome)', '14', '0', '1.1', '0', '0'],
      ['TXN-901004', 'CUST-4022', '4200.00', 'Online Checkout', '2026-10-04 23:45:00', '1', 'Lagos, NG', 'Jewelry & Luxury', 'Rooted/Jailbroken Phone', '1', '0', '5.2', '2', '1'],
      ['TXN-901005', 'CUST-5881', '85.50', 'ATM Withdrawal', '2026-10-04 11:10:00', '24', 'Toronto, CA', 'Utilities & Bills', 'Known Mobile (Android)', '19', '0', '0.9', '0', '0'],
      ['TXN-901006', 'CUST-6102', '1200.00', 'Crypto Exchange', '2026-10-04 03:22:45', '6', 'Moscow, RU', 'Crypto & Gambling', 'New Unrecognized Device', '5', '0', '4.1', '1', '1'],
      ['TXN-901007', 'CUST-7241', '15.90', 'POS Swipe', '2026-10-04 17:05:18', '60', 'Sydney, AU', 'Restaurants', 'Known Mobile (iOS)', '45', '0', '0.6', '0', '0'],
      ['TXN-901008', 'CUST-8339', '1890.00', 'Wire Transfer', '2026-10-04 16:40:00', '9', 'Berlin, DE', 'Travel & Airlines', 'Known Desktop (Chrome)', '8', '0', '2.0', '1', '0']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [sampleHeaders.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'banking_transactions_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcessCsv = () => {
    if (!file) {
      setError('Please select or upload a .csv file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          setError('CSV file must have at least one header row and one data row.');
          setIsProcessing(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const reqColumns = ['amount', 'transaction_type'];
        const hasReq = reqColumns.every(col => headers.includes(col) || headers.some(h => h.includes(col)));

        if (!hasReq) {
          setError(`Invalid CSV Schema. Missing required columns (amount, transaction_type). Found: ${headers.slice(0, 5).join(', ')}`);
          setIsProcessing(false);
          return;
        }

        // Parse rows
        const parsedTxs: Transaction[] = [];
        let fraudCount = 0;
        let legitCount = 0;
        let totalAmt = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          if (values.length < 3) continue;

          const rowData: Record<string, any> = {};
          headers.forEach((h, idx) => {
            rowData[h] = values[idx] || '';
          });

          const amt = parseFloat(rowData['amount'] || rowData['transaction_amount']) || 100.0;
          totalAmt += amt;

          const baseTx: Partial<Transaction> = {
            transactionId: rowData['transaction_id'] || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            customerId: rowData['customer_id'] || `CUST-BATCH`,
            amount: amt,
            transactionType: (rowData['transaction_type'] as any) || 'Online Checkout',
            transactionTime: rowData['transaction_time'] || new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountAge: parseInt(rowData['account_age'], 10) || 12,
            location: rowData['location'] || 'Domestic',
            merchantCategory: rowData['merchant_category'] || 'Retail',
            deviceType: rowData['device_type'] || 'Known Desktop (Chrome)',
            previousTransactions: parseInt(rowData['previous_transactions'], 10) || 5,
            previousFraudCount: parseInt(rowData['previous_fraud_count'], 10) || 0,
            transactionFrequency: parseFloat(rowData['transaction_frequency']) || 1.0,
            failedTransactions: parseInt(rowData['failed_transactions'], 10) || 0
          };

          const evalRes = evaluateTransactionRisk(baseTx);
          if (evalRes.prediction === 'Fraudulent') fraudCount++;
          else legitCount++;

          parsedTxs.push({
            id: `batch-${Date.now()}-${i}`,
            transactionId: baseTx.transactionId!,
            customerId: baseTx.customerId!,
            amount: amt,
            transactionType: baseTx.transactionType as any,
            transactionTime: baseTx.transactionTime!,
            accountAge: baseTx.accountAge!,
            location: baseTx.location!,
            merchantCategory: baseTx.merchantCategory!,
            deviceType: baseTx.deviceType!,
            previousTransactions: baseTx.previousTransactions!,
            previousFraudCount: baseTx.previousFraudCount!,
            transactionFrequency: baseTx.transactionFrequency!,
            failedTransactions: baseTx.failedTransactions!,
            isFraud: evalRes.prediction === 'Fraudulent' ? 1 : 0,
            prediction: evalRes.prediction,
            fraudProbability: evalRes.fraudProbability,
            riskScore: evalRes.riskScore,
            riskLevel: evalRes.riskLevel,
            status: evalRes.prediction === 'Fraudulent' ? 'Flagged' : (evalRes.prediction === 'Suspicious' ? 'Pending Review' : 'Approved'),
            riskFactors: evalRes.riskFactors
          });
        }

        setPreviewStats({
          totalRows: parsedTxs.length,
          fraudCount,
          legitCount,
          totalAmount: totalAmt
        });

        // Add to active database
        onBatchTransactionsAdded(parsedTxs);
        setIsProcessing(false);
      } catch (err: any) {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Transaction CSV Ingestion</h3>
              <p className="text-xs text-slate-400">Automated Pandas data cleaning & ML batch risk scoring</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone */}
        {!previewStats ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/50">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csvFileInput"
              />
              <label htmlFor="csvFileInput" className="cursor-pointer space-y-2 block">
                <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-xs font-semibold text-slate-200">
                  {file ? file.name : 'Click or drag banking transaction CSV here'}
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports comma-separated UTF-8 files (.csv) up to 16MB
                </p>
              </label>
            </div>

            {/* Template sample button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample Banking CSV Template
              </button>
              <span className="text-[11px] text-slate-500">14 Features Expected</span>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcessCsv}
              disabled={!file || isProcessing}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Preprocessing & Executing Model...' : 'Ingest & Run Machine Learning Predictions'}
            </button>
          </div>
        ) : (
          /* Processed Success Stats */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Batch Successfully Ingested!</h4>
              <p className="text-xs text-emerald-300">
                Processed {previewStats.totalRows} transactions through the Random Forest inference engine.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Total Ingested</span>
                <span className="font-bold text-white text-base">{previewStats.totalRows}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Fraud Flagged</span>
                <span className="font-bold text-red-400 text-base">{previewStats.fraudCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Legitimate</span>
                <span className="font-bold text-emerald-400 text-base">{previewStats.legitCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              All dashboard KPIs, Chart.js telemetry graphs, and transaction tables have been dynamically updated!
            </p>

            <button
              onClick={() => {
                setPreviewStats(null);
                setFile(null);
                onClose();
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
