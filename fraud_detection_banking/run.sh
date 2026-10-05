#!/usr/bin/env bash
# AI-Based Fraud Detection in Banking - Setup & Launcher (macOS / Linux / VS Code)

set -e

echo "======================================================================"
echo "   SentraBank FraudShield AI - Automated Setup and Launcher"
echo "======================================================================"

# 1. Determine Python executable
if command -v python3 &>/dev/null; then
    PY_CMD="python3"
elif command -v python &>/dev/null; then
    PY_CMD="python"
else
    echo "[ERROR] Python 3.10+ is required but not found in PATH."
    exit 1
fi

echo "Using Python: $($PY_CMD --version)"

# 2. Virtual Environment
if [ ! -d "venv" ]; then
    echo "[1/4] Creating virtual environment (venv)..."
    $PY_CMD -m venv venv
else
    echo "[1/4] Virtual environment already exists."
fi

echo "[2/4] Activating virtual environment..."
source venv/bin/activate

# 3. Install packages
echo "[3/4] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Database Initialization
if [ ! -f "database/fraud_detection.db" ]; then
    echo "[4/5] Initializing SQLite database..."
    python database/init_db.py
else
    echo "[4/5] SQLite database exists."
fi

# 5. Model Training
if [ ! -f "model/fraud_detection_model.pkl" ]; then
    echo "[5/5] Training Random Forest & Logistic Regression..."
    python train_model.py
fi

echo ""
echo "======================================================================"
echo "   Starting Flask Web Server on http://127.0.0.1:5000"
echo "   Default Login Credentials:"
echo "     Email:    analyst@sentrabank.com"
echo "     Password: admin123"
echo "======================================================================"
echo ""

python app.py
