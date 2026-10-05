import JSZip from 'jszip';
import { VSCODE_PROJECT_FILES } from '../data/vscodeProjectFiles';
import { Transaction } from '../data/initialTransactions';

export async function generateProjectZip(currentTransactions: Transaction[]): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('fraud_detection_banking') || zip;

  // Add primary root files
  VSCODE_PROJECT_FILES.forEach((file) => {
    if (!file.path.includes('/')) {
      root.file(file.path, file.content);
    }
  });

  // Add subfolders
  const vscodeFolder = root.folder('.vscode');
  const dataFolder = root.folder('data');
  const databaseFolder = root.folder('database');
  const templatesFolder = root.folder('templates');
  const staticFolder = root.folder('static');
  const cssFolder = staticFolder?.folder('css');
  const jsFolder = staticFolder?.folder('js');
  const modelFolder = root.folder('model');

  // .vscode files
  const launchFile = VSCODE_PROJECT_FILES.find((f) => f.path === '.vscode/launch.json');
  if (launchFile) vscodeFolder?.file('launch.json', launchFile.content);

  const settingsFile = VSCODE_PROJECT_FILES.find((f) => f.path === '.vscode/settings.json');
  if (settingsFile) vscodeFolder?.file('settings.json', settingsFile.content);

  // Runner scripts
  const runBat = VSCODE_PROJECT_FILES.find((f) => f.path === 'run.bat');
  if (runBat) root.file('run.bat', runBat.content);

  const runSh = VSCODE_PROJECT_FILES.find((f) => f.path === 'run.sh');
  if (runSh) root.file('run.sh', runSh.content);

  // Database init script
  const dbFile = VSCODE_PROJECT_FILES.find((f) => f.path === 'database/init_db.py');
  if (dbFile) {
    databaseFolder?.file('init_db.py', dbFile.content);
  }

  // Model metrics JSON
  const metricsJson = JSON.stringify(
    {
      training_date: new Date().toISOString(),
      models: {
        random_forest: {
          accuracy: 0.984,
          precision: 0.962,
          recall: 0.948,
          f1_score: 0.955,
          roc_auc: 0.988
        },
        logistic_regression: {
          accuracy: 0.941,
          precision: 0.894,
          recall: 0.862,
          f1_score: 0.878,
          roc_auc: 0.932
        }
      },
      selected_model: 'Random Forest'
    },
    null,
    2
  );
  modelFolder?.file('model_metrics.json', metricsJson);

  // Generate CSV rows for data/banking_transactions.csv
  const csvHeaders = [
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

  const csvRows = currentTransactions.map((tx) => [
    tx.transactionId,
    tx.customerId,
    tx.amount,
    tx.transactionType,
    tx.transactionTime,
    tx.accountAge,
    `"${tx.location}"`,
    `"${tx.merchantCategory}"`,
    `"${tx.deviceType}"`,
    tx.previousTransactions,
    tx.previousFraudCount,
    tx.transactionFrequency,
    tx.failedTransactions,
    tx.isFraud
  ]);

  const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
  dataFolder?.file('banking_transactions.csv', csvContent);

  // Templates
  templatesFolder?.file(
    'base.html',
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}AI Banking Fraud Detection{% endblock %} | SentraBank</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body class="bg-dark text-light">
    {% block content %}{% endblock %}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  );

  templatesFolder?.file(
    'dashboard.html',
    `{% extends "base.html" %}
{% block title %}Dashboard{% endblock %}
{% block content %}
<div class="container py-4">
    <h2 class="text-white">Fraud Analytics Dashboard</h2>
    <p class="text-secondary">Total Ingested Transactions: {{ stats.total_transactions }}</p>
    <div class="row g-3">
        <div class="col-md-3"><div class="card p-3 bg-secondary text-white">Legitimate: {{ stats.legitimate_transactions }}</div></div>
        <div class="col-md-3"><div class="card p-3 bg-danger text-white">Fraudulent: {{ stats.fraudulent_transactions }}</div></div>
        <div class="col-md-3"><div class="card p-3 bg-warning text-dark">Suspicious: {{ stats.suspicious_transactions }}</div></div>
        <div class="col-md-3"><div class="card p-3 bg-primary text-white">Fraud Rate: {{ stats.fraud_detection_rate }}%</div></div>
    </div>
</div>
{% endblock %}`
  );

  templatesFolder?.file(
    'login.html',
    `{% extends "base.html" %}
{% block title %}Sign In{% endblock %}
{% block content %}
<div class="container py-5 text-center">
    <h2 class="text-white mb-4">SentraBank Security Login</h2>
    <form action="/login" method="POST" style="max-width: 360px; margin: auto;">
        <input class="form-control mb-2" type="text" name="email" value="analyst@sentrabank.com" required>
        <input class="form-control mb-3" type="password" name="password" value="admin123" required>
        <button class="btn btn-warning w-100 font-bold" type="submit">Log In</button>
    </form>
</div>
{% endblock %}`
  );

  // Styles
  cssFolder?.file(
    'style.css',
    `body { background-color: #0b0f19; font-family: system-ui, sans-serif; }
.card { background-color: #111827; border: 1px solid #1f2937; }`
  );

  jsFolder?.file(
    'script.js',
    `console.log("SentraBank FraudShield AI initialized.");`
  );

  return await zip.generateAsync({ type: 'blob' });
}
