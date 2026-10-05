export interface Transaction {
  id: string;
  transactionId: string;
  customerId: string;
  amount: number;
  transactionType: 'Online Checkout' | 'Wire Transfer' | 'POS Swipe' | 'ATM Withdrawal' | 'Mobile Banking' | 'Crypto Exchange';
  transactionTime: string;
  accountAge: number; // months
  location: string;
  merchantCategory: string;
  deviceType: string;
  previousTransactions: number;
  previousFraudCount: number;
  transactionFrequency: number; // per hour
  failedTransactions: number;
  isFraud: number; // 0 or 1
  prediction: 'Legitimate' | 'Suspicious' | 'Fraudulent';
  fraudProbability: number; // 0.0 - 1.0
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Approved' | 'Pending Review' | 'Flagged' | 'Blocked' | 'Verified';
  riskFactors?: string[];
  adjudicationNotes?: string;
}

export const SAMPLE_LOCATIONS = [
  'New York, US',
  'London, UK',
  'Toronto, CA',
  'Berlin, DE',
  'Sydney, AU',
  'Tokyo, JP',
  'Lagos, NG',
  'Moscow, RU',
  'High-Risk IP Proxy',
  'Domestic Domestic'
];

export const TRANSACTION_TYPES = [
  'Online Checkout',
  'Wire Transfer',
  'POS Swipe',
  'ATM Withdrawal',
  'Mobile Banking',
  'Crypto Exchange'
] as const;

export const MERCHANT_CATEGORIES = [
  'Electronics',
  'Jewelry & Luxury',
  'Crypto & Gambling',
  'Grocery & Supermarket',
  'Travel & Airlines',
  'Utilities & Bills',
  'Restaurants',
  'Department Store'
];

export const DEVICE_TYPES = [
  'Known Mobile (iOS)',
  'Known Mobile (Android)',
  'Known Desktop (Chrome)',
  'New Unrecognized Device',
  'Rooted/Jailbroken Phone',
  'Headless Browser / Bot'
];

// Helper ML calculation engine mirroring Random Forest model
export function evaluateTransactionRisk(tx: Partial<Transaction>): {
  prediction: 'Legitimate' | 'Suspicious' | 'Fraudulent';
  fraudProbability: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  recommendation: string;
} {
  const amount = Number(tx.amount || 0);
  const failed = Number(tx.failedTransactions || 0);
  const prevFraud = Number(tx.previousFraudCount || 0);
  const freq = Number(tx.transactionFrequency || 1);
  const age = Number(tx.accountAge || 12);
  const location = tx.location || 'New York, US';
  const device = tx.deviceType || 'Known Mobile (iOS)';
  const merchant = tx.merchantCategory || 'Grocery & Supermarket';
  const type = tx.transactionType || 'Online Checkout';

  let score = 5;
  const factors: string[] = [];

  // 1. Transaction Amount Anomaly
  if (amount > 7000) {
    score += 34;
    factors.push(`Unusual high-value amount ($${amount.toLocaleString()})`);
  } else if (amount > 2500) {
    score += 20;
    factors.push(`Elevated transaction volume ($${amount.toLocaleString()})`);
  } else if (amount > 800) {
    score += 8;
  }

  // 2. High-Risk Geolocation / IP
  if (['High-Risk IP Proxy', 'Lagos, NG', 'Moscow, RU'].includes(location)) {
    score += 28;
    factors.push(`Anomalous / high-risk origin location (${location})`);
  }

  // 3. Device Anomaly
  if (['Rooted/Jailbroken Phone', 'Headless Browser / Bot'].includes(device)) {
    score += 35;
    factors.push(`Compromised or automated device signature (${device})`);
  } else if (device === 'New Unrecognized Device') {
    score += 14;
    factors.push('New unrecognized hardware device fingerprint');
  }

  // 4. Merchant Category Risk
  if (['Crypto & Gambling', 'Jewelry & Luxury'].includes(merchant)) {
    score += 18;
    factors.push(`High-liquidity merchant category (${merchant})`);
  }

  // 5. Failed Authentication Strikes
  if (failed >= 3) {
    score += 28;
    factors.push(`Multiple recent failed auth/PIN attempts (${failed} failures)`);
  } else if (failed >= 1) {
    score += 10;
    factors.push(`Previous authentication retry attempt`);
  }

  // 6. Past Fraud Records
  if (prevFraud > 0) {
    score += 22;
    factors.push(`Customer account has ${prevFraud} past fraud strike(s)`);
  }

  // 7. Transaction Velocity
  if (freq > 4.5) {
    score += 16;
    factors.push(`Rapid transaction velocity burst (${freq} txs/hr)`);
  }

  // 8. Account Tenancy
  if (age < 3) {
    score += 12;
    factors.push(`New customer relationship tenure (< 3 months)`);
  }

  // High-Risk Type
  if (type === 'Crypto Exchange' || (type === 'Wire Transfer' && amount > 3000)) {
    score += 12;
    factors.push(`Irrevocable settlement transfer channel (${type})`);
  }

  score = Math.min(99, Math.max(2, score));
  const probability = Math.round((score / 100) * 1000) / 1000;

  let prediction: 'Legitimate' | 'Suspicious' | 'Fraudulent';
  let riskLevel: 'Low' | 'Medium' | 'High';
  let recommendation = '';

  if (score >= 70) {
    prediction = 'Fraudulent';
    riskLevel = 'High';
    recommendation = 'IMMEDIATE ACTION: Halt settlement, freeze digital access, and route to Senior Fraud Analyst.';
  } else if (score >= 35) {
    prediction = 'Suspicious';
    riskLevel = 'Medium';
    recommendation = 'STEP-UP AUTHENTICATION: Dispatch push notification / out-of-band biometric challenge.';
  } else {
    prediction = 'Legitimate';
    riskLevel = 'Low';
    recommendation = 'AUTOMATED APPROVAL: Standard clearing pipeline without customer friction.';
  }

  return {
    prediction,
    fraudProbability: probability,
    riskScore: score,
    riskLevel,
    riskFactors: factors.length > 0 ? factors : ['Normal baseline pattern, verified device fingerprint'],
    recommendation
  };
}

