import csv
import random
from datetime import datetime, timedelta

random.seed(42)

transaction_types = ['Online Checkout', 'POS Swipe', 'Wire Transfer', 'ATM Withdrawal', 'Mobile Banking', 'Crypto Exchange']
locations = ['New York, US', 'London, UK', 'Toronto, CA', 'Berlin, DE', 'Sydney, AU', 'Tokyo, JP', 'Lagos, NG', 'Moscow, RU', 'High-Risk IP Proxy', 'Domestic Domestic']
merchant_categories = ['Electronics', 'Jewelry & Luxury', 'Crypto & Gambling', 'Grocery & Supermarket', 'Travel & Airlines', 'Utilities & Bills', 'Restaurants', 'Department Store']
device_types = ['Known Mobile (iOS)', 'Known Mobile (Android)', 'Known Desktop (Chrome)', 'New Unrecognized Device', 'Rooted/Jailbroken Phone', 'Headless Browser / Bot']

records = []
start_date = datetime(2026, 8, 1)

for i in range(1, 1201):
    tx_id = f"TXN-{100000 + i}"
    cust_id = f"CUST-{random.randint(1001, 1400)}"
    tx_type = random.choices(transaction_types, weights=[30, 25, 15, 12, 14, 4])[0]
    
    # generate realistic timestamp
    days_offset = random.randint(0, 65)
    hour = random.choices(list(range(24)), weights=[2, 1, 1, 1, 1, 2, 4, 6, 8, 9, 8, 7, 7, 8, 7, 6, 6, 7, 8, 9, 8, 6, 4, 3])[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    tx_time = (start_date + timedelta(days=days_offset, hours=hour, minutes=minute, seconds=second)).strftime('%Y-%m-%d %H:%M:%S')
    
    account_age = random.randint(1, 120) # months
    location = random.choices(locations, weights=[25, 20, 15, 12, 8, 7, 4, 3, 3, 3])[0]
    merchant = random.choices(merchant_categories, weights=[15, 8, 5, 25, 12, 15, 12, 8])[0]
    device = random.choices(device_types, weights=[35, 30, 20, 10, 3, 2])[0]
    
    prev_txs = random.randint(0, 80)
    prev_fraud = random.choices([0, 1, 2], weights=[95, 4, 1])[0]
    tx_frequency = round(random.uniform(0.1, 8.0), 2)
    failed_txs = random.choices([0, 1, 2, 3, 4], weights=[80, 12, 5, 2, 1])[0]
    
    # Determine base amount
    if tx_type in ['Wire Transfer', 'Crypto Exchange']:
        amount = round(random.uniform(500, 15000), 2)
    elif tx_type in ['ATM Withdrawal']:
        amount = round(random.uniform(20, 1200), 2)
    elif merchant in ['Jewelry & Luxury', 'Electronics']:
        amount = round(random.uniform(150, 4500), 2)
    else:
        amount = round(random.uniform(5, 450), 2)
        
    # Realistic fraud indicator generation based on multi-factor risk
    risk_points = 0
    if amount > 4000: risk_points += 30
    elif amount > 1500: risk_points += 15
    
    if location in ['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU']: risk_points += 35
    if device in ['Rooted/Jailbroken Phone', 'Headless Browser / Bot']: risk_points += 40
    elif device == 'New Unrecognized Device': risk_points += 15
    
    if merchant in ['Crypto & Gambling', 'Jewelry & Luxury']: risk_points += 20
    if failed_txs >= 3: risk_points += 30
    elif failed_txs >= 1: risk_points += 10
    
    if prev_fraud > 0: risk_points += 25
    if tx_frequency > 5.0: risk_points += 20
    if account_age < 3: risk_points += 15
    if hour in [1, 2, 3, 4]: risk_points += 12

    # Fraud probability from risk points
    is_fraud = 1 if (risk_points >= 65 or (risk_points >= 45 and random.random() < 0.45)) else 0
    
    # Inject a few high-value surprise frauds and legitimate high-wealth edge cases
    if random.random() < 0.015:
        is_fraud = 1
    if amount > 8000 and is_fraud == 0 and random.random() < 0.2:
        is_fraud = 1

    records.append({
        'transaction_id': tx_id,
        'customer_id': cust_id,
        'amount': amount,
        'transaction_type': tx_type,
        'transaction_time': tx_time,
        'account_age': account_age,
        'location': location,
        'merchant_category': merchant,
        'device_type': device,
        'previous_transactions': prev_txs,
        'previous_fraud_count': prev_fraud,
        'transaction_frequency': tx_frequency,
        'failed_transactions': failed_txs,
        'is_fraud': is_fraud
    })

# Write CSV
with open('/banking_transactions_generated.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=records[0].keys())
    writer.writeheader()
    writer.writerows(records)

print(f"Generated {len(records)} banking transactions.")
fraud_count = sum(r['is_fraud'] for r in records)
print(f"Fraud count: {fraud_count} ({fraud_count/len(records)*100:.2f}%)")
