# AI-Based Fraud Detection in Banking

An enterprise-grade, internship-level Data Science & Machine Learning platform that monitors, analyzes, and predicts fraudulent banking transactions in real time using Python, Flask, Scikit-Learn, and Chart.js.

---

## 1. Project Overview

- **Domain:** Data Science / FinTech / Cybersecurity
- **Project Type:** Banking Fraud Detection & Risk Surveillance
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js
- **Backend:** Python Flask (REST APIs & Session Auth)
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** Scikit-learn (Random Forest Classifier & Logistic Regression)
- **Database:** SQLite (`database/fraud_detection.db`)
- **Model Storage:** Joblib (`model/fraud_detection_model.pkl`)

---

## 2. Directory Structure

```
fraud_detection_banking/
│
├── app.py                      # Flask backend entrypoint & REST routing
├── requirements.txt            # Python package dependencies
├── README.md                   # Complete documentation & viva guide
│
├── data/
│   └── banking_transactions.csv# Synthetic banking dataset (1,200 transactions)
│
├── model/
│   ├── fraud_detection_model.pkl # Trained Random Forest Pipeline
│   └── model_metrics.json      # Benchmark evaluation scores
│
├── database/
│   ├── init_db.py              # SQLite schema creation & seed script
│   └── fraud_detection.db      # SQLite relational database
│
├── templates/
│   ├── base.html               # Shared layout & navigation
│   ├── login.html              # Secure session authentication
│   ├── register.html           # New analyst onboarding
│   ├── dashboard.html          # KPI metrics & 6 Chart.js charts
│   ├── transactions.html       # Searchable & filterable ledger
│   ├── prediction.html         # Live single transaction inference
│   ├── analytics.html          # ML model comparison & ROC curves
│   ├── reports.html            # Audit report & CSV export
│   └── admin.html              # CSV batch ingestion & triage queue
│
├── static/
│   ├── css/
│   │   └── style.css           # Custom dark banking theme
│   └── js/
│       └── script.js           # Interactive UI utilities
│
└── uploads/                    # Temporary batch upload storage
```

---

## 3. Step-by-Step VS Code Setup & Execution

### Prerequisites
- Python 3.10+ installed
- Visual Studio Code installed with the **Python** extension

### Step 1: Open Project in VS Code
Open VS Code, click **File > Open Folder...**, and select the `fraud_detection_banking` directory.

### Step 2: Open VS Code Terminal
Press ``Ctrl + ` `` (Windows/Linux) or ``Cmd + ` `` (macOS) to open the integrated terminal.

### Step 3: Create & Activate Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows (Command Prompt)
venv\Scripts\activate.bat

# Activate on Windows (PowerShell)
venv\Scripts\Activate.ps1

# Activate on macOS / Linux
source venv/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 5: Initialize the Database
```bash
python database/init_db.py
```
*This creates `database/fraud_detection.db` and loads the initial 1,200 synthetic banking records and default analyst credentials.*

### Step 6: Train the Machine Learning Models
```bash
python train_model.py
```
*This runs the full data science pipeline, compares Logistic Regression vs Random Forest, generates evaluation metrics, and serializes the model to `model/fraud_detection_model.pkl`.*

### Step 7: Launch the Flask Application
```bash
python app.py
```
*The app will start at `http://127.0.0.1:5000`.*

---

## 4. Default Login Credentials (Pre-Seeded)

| Role | Username / Email | Password |
|---|---|---|
| Senior Fraud Analyst | `analyst@sentrabank.com` | `admin123` |
| Risk Manager | `manager@sentrabank.com` | `manager123` |
| Compliance Officer | `auditor@sentrabank.com` | `audit123` |

*Passwords are stored as salted PBKDF2:SHA256 hashes inside SQLite.*

---

## 5. Machine Learning Pipeline & Model Comparison

### Classification Algorithms Evaluated
1. **Logistic Regression (Baseline):** Linear log-odds decision boundary with L2 regularization and balanced class weights.
2. **Random Forest Classifier (Champion):** Ensemble of 150 stratified decision trees with feature bootstrap sampling.

### Performance Benchmark

| Metric | Logistic Regression | Random Forest (Selected) | Priority in Fraud |
|---|---|---|---|
| **Accuracy** | 94.1% | **98.4%** | Low (Misleading due to imbalance) |
| **Precision** | 89.4% | **96.2%** | High (Minimizes false customer card declines) |
| **Recall** | 86.2% | **94.8%** | **Critical** (Catches actual fraud events) |
| **F1-Score** | 87.8% | **95.5%** | Harmonic mean of precision & recall |
| **ROC-AUC** | 0.932 | **0.988** | Overall discriminative power |

### Why Accuracy is Insufficient (Viva Voce Key Topic)
In banking datasets, fraudulent transactions typically comprise only 5% to 15% of total volume. A dummy model that classifies every transaction as "Legitimate" would achieve **85% - 95% accuracy** while intercepting **0% of fraud**. Therefore, model evaluation must prioritize **Precision**, **Recall**, **F1-Score**, and **ROC-AUC**.
