"""
AI-Based Fraud Detection in Banking - Machine Learning Training Pipeline
Domain: Banking Fraud Detection (Data Science & Machine Learning)
Algorithms: Logistic Regression vs. Random Forest Classifier
Evaluation: Accuracy, Precision, Recall, F1-Score, Confusion Matrix, ROC-AUC
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
import joblib

def load_and_preprocess_data(filepath):
    print("=" * 60)
    print("STEP 1 & 2: Loading and Exploring Dataset")
    print("=" * 60)
    df = pd.read_csv(filepath)
    print(f"Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")
    
    # Check for missing values
    missing = df.isnull().sum()
    print("\nMissing values per column:\n", missing[missing > 0] if missing.sum() > 0 else "None detected.")
    
    # Handle missing values if any
    df['amount'] = df['amount'].fillna(df['amount'].median())
    df['account_age'] = df['account_age'].fillna(df['account_age'].median())
    df['previous_transactions'] = df['previous_transactions'].fillna(0)
    df['previous_fraud_count'] = df['previous_fraud_count'].fillna(0)
    df['failed_transactions'] = df['failed_transactions'].fillna(0)
    
    # Drop duplicates
    initial_rows = len(df)
    df = df.drop_duplicates(subset=['transaction_id'])
    print(f"Removed {initial_rows - len(df)} duplicate records.")
    
    # Feature Engineering
    print("\nSTEP 3: Feature Engineering")
    df['transaction_time'] = pd.to_datetime(df['transaction_time'])
    df['hour'] = df['transaction_time'].dt.hour
    df['is_weekend'] = df['transaction_time'].dt.dayofweek.isin([5, 6]).astype(int)
    
    # High-risk flags
    high_risk_locs = ['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU']
    high_risk_devices = ['Rooted/Jailbroken Phone', 'Headless Browser / Bot']
    df['is_high_risk_location'] = df['location'].isin(high_risk_locs).astype(int)
    df['is_high_risk_device'] = df['device_type'].isin(high_risk_devices).astype(int)
    
    class_dist = df['is_fraud'].value_counts()
    print(f"\nClass Distribution:")
    print(f"  Legitimate (0): {class_dist.get(0, 0)} ({class_dist.get(0, 0)/len(df)*100:.2f}%)")
    print(f"  Fraudulent (1): {class_dist.get(1, 0)} ({class_dist.get(1, 0)/len(df)*100:.2f}%)")
    
    return df

def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'banking_transactions.csv')
    if not os.path.exists(data_path):
        data_path = 'data/banking_transactions.csv'
        
    df = load_and_preprocess_data(data_path)
    
    numerical_features = [
        'amount', 
        'account_age', 
        'previous_transactions', 
        'previous_fraud_count', 
        'transaction_frequency', 
        'failed_transactions', 
        'hour',
        'is_high_risk_location',
        'is_high_risk_device'
    ]
    
    categorical_features = [
        'transaction_type', 
        'location', 
        'merchant_category', 
        'device_type'
    ]
    
    X = df[numerical_features + categorical_features]
    y = df['is_fraud']
    
    # Train/Test Split (Stratified to handle class imbalance)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    print(f"\nTraining set size: {len(X_train)} | Test set size: {len(X_test)}")
    
    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    # -------------------------------------------------------------
    # MODEL 1: Logistic Regression
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("MODEL 1: Logistic Regression Classifier")
    print("=" * 60)
    lr_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42))
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_preds = lr_pipeline.predict(X_test)
    lr_proba = lr_pipeline.predict_proba(X_test)[:, 1]
    
    lr_acc = accuracy_score(y_test, lr_preds)
    lr_prec = precision_score(y_test, lr_preds)
    lr_rec = recall_score(y_test, lr_preds)
    lr_f1 = f1_score(y_test, lr_preds)
    lr_roc = roc_auc_score(y_test, lr_proba)
    lr_cm = confusion_matrix(y_test, lr_preds)
    
    print(f"Logistic Regression Accuracy:  {lr_acc*100:.2f}%")
    print(f"Logistic Regression Precision: {lr_prec*100:.2f}%")
    print(f"Logistic Regression Recall:    {lr_rec*100:.2f}%")
    print(f"Logistic Regression F1-Score:  {lr_f1*100:.2f}%")
    print(f"Logistic Regression ROC-AUC:   {lr_roc:.4f}")
    print("\nConfusion Matrix (LR):")
    print(lr_cm)
    
    # -------------------------------------------------------------
    # MODEL 2: Random Forest Classifier
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("MODEL 2: Random Forest Classifier")
    print("=" * 60)
    rf_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=150, 
            max_depth=12, 
            min_samples_split=4, 
            class_weight='balanced', 
            random_state=42
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_preds = rf_pipeline.predict(X_test)
    rf_proba = rf_pipeline.predict_proba(X_test)[:, 1]
    
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_prec = precision_score(y_test, rf_preds)
    rf_rec = recall_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds)
    rf_roc = roc_auc_score(y_test, rf_proba)
    rf_cm = confusion_matrix(y_test, rf_preds)
    
    print(f"Random Forest Accuracy:  {rf_acc*100:.2f}%")
    print(f"Random Forest Precision: {rf_prec*100:.2f}%")
    print(f"Random Forest Recall:    {rf_rec*100:.2f}%")
    print(f"Random Forest F1-Score:  {rf_f1*100:.2f}%")
    print(f"Random Forest ROC-AUC:   {rf_roc:.4f}")
    print("\nConfusion Matrix (RF):")
    print(rf_cm)
    
    # -------------------------------------------------------------
    # Performance Comparison & Model Selection
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("MODEL COMPARISON SUMMARY")
    print("=" * 60)
    comparison_df = pd.DataFrame({
        'Metric': ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC'],
        'Logistic Regression': [f"{lr_acc*100:.1f}%", f"{lr_prec*100:.1f}%", f"{lr_rec*100:.1f}%", f"{lr_f1*100:.1f}%", f"{lr_roc:.3f}"],
        'Random Forest': [f"{rf_acc*100:.1f}%", f"{rf_prec*100:.1f}%", f"{rf_rec*100:.1f}%", f"{rf_f1*100:.1f}%", f"{rf_roc:.3f}"]
    })
    print(comparison_df.to_string(index=False))
    
    better_model_name = "Random Forest" if rf_f1 >= lr_f1 else "Logistic Regression"
    chosen_pipeline = rf_pipeline if rf_f1 >= lr_f1 else lr_pipeline
    print(f"\n=> Better Performing Model Selected: {better_model_name}")
    print("Random Forest excels on non-linear fraud patterns and interaction effects without overfitting.")
    
    # Save Model Artifact
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'fraud_detection_model.pkl')
    joblib.dump(chosen_pipeline, model_path)
    print(f"\nModel pipeline successfully saved to: {model_path}")
    
    # Save Metrics & Evaluation Data
    metrics = {
        'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'total_samples': len(df),
        'fraud_ratio': float(df['is_fraud'].mean()),
        'models': {
            'random_forest': {
                'name': 'Random Forest Classifier',
                'accuracy': round(float(rf_acc), 4),
                'precision': round(float(rf_prec), 4),
                'recall': round(float(rf_rec), 4),
                'f1_score': round(float(rf_f1), 4),
                'roc_auc': round(float(rf_roc), 4),
                'confusion_matrix': {
                    'true_negative': int(rf_cm[0][0]),
                    'false_positive': int(rf_cm[0][1]),
                    'false_negative': int(rf_cm[1][0]),
                    'true_positive': int(rf_cm[1][1])
                }
            },
            'logistic_regression': {
                'name': 'Logistic Regression',
                'accuracy': round(float(lr_acc), 4),
                'precision': round(float(lr_prec), 4),
                'recall': round(float(lr_rec), 4),
                'f1_score': round(float(lr_f1), 4),
                'roc_auc': round(float(lr_roc), 4),
                'confusion_matrix': {
                    'true_negative': int(lr_cm[0][0]),
                    'false_positive': int(lr_cm[0][1]),
                    'false_negative': int(lr_cm[1][0]),
                    'true_positive': int(lr_cm[1][1])
                }
            }
        },
        'selected_model': better_model_name
    }
    
    metrics_path = os.path.join(model_dir, 'model_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"Model metrics saved to: {metrics_path}")

if __name__ == '__main__':
    train_and_evaluate()
