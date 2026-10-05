import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  FileCode, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { VSCODE_PROJECT_FILES, ProjectFile } from '../data/vscodeProjectFiles';
import JSZip from 'jszip';

interface VsCodeHubViewProps {
  onDownloadProjectZip: () => void;
  isDownloadingZip?: boolean;
}

export const VsCodeHubView: React.FC<VsCodeHubViewProps> = ({
  onDownloadProjectZip,
  isDownloadingZip
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(VSCODE_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'setup' | 'viva'>('files');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-amber-400" />
            VS Code Project Hub & Python Flask Artifacts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete standalone Python, Flask, Scikit-learn, and SQLite source code ready to run directly in VS Code
          </p>
        </div>

        <button
          onClick={onDownloadProjectZip}
          disabled={isDownloadingZip}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg shadow-amber-950/40 transition flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloadingZip ? 'Packaging Zip...' : 'Download Full VS Code Project (.ZIP)'}
        </button>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" /> Project File Tree & Code Viewer
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'setup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" /> VS Code Setup Instructions & Commands
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'viva'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Internship Viva Voce & Q&A Guide
        </button>
      </div>

      {/* Tab 1: Project Files & Code Explorer */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-amber-400" /> fraud_detection_banking/
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Python 3.10+</span>
            </div>

            <div className="space-y-1">
              {VSCODE_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] uppercase opacity-60 ml-2">{file.language}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Folder Structure Includes:</span>
              <p>• <code>app.py</code>: Python Flask web application</p>
              <p>• <code>train_model.py</code>: Scikit-learn RF vs LR pipeline</p>
              <p>• <code>requirements.txt</code>: Dependencies for pip</p>
              <p>• <code>data/banking_transactions.csv</code>: 1,200 synthetic rows</p>
              <p>• <code>database/fraud_detection.db</code>: SQLite database</p>
              <p>• <code>templates/</code>: Jinja2 HTML5 Bootstrap 5 pages</p>
            </div>
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {selectedFile.language}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedFile.content)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy File'}
              </button>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[550px] leading-relaxed select-text">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: VS Code Setup Instructions & Commands */}
      {activeTab === 'setup' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">How to Run this Project Locally in VS Code</h2>
            <p className="text-xs text-slate-400">
              Follow these commands step-by-step in your VS Code terminal to run the Python Flask backend with the machine learning model.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">1</span>
                  Extract and Open Folder in VS Code
                </span>
              </div>
              <p className="text-slate-300">
                Click <strong>"Download Full VS Code Project (.ZIP)"</strong> above, extract the archive, open VS Code, and choose <strong>File &gt; Open Folder...</strong> to select <code>fraud_detection_banking/</code>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-xs">2</span>
                  Create and Activate Python Virtual Environment
                </span>
                <button
                  onClick={() => copyToClipboard("python -m venv venv\nsource venv/bin/activate # Windows: venv\\Scripts\\activate")}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`# Create virtual environment
python -m venv venv

# Activate on Linux/macOS:
source venv/bin/activate

# Activate on Windows (CMD):
venv\\Scripts\\activate.bat

# Activate on Windows (PowerShell):
venv\\Scripts\\Activate.ps1`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-xs">3</span>
                  Install Dependencies
                </span>
                <button
                  onClick={() => copyToClipboard("pip install -r requirements.txt")}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
pip install -r requirements.txt
              </pre>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-xs">4</span>
                  Initialize SQLite Database & Seed Data
                </span>
                <button
                  onClick={() => copyToClipboard("python database/init_db.py")}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
python database/init_db.py
              </pre>
              <p className="text-slate-400 text-[11px]">
                This parses <code>data/banking_transactions.csv</code> and populates <code>database/fraud_detection.db</code> with 1,200 records and pre-seeded analyst accounts.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs">5</span>
                  Train Scikit-Learn Model & Generate Metrics
                </span>
                <button
                  onClick={() => copyToClipboard("python train_model.py")}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
python train_model.py
              </pre>
              <p className="text-slate-400 text-[11px]">
                Trains Logistic Regression and Random Forest, compares metrics, and dumps <code>model/fraud_detection_model.pkl</code>.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">6</span>
                  Launch Flask Web Server
                </span>
                <button
                  onClick={() => copyToClipboard("python app.py")}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
python app.py
              </pre>
              <p className="text-slate-400 text-[11px]">
                Open <strong>http://127.0.0.1:5000</strong> in your web browser. Log in with <code>analyst@sentrabank.com</code> and password <code>admin123</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Internship Presentation & Viva Voce Q&A Cheat Sheet */}
      {activeTab === 'viva' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Internship Project Presentation & Viva Voce Guide</h2>
            <p className="text-xs text-slate-400">
              Master these core data science concepts and answers for your project review, professor evaluation, or viva examination.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                Q1: What problem does this project solve in banking?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Legacy rule-based banking firewalls rely on static if-then heuristics (e.g. if amount &gt; $5,000, trigger alert), which can be easily evaded by sophisticated attackers and generate high rates of false positives. This project implements a machine learning ensemble classifier that evaluates multi-dimensional signals—transaction velocity, behavioral deviance, anomalous hardware devices, and geolocation shifts—to predict fraud probability in milliseconds while minimizing customer disruption.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                Q2: Why did Random Forest outperform Logistic Regression?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Banking fraud patterns exhibit high non-linearity and complex multi-feature interactions (e.g., an international transaction is not fraudulent on its own, but becomes high-risk when combined with a rooted device, 3 failed PIN attempts, and a crypto merchant category). Logistic Regression assumes linear log-odds decision boundaries, whereas Random Forest constructs deep ensemble decision splits that capture non-linear relationships without overfitting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                Q3: Why is Accuracy an inappropriate metric for fraud evaluation?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Due to extreme class imbalance in banking datasets (e.g., 95% legitimate vs 5% fraud). A baseline dummy model that classifies every transaction as legitimate would achieve 95% accuracy while failing to detect 100% of fraud attacks. We therefore prioritize <strong>Recall</strong> (to intercept maximum fraud), <strong>Precision</strong> (to prevent false declines for cardholders), <strong>F1-score</strong>, and <strong>ROC-AUC</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                Q4: How was feature engineering conducted in the pipeline?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> 
                <br />1. <em>Temporal features:</em> Extracted transaction hour to flag unusual midnight activity (01:00 - 04:00).
                <br />2. <em>Velocity features:</em> Hourly frequency bursts representing automated botnet testing.
                <br />3. <em>Hardware fingerprinting:</em> Flagged rooted/jailbroken devices and headless browsers.
                <br />4. <em>Standardization & Encoding:</em> Used <code>ColumnTransformer</code> with <code>StandardScaler</code> for continuous variables and <code>OneHotEncoder</code> with <code>handle_unknown='ignore'</code> for categorical variables.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                Q5: How does the system ensure bank compliance and human oversight?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> As required by banking regulations, the model does not declare absolute guilt. Instead, it computes a probabilistic <strong>Risk Score (0-100)</strong> categorized into Low, Medium, and High tiers. High-risk transactions are routed to the human Analyst Adjudication Queue, accompanied by explainable feature impact signals (SHAP-style risk factors) so compliance officers can make informed audit decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
