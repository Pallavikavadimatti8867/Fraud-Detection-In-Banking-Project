export interface ProjectFile {
  path: string;
  name: string;
  category: 'backend' | 'ml' | 'database' | 'templates' | 'static' | 'docs' | 'data';
  language: string;
  content: string;
}

export const VSCODE_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'app.py',
    name: 'app.py',
    category: 'backend',
    language: 'python',
    content: `"""
AI-Based Fraud Detection in Banking - Flask Web Application
Backend: Python Flask, SQLite, Pandas, NumPy, Scikit-learn, Joblib
Authentication: Session-based, Password Hashing with Werkzeug
"""

import os
import sqlite3
import json
from datetime import datetime
from functools import wraps
import numpy as np
import pandas as pd
from flask import (
    Flask, render_template, request, redirect, url_for,
    session, flash, jsonify, send_file, make_response
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import joblib

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'banking-fraud-shield-secret-2026-key')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'fraud_detection.db')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'fraud_detection_model.pkl')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access the fraud detection portal.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def predict_transaction_risk(features_dict):
    """
    Computes risk score and classification for a banking transaction.
    """
    amount = float(features_dict.get('amount', 0))
    failed = int(features_dict.get('failed_transactions', 0))
    prev_fraud = int(features_dict.get('previous_fraud_count', 0))
    freq = float(features_dict.get('transaction_frequency', 1.0))
    location = features_dict.get('location', 'Domestic')
    device = features_dict.get('device_type', 'Known Mobile')
    merchant = features_dict.get('merchant_category', 'General')
    
    score = 5
    if amount > 5000: score += 32
    elif amount > 2000: score += 20
    elif amount > 800: score += 10
    
    if location in ['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU']: score += 28
    if device in ['Rooted/Jailbroken Phone', 'Headless Browser / Bot']: score += 35
    elif device == 'New Unrecognized Device': score += 15
    
    if merchant in ['Crypto & Gambling', 'Jewelry & Luxury']: score += 18
    if failed >= 3: score += 25
    elif failed >= 1: score += 10
    if prev_fraud > 0: score += 20
    if freq > 4.5: score += 15

    score = max(2, min(99, score))
    proba = round(score / 100.0, 3)

    if score >= 70:
        prediction = 'Fraudulent'
        risk_level = 'High'
        recommendation = 'IMMEDIATE ACTION: Halt settlement and trigger step-up 2FA.'
    elif score >= 35:
        prediction = 'Suspicious'
        risk_level = 'Medium'
        recommendation = 'MANUAL REVIEW: Flagged for compliance inspection.'
    else:
        prediction = 'Legitimate'
        risk_level = 'Low'
        recommendation = 'AUTO-APPROVED: Low fraud indicators. Automated clearing.'

    return {
        'prediction': prediction,
        'fraud_probability': proba,
        'probability_percent': f"{round(proba * 100, 1)}%",
        'risk_score': score,
        'risk_level': risk_level,
        'recommendation': recommendation
    }

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email_or_user = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))

        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE email = ? OR username = ?', (email_or_user, email_or_user)).fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session.permanent = remember
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            session['full_name'] = user['full_name']
            flash(f'Welcome back, {user["full_name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    conn = get_db()
    total_tx = conn.execute('SELECT COUNT(*) FROM transactions').fetchone()[0]
    legit_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Legitimate"').fetchone()[0]
    fraud_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Fraudulent"').fetchone()[0]
    sus_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Suspicious"').fetchone()[0]
    total_amt = conn.execute('SELECT SUM(amount) FROM transactions').fetchone()[0] or 0.0
    avg_amt = conn.execute('SELECT AVG(amount) FROM transactions').fetchone()[0] or 0.0
    recent_flagged = conn.execute('SELECT * FROM transactions ORDER BY id DESC LIMIT 6').fetchall()
    conn.close()
    
    stats = {
        'total_transactions': total_tx,
        'legitimate_transactions': legit_tx,
        'fraudulent_transactions': fraud_tx,
        'suspicious_transactions': sus_tx,
        'fraud_detection_rate': round((fraud_tx / total_tx * 100), 2) if total_tx > 0 else 0,
        'total_amount': f"\${total_amt:,.2f}",
        'avg_amount': f"\${avg_amt:,.2f}"
    }
    return render_template('dashboard.html', stats=stats, recent_flagged=recent_flagged)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
`
  },
  {
    path: 'train_model.py',
    name: 'train_model.py',
    category: 'ml',
    language: 'python',
    content: `"""
AI-Based Fraud Detection in Banking - Machine Learning Training Pipeline
Domain: Banking Fraud Detection (Data Science & Machine Learning)
Algorithms: Logistic Regression vs. Random Forest Classifier
Evaluation: Accuracy, Precision, Recall, F1-Score, Confusion Matrix, ROC-AUC
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)
import joblib

def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'banking_transactions.csv')
    df = pd.read_csv(data_path)
    
    # Feature Engineering
    df['transaction_time'] = pd.to_datetime(df['transaction_time'])
    df['hour'] = df['transaction_time'].dt.hour
    df['is_high_risk_location'] = df['location'].isin(['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU']).astype(int)
    df['is_high_risk_device'] = df['device_type'].isin(['Rooted/Jailbroken Phone', 'Headless Browser / Bot']).astype(int)

    numerical_features = ['amount', 'account_age', 'previous_transactions', 'previous_fraud_count', 'transaction_frequency', 'failed_transactions', 'hour', 'is_high_risk_location', 'is_high_risk_device']
    categorical_features = ['transaction_type', 'location', 'merchant_category', 'device_type']

    X = df[numerical_features + categorical_features]
    y = df['is_fraud']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
    ])

    # 1. Logistic Regression
    lr = Pipeline([('prep', preprocessor), ('clf', LogisticRegression(max_iter=1000, class_weight='balanced'))])
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    lr_proba = lr.predict_proba(X_test)[:, 1]

    # 2. Random Forest
    rf = Pipeline([('prep', preprocessor), ('clf', RandomForestClassifier(n_estimators=150, class_weight='balanced', random_state=42))])
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)[:, 1]

    print("RANDOM FOREST RESULTS:")
    print(f"Accuracy:  {accuracy_score(y_test, rf_preds):.4f}")
    print(f"Precision: {precision_score(y_test, rf_preds):.4f}")
    print(f"Recall:    {recall_score(y_test, rf_preds):.4f}")
    print(f"F1-Score:  {f1_score(y_test, rf_preds):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, rf_proba):.4f}")

    joblib.dump(rf, 'model/fraud_detection_model.pkl')
    print("Model serialized to model/fraud_detection_model.pkl")

if __name__ == '__main__':
    train_and_evaluate()
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    category: 'backend',
    language: 'plaintext',
    content: `Flask>=3.0.0
Werkzeug>=3.0.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.4.0
joblib>=1.3.0
python-dotenv>=1.0.0
`
  },
  {
    path: 'database/init_db.py',
    name: 'init_db.py',
    category: 'database',
    language: 'python',
    content: `import sqlite3
import os
import csv
import hashlib

def safe_hash_password(password):
    try:
        from werkzeug.security import generate_password_hash
        return generate_password_hash(password)
    except ImportError:
        salt = "sentrabank_salt_"
        return "pbkdf2:sha256:" + hashlib.sha256((salt + password).encode()).hexdigest()

DB_PATH = os.path.join(os.path.dirname(__file__), 'fraud_detection.db')
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'banking_transactions.csv')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'analyst',
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        transaction_time TEXT NOT NULL,
        account_age INTEGER,
        location TEXT,
        merchant_category TEXT,
        device_type TEXT,
        previous_transactions INTEGER DEFAULT 0,
        previous_fraud_count INTEGER DEFAULT 0,
        transaction_frequency REAL DEFAULT 0.0,
        failed_transactions INTEGER DEFAULT 0,
        is_fraud INTEGER DEFAULT 0,
        prediction TEXT,
        fraud_probability REAL,
        risk_score INTEGER,
        risk_level TEXT,
        status TEXT DEFAULT 'pending_review'
    )
    ''')

    cursor.execute('''
    INSERT OR IGNORE INTO users (username, email, password_hash, role, full_name)
    VALUES (?, ?, ?, ?, ?)
    ''', ('analyst', 'analyst@sentrabank.com', safe_hash_password('admin123'), 'Senior Fraud Analyst', 'Lead Analyst Sarah Connor'))
    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_database()
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'docs',
    language: 'markdown',
    content: `# AI-Based Fraud Detection in Banking
Internship Capstone Data Science & Machine Learning Project.

## Running in VS Code (Quickest Methods)

### Method A: One-Click Runner Scripts
- **Windows:** Double-click or run \`run.bat\` in VS Code terminal.
- **macOS / Linux:** Run \`./run.sh\` in VS Code terminal.

### Method B: VS Code Run & Debug (F5)
1. Open this folder in VS Code.
2. Press **F5** to start the Flask web server with live debugging!
3. Or open the Run & Debug panel (\`Ctrl+Shift+D\`) and choose:
   - *Python: Run Fraud Detection Flask App (F5)*
   - *Python: Train Machine Learning Model (train_model.py)*
   - *Python: Initialize Database (database/init_db.py)*

### Method C: Manual Terminal Execution
1. \`python -m venv venv\`
2. \`source venv/bin/activate\` (or \`venv\\Scripts\\activate\`)
3. \`pip install -r requirements.txt\`
4. \`python database/init_db.py\`
5. \`python train_model.py\`
6. \`python app.py\`
Open http://127.0.0.1:5000 in your browser!
`
  },
  {
    path: '.vscode/launch.json',
    name: 'launch.json',
    category: 'backend',
    language: 'json',
    content: `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Run Fraud Detection Flask App (F5)",
      "type": "debugpy",
      "request": "launch",
      "module": "flask",
      "env": {
        "FLASK_APP": "app.py",
        "FLASK_DEBUG": "1",
        "PORT": "5000"
      },
      "args": [
        "run",
        "--host=0.0.0.0",
        "--port=5000"
      ],
      "jinja": true,
      "justMyCode": true
    },
    {
      "name": "Python: Run Directly (python app.py)",
      "type": "debugpy",
      "request": "launch",
      "program": "\${workspaceFolder}/app.py",
      "console": "integratedTerminal",
      "justMyCode": true
    },
    {
      "name": "Python: Train Machine Learning Model (train_model.py)",
      "type": "debugpy",
      "request": "launch",
      "program": "\${workspaceFolder}/train_model.py",
      "console": "integratedTerminal",
      "justMyCode": true
    },
    {
      "name": "Python: Initialize Database (database/init_db.py)",
      "type": "debugpy",
      "request": "launch",
      "program": "\${workspaceFolder}/database/init_db.py",
      "console": "integratedTerminal",
      "justMyCode": true
    }
  ]
}`
  },
  {
    path: '.vscode/settings.json',
    name: 'settings.json',
    category: 'backend',
    language: 'json',
    content: `{
  "python.defaultInterpreterPath": "\${workspaceFolder}/venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "files.associations": {
    "*.html": "html"
  },
  "editor.formatOnSave": true
}`
  },
  {
    path: 'run.bat',
    name: 'run.bat',
    category: 'backend',
    language: 'batch',
    content: `@echo off
title AI-Based Fraud Detection in Banking - Setup & Launcher
echo ======================================================================
echo    SentraBank FraudShield AI - Automated Setup and Launcher
echo ======================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

if not exist "venv" (
    echo [1/4] Creating virtual environment (venv)...
    python -m venv venv
)
call venv\\Scripts\\activate.bat

echo [2/4] Installing dependencies...
pip install -r requirements.txt

if not exist "database\\fraud_detection.db" (
    echo [3/4] Initializing SQLite database...
    python database\\init_db.py
)

if not exist "model\\fraud_detection_model.pkl" (
    echo [4/4] Training Random Forest model...
    python train_model.py
)

echo.
echo Starting Flask on http://127.0.0.1:5000 (analyst@sentrabank.com / admin123)
python app.py
pause`
  },
  {
    path: 'run.sh',
    name: 'run.sh',
    category: 'backend',
    language: 'shell',
    content: `#!/usr/bin/env bash
set -e
echo "======================================================================"
echo "   SentraBank FraudShield AI - Automated Setup and Launcher"
echo "======================================================================"

PY_CMD="python3"
if ! command -v python3 &>/dev/null; then
    PY_CMD="python"
fi

if [ ! -d "venv" ]; then
    echo "[1/4] Creating virtual environment (venv)..."
    $PY_CMD -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

if [ ! -f "database/fraud_detection.db" ]; then
    python database/init_db.py
fi

if [ ! -f "model/fraud_detection_model.pkl" ]; then
    python train_model.py
fi

echo "Starting Flask on http://127.0.0.1:5000 (analyst@sentrabank.com / admin123)"
python app.py`
  }
];
