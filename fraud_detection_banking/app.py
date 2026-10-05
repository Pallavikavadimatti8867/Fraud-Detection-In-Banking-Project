"""
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
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'fraud_detection.db')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'fraud_detection_model.pkl')
METRICS_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model_metrics.json')

# -------------------------------------------------------------
# Database Helper
# -------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# -------------------------------------------------------------
# Authentication Decorator
# -------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access the fraud detection portal.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# -------------------------------------------------------------
# ML Inference Engine Helper
# -------------------------------------------------------------
def predict_transaction_risk(features_dict):
    """
    Computes risk score and classification for a transaction.
    Uses trained model if artifact exists, or robust mathematical scoring model.
    """
    amount = float(features_dict.get('amount', 0))
    account_age = int(features_dict.get('account_age', 12))
    prev_txs = int(features_dict.get('previous_transactions', 5))
    prev_fraud = int(features_dict.get('previous_fraud_count', 0))
    freq = float(features_dict.get('transaction_frequency', 1.0))
    failed = int(features_dict.get('failed_transactions', 0))
    tx_type = features_dict.get('transaction_type', 'Online Checkout')
    location = features_dict.get('location', 'Domestic')
    merchant = features_dict.get('merchant_category', 'Retail')
    device = features_dict.get('device_type', 'Known Mobile')
    
    # Try loading serialized joblib pipeline
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            # Create input DataFrame
            sample_df = pd.DataFrame([{
                'amount': amount,
                'account_age': account_age,
                'previous_transactions': prev_txs,
                'previous_fraud_count': prev_fraud,
                'transaction_frequency': freq,
                'failed_transactions': failed,
                'hour': 14,
                'is_high_risk_location': 1 if location in ['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU'] else 0,
                'is_high_risk_device': 1 if device in ['Rooted/Jailbroken Phone', 'Headless Browser / Bot'] else 0,
                'transaction_type': tx_type,
                'location': location,
                'merchant_category': merchant,
                'device_type': device
            }])
            proba = float(model.predict_proba(sample_df)[0][1])
            risk_score = int(round(proba * 100))
        except Exception as e:
            print(f"Model inference fallback: {e}")
            risk_score, proba = calculate_heuristic_risk(features_dict)
    else:
        risk_score, proba = calculate_heuristic_risk(features_dict)

    if risk_score >= 70:
        prediction = 'Fraudulent'
        risk_level = 'High'
        recommendation = 'IMMEDIATE ACTION: Block transaction and trigger 2FA out-of-band verification.'
    elif risk_score >= 35:
        prediction = 'Suspicious'
        risk_level = 'Medium'
        recommendation = 'MANUAL REVIEW: Flagged for compliance inspection. Hold settlement for 1 hour.'
    else:
        prediction = 'Legitimate'
        risk_level = 'Low'
        recommendation = 'AUTO-APPROVED: Low fraud indicators. Proceed with automated clearing.'

    return {
        'prediction': prediction,
        'fraud_probability': round(proba, 4),
        'probability_percent': f"{round(proba * 100, 1)}%",
        'risk_score': risk_score,
        'risk_level': risk_level,
        'recommendation': recommendation
    }

def calculate_heuristic_risk(data):
    """
    Standardized multi-factor scoring matching the banking trained Random Forest
    """
    score = 4
    amt = float(data.get('amount', 0))
    if amt > 5000: score += 32
    elif amt > 2000: score += 20
    elif amt > 800: score += 10
    
    if data.get('location') in ['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU']: score += 28
    if data.get('device_type') in ['Rooted/Jailbroken Phone', 'Headless Browser / Bot']: score += 35
    elif data.get('device_type') == 'New Unrecognized Device': score += 15
    
    if data.get('merchant_category') in ['Crypto & Gambling', 'Jewelry & Luxury']: score += 18
    failed = int(data.get('failed_transactions', 0))
    if failed >= 3: score += 25
    elif failed >= 1: score += 10
    
    if int(data.get('previous_fraud_count', 0)) > 0: score += 20
    if float(data.get('transaction_frequency', 1)) > 4.5: score += 15
    if int(data.get('account_age', 12)) < 3: score += 12

    score = max(2, min(98, score))
    proba = score / 100.0
    return score, proba

# -------------------------------------------------------------
# Routes: Auth
# -------------------------------------------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email_or_user = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))

        conn = get_db()
        user = conn.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?', 
            (email_or_user, email_or_user)
        ).fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session.permanent = remember
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['email'] = user['email']
            session['role'] = user['role']
            session['full_name'] = user['full_name']
            flash(f'Welcome back, {user["full_name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email/user ID or password. Please try again.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        full_name = request.form.get('full_name', '').strip()
        role = request.form.get('role', 'Junior Fraud Analyst')

        if not username or not email or not password:
            flash('All required fields must be filled.', 'warning')
            return render_template('register.html')

        pwd_hash = generate_password_hash(password)
        conn = get_db()
        try:
            conn.execute('''
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES (?, ?, ?, ?, ?)
            ''', (username, email, pwd_hash, role, full_name))
            conn.commit()
            conn.close()
            flash('Registration successful! You may now log in.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            conn.close()
            flash('Username or email already registered.', 'danger')

    return render_template('register.html')

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    flash('You have been securely logged out.', 'info')
    return redirect(url_for('login'))

# -------------------------------------------------------------
# Routes: Core System
# -------------------------------------------------------------
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    conn = get_db()
    
    # Summary KPI aggregations
    total_tx = conn.execute('SELECT COUNT(*) FROM transactions').fetchone()[0]
    legit_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Legitimate"').fetchone()[0]
    fraud_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Fraudulent"').fetchone()[0]
    sus_tx = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Suspicious"').fetchone()[0]
    
    total_amt = conn.execute('SELECT SUM(amount) FROM transactions').fetchone()[0] or 0.0
    avg_amt = conn.execute('SELECT AVG(amount) FROM transactions').fetchone()[0] or 0.0
    high_risk_count = conn.execute('SELECT COUNT(*) FROM transactions WHERE risk_score >= 70').fetchone()[0]
    
    fraud_rate = (fraud_tx / total_tx * 100) if total_tx > 0 else 0.0
    
    # Recent Flagged Transactions
    recent_flagged = conn.execute('''
        SELECT * FROM transactions 
        ORDER BY id DESC LIMIT 6
    ''').fetchall()
    
    conn.close()
    
    stats = {
        'total_transactions': total_tx,
        'legitimate_transactions': legit_tx,
        'fraudulent_transactions': fraud_tx,
        'suspicious_transactions': sus_tx,
        'fraud_detection_rate': round(fraud_rate, 2),
        'total_amount': f"${total_amt:,.2f}",
        'avg_amount': f"${avg_amt:,.2f}",
        'high_risk_transactions': high_risk_count
    }
    
    return render_template('dashboard.html', stats=stats, recent_flagged=recent_flagged)

@app.route('/transactions')
@login_required
def transactions():
    search = request.args.get('search', '').strip()
    status_filter = request.args.get('status', 'all')
    type_filter = request.args.get('type', 'all')
    page = int(request.args.get('page', 1))
    per_page = 15
    offset = (page - 1) * per_page
    
    conn = get_db()
    query = 'SELECT * FROM transactions WHERE 1=1'
    params = []
    
    if search:
        query += ' AND (transaction_id LIKE ? OR customer_id LIKE ? OR merchant_category LIKE ?)'
        like_str = f'%{search}%'
        params.extend([like_str, like_str, like_str])
        
    if status_filter != 'all':
        query += ' AND prediction = ?'
        params.append(status_filter)
        
    if type_filter != 'all':
        query += ' AND transaction_type = ?'
        params.append(type_filter)
        
    count_query = query.replace('SELECT *', 'SELECT COUNT(*)')
    total_records = conn.execute(count_query, params).fetchone()[0]
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.extend([per_page, offset])
    
    tx_list = conn.execute(query, params).fetchall()
    conn.close()
    
    total_pages = max(1, (total_records + per_page - 1) // per_page)
    
    return render_template(
        'transactions.html',
        transactions=tx_list,
        current_page=page,
        total_pages=total_pages,
        total_records=total_records,
        search=search,
        status_filter=status_filter,
        type_filter=type_filter
    )

@app.route('/predict', methods=['GET', 'POST'])
@login_required
def predict():
    result = None
    input_data = {}
    if request.method == 'POST':
        input_data = {
            'transaction_id': request.form.get('transaction_id', f"TXN-{np.random.randint(100000, 999999)}"),
            'customer_id': request.form.get('customer_id', f"CUST-{np.random.randint(1000, 9999)}"),
            'amount': float(request.form.get('amount', 100)),
            'transaction_type': request.form.get('transaction_type', 'Online Checkout'),
            'transaction_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'account_age': int(request.form.get('account_age', 12)),
            'location': request.form.get('location', 'Domestic'),
            'merchant_category': request.form.get('merchant_category', 'Retail'),
            'device_type': request.form.get('device_type', 'Known Mobile'),
            'previous_transactions': int(request.form.get('previous_transactions', 10)),
            'previous_fraud_count': int(request.form.get('previous_fraud_count', 0)),
            'transaction_frequency': float(request.form.get('transaction_frequency', 1.0)),
            'failed_transactions': int(request.form.get('failed_transactions', 0))
        }
        
        result = predict_transaction_risk(input_data)
        
        # Save to database if requested
        if request.form.get('save_to_db'):
            conn = get_db()
            conn.execute('''
            INSERT INTO transactions (
                transaction_id, customer_id, amount, transaction_type, transaction_time,
                account_age, location, merchant_category, device_type, previous_transactions,
                previous_fraud_count, transaction_frequency, failed_transactions, is_fraud,
                prediction, fraud_probability, risk_score, risk_level, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                input_data['transaction_id'], input_data['customer_id'], input_data['amount'],
                input_data['transaction_type'], input_data['transaction_time'], input_data['account_age'],
                input_data['location'], input_data['merchant_category'], input_data['device_type'],
                input_data['previous_transactions'], input_data['previous_fraud_count'],
                input_data['transaction_frequency'], input_data['failed_transactions'],
                1 if result['prediction'] == 'Fraudulent' else 0,
                result['prediction'], result['fraud_probability'], result['risk_score'],
                result['risk_level'], 'Manual Analyzed'
            ))
            conn.commit()
            conn.close()
            flash('Transaction analyzed and logged to database.', 'success')

    return render_template('prediction.html', result=result, form=input_data)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part selected in upload request.', 'danger')
            return redirect(request.url)
            
        file = request.files['file']
        if file.filename == '':
            flash('No CSV file selected.', 'warning')
            return redirect(request.url)
            
        if file and file.filename.endswith('.csv'):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                # Pandas ingestion and validation
                df = pd.read_csv(filepath)
                required_cols = {'transaction_id', 'amount', 'transaction_type'}
                if not required_cols.issubset(set(df.columns)):
                    flash(f'CSV missing required columns: {required_cols - set(df.columns)}', 'danger')
                    return redirect(request.url)
                
                # Preprocess missing values
                df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
                
                conn = get_db()
                inserted_count = 0
                fraud_count = 0
                
                for _, row in df.iterrows():
                    tx_dict = {
                        'amount': row.get('amount', 0),
                        'transaction_type': row.get('transaction_type', 'POS Swipe'),
                        'location': row.get('location', 'Domestic'),
                        'merchant_category': row.get('merchant_category', 'Retail'),
                        'device_type': row.get('device_type', 'Known Mobile'),
                        'previous_fraud_count': row.get('previous_fraud_count', 0),
                        'failed_transactions': row.get('failed_transactions', 0),
                        'transaction_frequency': row.get('transaction_frequency', 1.0)
                    }
                    pred = predict_transaction_risk(tx_dict)
                    if pred['prediction'] == 'Fraudulent':
                        fraud_count += 1
                        
                    conn.execute('''
                    INSERT OR REPLACE INTO transactions (
                        transaction_id, customer_id, amount, transaction_type, transaction_time,
                        account_age, location, merchant_category, device_type, previous_transactions,
                        previous_fraud_count, transaction_frequency, failed_transactions, is_fraud,
                        prediction, fraud_probability, risk_score, risk_level, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        str(row.get('transaction_id', f"TXN-{np.random.randint(100000, 999999)}")),
                        str(row.get('customer_id', 'CUST-BATCH')),
                        float(row.get('amount', 0)),
                        str(row.get('transaction_type', 'Online Checkout')),
                        str(row.get('transaction_time', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))),
                        int(row.get('account_age', 12)),
                        str(row.get('location', 'Domestic')),
                        str(row.get('merchant_category', 'General')),
                        str(row.get('device_type', 'Desktop')),
                        int(row.get('previous_transactions', 0)),
                        int(row.get('previous_fraud_count', 0)),
                        float(row.get('transaction_frequency', 1.0)),
                        int(row.get('failed_transactions', 0)),
                        1 if pred['prediction'] == 'Fraudulent' else 0,
                        pred['prediction'],
                        pred['fraud_probability'],
                        pred['risk_score'],
                        pred['risk_level'],
                        'Batch Ingested'
                    ))
                    inserted_count += 1
                
                conn.commit()
                conn.close()
                flash(f'Successfully processed {inserted_count} transactions from {filename}. Flagged {fraud_count} suspicious/fraud transactions.', 'success')
                return redirect(url_for('dashboard'))
            except Exception as e:
                flash(f'Error processing CSV file: {str(e)}', 'danger')
        else:
            flash('Invalid file format. Please upload a .csv file.', 'danger')
            
    return render_template('admin.html')

@app.route('/analytics')
@login_required
def analytics():
    # Model evaluation metrics
    metrics = {}
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, 'r') as f:
            metrics = json.load(f)
    return render_template('analytics.html', metrics=metrics)

@app.route('/reports')
@login_required
def reports():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM transactions').fetchone()[0]
    fraud = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Fraudulent"').fetchone()[0]
    legit = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Legitimate"').fetchone()[0]
    sus = conn.execute('SELECT COUNT(*) FROM transactions WHERE prediction = "Suspicious"').fetchone()[0]
    high_risk_list = conn.execute('SELECT * FROM transactions WHERE risk_score >= 70 ORDER BY risk_score DESC LIMIT 20').fetchall()
    conn.close()
    
    summary = {
        'total': total,
        'fraud': fraud,
        'legit': legit,
        'suspicious': sus,
        'rate': round((fraud / total * 100), 2) if total > 0 else 0,
        'high_risk_sample': high_risk_list
    }
    return render_template('reports.html', summary=summary)

@app.route('/admin')
@login_required
def admin():
    conn = get_db()
    high_risk = conn.execute('SELECT * FROM transactions WHERE risk_score >= 60 ORDER BY risk_score DESC LIMIT 30').fetchall()
    users = conn.execute('SELECT id, username, email, role, full_name, created_at FROM users').fetchall()
    conn.close()
    return render_template('admin.html', high_risk=high_risk, users=users)

@app.route('/api/stats')
@login_required
def api_stats():
    conn = get_db()
    # Type breakdown
    type_rows = conn.execute('''
        SELECT transaction_type, 
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count
        FROM transactions
        GROUP BY transaction_type
    ''').fetchall()
    
    # Location breakdown
    loc_rows = conn.execute('''
        SELECT location,
               COUNT(*) as total,
               SUM(CASE WHEN prediction = 'Fraudulent' THEN 1 ELSE 0 END) as fraud_count
        FROM transactions
        GROUP BY location
        ORDER BY fraud_count DESC LIMIT 8
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        'types': [{'type': r['transaction_type'], 'total': r['total'], 'fraud': r['fraud_count']} for r in type_rows],
        'locations': [{'location': r['location'], 'total': r['total'], 'fraud': r['fraud_count']} for r in loc_rows]
    })

if __name__ == '__main__':
    # Initialize database on first startup
    if not os.path.exists(DB_PATH):
        from database.init_db import init_database
        init_database()
        
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Banking Fraud Detection System on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
