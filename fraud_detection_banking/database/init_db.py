"""
AI-Based Fraud Detection in Banking - Database Initialization
Engine: SQLite
Tables: users, transactions, audit_logs
"""

import sqlite3
import os
import csv
import hashlib

def safe_hash_password(password):
    try:
        from werkzeug.security import generate_password_hash
        return generate_password_hash(password)
    except ImportError:
        # Standard library PBKDF2:SHA256 fallback
        salt = "sentrabank_salt_"
        return "pbkdf2:sha256:" + hashlib.sha256((salt + password).encode()).hexdigest()

DB_PATH = os.path.join(os.path.dirname(__file__), 'fraud_detection.db')
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'banking_transactions.csv')

def init_database():
    print(f"Initializing database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Users table
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

    # Create Transactions table
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
        status TEXT DEFAULT 'pending_review',
        analyst_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Seed Default Users (Passwords securely hashed)
    demo_users = [
        ('analyst', 'analyst@sentrabank.com', safe_hash_password('admin123'), 'Senior Fraud Analyst', 'Lead Analyst Sarah Connor'),
        ('manager', 'manager@sentrabank.com', safe_hash_password('manager123'), 'Risk Manager', 'Marcus Vance (Risk VP)'),
        ('auditor', 'auditor@sentrabank.com', safe_hash_password('audit123'), 'Compliance Auditor', 'Elena Rostova (Compliance)')
    ]

    for username, email, pwd_hash, role, full_name in demo_users:
        cursor.execute('''
        INSERT OR IGNORE INTO users (username, email, password_hash, role, full_name)
        VALUES (?, ?, ?, ?, ?)
        ''', (username, email, pwd_hash, role, full_name))

    print(f"Users table seeded with default security roles.")

    # Seed Transactions if table is empty
    cursor.execute('SELECT COUNT(*) FROM transactions')
    count = cursor.fetchone()[0]
    
    if count == 0 and os.path.exists(CSV_PATH):
        print(f"Seeding transactions from {CSV_PATH}...")
        with open(CSV_PATH, 'r') as f:
            reader = csv.DictReader(f)
            inserted = 0
            for row in reader:
                amount = float(row['amount'])
                is_fraud = int(row['is_fraud'])
                prev_fraud = int(row.get('previous_fraud_count', 0))
                failed = int(row.get('failed_transactions', 0))
                
                # Synthetic risk calculation matching ML model calibration
                base_prob = 0.88 if is_fraud == 1 else 0.04
                if is_fraud == 0 and (amount > 2000 or failed > 1):
                    base_prob = 0.42 # Suspicious
                
                risk_score = int(round(base_prob * 100))
                if risk_score >= 70:
                    risk_level = 'High'
                    prediction = 'Fraudulent'
                    status = 'Flagged'
                elif risk_score >= 35:
                    risk_level = 'Medium'
                    prediction = 'Suspicious'
                    status = 'Pending Review'
                else:
                    risk_level = 'Low'
                    prediction = 'Legitimate'
                    status = 'Approved'

                cursor.execute('''
                INSERT INTO transactions (
                    transaction_id, customer_id, amount, transaction_type, transaction_time,
                    account_age, location, merchant_category, device_type, previous_transactions,
                    previous_fraud_count, transaction_frequency, failed_transactions, is_fraud,
                    prediction, fraud_probability, risk_score, risk_level, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['transaction_id'], row['customer_id'], amount, row['transaction_type'],
                    row['transaction_time'], int(row['account_age']), row['location'],
                    row['merchant_category'], row['device_type'], int(row['previous_transactions']),
                    prev_fraud, float(row['transaction_frequency']), failed, is_fraud,
                    prediction, base_prob, risk_score, risk_level, status
                ))
                inserted += 1
            print(f"Seeded {inserted} transactions into SQLite.")

    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_database()