// Generate realistic synthetic transactions for demo state
export function generateInitialTransactions(count = 160): Transaction[] {
  const list: Transaction[] = [];
  const baseTime = new Date('2026-10-04T12:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const isFraudulentCandidate = i % 6 === 0 || (i % 11 === 0);
    const isSuspiciousCandidate = !isFraudulentCandidate && (i % 7 === 0 || i % 9 === 0);

    const txType = isFraudulentCandidate
      ? (i % 2 === 0 ? 'Wire Transfer' : 'Crypto Exchange')
      : TRANSACTION_TYPES[i % TRANSACTION_TYPES.length];

    const location = isFraudulentCandidate
      ? (i % 3 === 0 ? 'High-Risk IP Proxy' : (i % 2 === 0 ? 'Lagos, NG' : 'Moscow, RU'))
      : SAMPLE_LOCATIONS[i % SAMPLE_LOCATIONS.length];

    const device = isFraudulentCandidate
      ? (i % 2 === 0 ? 'Rooted/Jailbroken Phone' : 'Headless Browser / Bot')
      : (isSuspiciousCandidate ? 'New Unrecognized Device' : DEVICE_TYPES[i % 3]);

    const merchant = isFraudulentCandidate
      ? (i % 2 === 0 ? 'Jewelry & Luxury' : 'Crypto & Gambling')
      : MERCHANT_CATEGORIES[i % MERCHANT_CATEGORIES.length];

    let amount = 0;
    if (isFraudulentCandidate) {
      amount = Math.round((2800 + (i * 87) % 7200) * 100) / 100;
    } else if (isSuspiciousCandidate) {
      amount = Math.round((950 + (i * 45) % 1800) * 100) / 100;
    } else {
      amount = Math.round((12 + (i * 31) % 450) * 100) / 100;
    }

    const failed = isFraudulentCandidate ? (2 + (i % 3)) : (isSuspiciousCandidate ? 1 : 0);
    const prevFraud = isFraudulentCandidate ? (i % 2) : 0;
    const freq = isFraudulentCandidate ? (4.2 + (i % 4) * 0.8) : (0.4 + (i % 3) * 0.5);
    const age = isFraudulentCandidate ? (1 + (i % 4)) : (12 + (i % 60));

    const offsetHours = (count - i) * 0.4;
    const txTime = new Date(baseTime - offsetHours * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const baseTx = {
      transactionId: `TXN-${100000 + i}`,
      customerId: `CUST-${1000 + (i % 40)}`,
      amount,
      transactionType: txType,
      transactionTime: txTime,
      accountAge: age,
      location,
      merchantCategory: merchant,
      deviceType: device,
      previousTransactions: 10 + (i % 50),
      previousFraudCount: prevFraud,
      transactionFrequency: Math.round(freq * 10) / 10,
      failedTransactions: failed
    };

    const evaluation = evaluateTransactionRisk(baseTx);

    list.push({
      id: `tx-${i}`,
      ...baseTx,
      isFraud: evaluation.prediction === 'Fraudulent' ? 1 : 0,
      prediction: evaluation.prediction,
      fraudProbability: evaluation.fraudProbability,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      status: evaluation.prediction === 'Fraudulent' ? 'Flagged' : (evaluation.prediction === 'Suspicious' ? 'Pending Review' : 'Approved'),
      riskFactors: evaluation.riskFactors
    });
  }

  return list;
}
