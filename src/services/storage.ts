import { UserProfile, Contact, Transaction } from '../types/payment';

const STORAGE_KEYS = {
  USER: 'samirpay_user_profile',
  CONTACTS: 'samirpay_contacts',
  TRANSACTIONS: 'samirpay_transactions',
};

export const INITIAL_BANKS = [
  {
    id: 'bank-1',
    bankName: 'State Bank of India',
    accountNumberLast4: '4892',
    ifsc: 'SBIN0001824',
    accountType: 'SAVINGS' as const,
    balance: 24850.50,
    isPrimary: true,
    bankLogoColor: '#005b9f',
  },
  {
    id: 'bank-2',
    bankName: 'HDFC Bank',
    accountNumberLast4: '7103',
    ifsc: 'HDFC0000492',
    accountType: 'SAVINGS' as const,
    balance: 12400.00,
    isPrimary: false,
    bankLogoColor: '#004c8f',
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'usr_samir_01',
  name: 'Samir Patel',
  email: 'samir8787087680@gmail.com',
  phone: '+91 87870 87680',
  primaryUpiId: 'samir@samirpay',
  secondaryUpiIds: ['samir@okhdfcbank', '8787087680@upi'],
  kycStatus: 'VERIFIED',
  demoBalance: 37250.50,
  isDemoMode: true,
  linkedBanks: INITIAL_BANKS,
};

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt_1',
    name: 'Rahul Sharma',
    upiId: 'rahul.sharma@okhdfcbank',
    phone: '+91 98201 12345',
    avatarColor: '#10B981',
    initials: 'RS',
    isFavorite: true,
    recentAmount: 500,
  },
  {
    id: 'cnt_2',
    name: 'Priya Verma',
    upiId: 'priya.v@samirpay',
    phone: '+91 97112 54321',
    avatarColor: '#059669',
    initials: 'PV',
    isFavorite: true,
    recentAmount: 1200,
  },
  {
    id: 'cnt_3',
    name: 'Blue Tokai Coffee',
    upiId: 'bluetokai@icici',
    phone: '+91 80492 88123',
    avatarColor: '#047857',
    initials: 'BT',
    isFavorite: true,
    recentAmount: 240,
  },
  {
    id: 'cnt_4',
    name: 'Aman Gupta',
    upiId: 'aman.gupta@oksbi',
    phone: '+91 99887 76655',
    avatarColor: '#065F46',
    initials: 'AG',
    isFavorite: false,
    recentAmount: 2000,
  },
  {
    id: 'cnt_5',
    name: 'Sharma General Store',
    upiId: 'sharmastore@paytm',
    phone: '+91 98765 43210',
    avatarColor: '#10B981',
    initials: 'SG',
    isFavorite: false,
    recentAmount: 645,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    referenceId: 'UPI/430192847101',
    utrNumber: '430192847101',
    amount: 500,
    type: 'DEBIT',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    recipientName: 'Rahul Sharma',
    recipientUpiId: 'rahul.sharma@okhdfcbank',
    senderName: 'Samir Patel',
    senderUpiId: 'samir@samirpay',
    category: 'TRANSFER',
    note: 'Weekend lunch split',
    paymentMode: 'UPI_ID',
    debitedBank: 'State Bank of India (XX4892)',
  },
  {
    id: 'tx_02',
    referenceId: 'UPI/430182746192',
    utrNumber: '430182746192',
    amount: 2500,
    type: 'CREDIT',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    recipientName: 'Samir Patel',
    recipientUpiId: 'samir@samirpay',
    senderName: 'Neha Kapoor',
    senderUpiId: 'neha.k@oksbi',
    category: 'TRANSFER',
    note: 'Freelance design gig advance',
    paymentMode: 'QR_CODE',
    creditedBank: 'State Bank of India (XX4892)',
  },
  {
    id: 'tx_03',
    referenceId: 'UPI/430172635183',
    utrNumber: '430172635183',
    amount: 240,
    type: 'DEBIT',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    recipientName: 'Blue Tokai Coffee',
    recipientUpiId: 'bluetokai@icici',
    senderName: 'Samir Patel',
    senderUpiId: 'samir@samirpay',
    category: 'MERCHANT',
    note: 'Iced Latte & Croissant',
    paymentMode: 'QR_CODE',
    debitedBank: 'State Bank of India (XX4892)',
  },
  {
    id: 'tx_04',
    referenceId: 'UPI/430162524174',
    utrNumber: '430162524174',
    amount: 1450,
    type: 'DEBIT',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    recipientName: 'Tata Power DDL',
    recipientUpiId: 'tatapower@billdesk',
    senderName: 'Samir Patel',
    senderUpiId: 'samir@samirpay',
    category: 'BILL_PAYMENT',
    note: 'Electricity Bill for Oct',
    paymentMode: 'UPI_ID',
    debitedBank: 'HDFC Bank (XX7103)',
  },
  {
    id: 'tx_05',
    referenceId: 'UPI/430152413165',
    utrNumber: '430152413165',
    amount: 645,
    type: 'DEBIT',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    recipientName: 'Sharma General Store',
    recipientUpiId: 'sharmastore@paytm',
    senderName: 'Samir Patel',
    senderUpiId: 'samir@samirpay',
    category: 'MERCHANT',
    note: 'Daily Groceries & Milk',
    paymentMode: 'QR_CODE',
    debitedBank: 'State Bank of India (XX4892)',
  },
];

export function getLocalUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_USER;
}

export function saveLocalUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function getLocalContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_CONTACTS;
}

export function saveLocalContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch {
    // ignore
  }
}

export function getLocalTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_TRANSACTIONS;
}

export function saveLocalTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch {
    // ignore
  }
}

export function resetLocalStorage(): {
  user: UserProfile;
  contacts: Contact[];
  transactions: Transaction[];
} {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch {
    // ignore
  }
  return {
    user: INITIAL_USER,
    contacts: INITIAL_CONTACTS,
    transactions: INITIAL_TRANSACTIONS,
  };
}
