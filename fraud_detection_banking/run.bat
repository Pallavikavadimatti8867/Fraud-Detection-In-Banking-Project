@echo off
title AI-Based Fraud Detection in Banking - Setup & Launcher
echo ======================================================================
echo    SentraBank FraudShield AI - Automated Setup and Launcher
echo ======================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10 or newer from https://www.python.org/
    pause
    exit /b 1
)

:: 2. Create virtual environment if missing
if not exist "venv" (
    echo [1/4] Creating virtual environment (venv)...
    python -m venv venv
) else (
    echo [1/4] Virtual environment already exists.
)

:: 3. Activate venv
echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

:: 4. Install requirements
echo [3/4] Installing dependencies from requirements.txt...
pip install -r requirements.txt

:: 5. Initialize database if missing
if not exist "database\fraud_detection.db" (
    echo [4/5] Initializing SQLite database and seeding 1,200 transactions...
    python database\init_db.py
) else (
    echo [4/5] Database already initialized.
)

:: 6. Train model if missing
if not exist "model\fraud_detection_model.pkl" (
    echo [5/5] Training Random Forest and Logistic Regression models...
    python train_model.py
)

echo.
echo ======================================================================
echo    Starting Flask Web Server on http://127.0.0.1:5000
echo    Login credentials:
echo      Email:    analyst@sentrabank.com
echo      Password: admin123
echo ======================================================================
echo.

python app.py
pause
