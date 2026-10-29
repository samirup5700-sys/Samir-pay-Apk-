export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionCategory = 'TRANSFER' | 'MERCHANT' | 'RECHARGE' | 'BILL_PAYMENT' | 'SELF';
export type PaymentMode = 'UPI_ID' | 'QR_CODE' | 'PHONE' | 'BANK_TRANSFER';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumberLast4: string;
  ifsc: string;
  accountType: 'SAVINGS' | 'CURRENT';
  balance: number;
  isPrimary: boolean;
  bankLogoColor: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  primaryUpiId: string;
  secondaryUpiIds: string[];
  avatarUrl?: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  demoBalance: number;
  isDemoMode: boolean;
  linkedBanks: BankAccount[];
}

export interface Contact {
  id: string;
  name: string;
  upiId: string;
  phone: string;
  avatarColor: string;
  initials: string;
  isFavorite?: boolean;
  recentAmount?: number;
}

export interface Transaction {
  id: string;
  referenceId: string; // UPI/xxxx
  utrNumber: string; // 12-digit UTR
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: string; // ISO string
  recipientName: string;
  recipientUpiId: string;
  senderName: string;
  senderUpiId: string;
  category: TransactionCategory;
  note?: string;
  paymentMode: PaymentMode;
  debitedBank?: string;
  creditedBank?: string;
}

export interface UPIVerificationResponse {
  valid: boolean;
  registeredName?: string;
  upiId: string;
  isMerchant?: boolean;
  message?: string;
}

export interface PaymentPayload {
  recipientUpiId: string;
  recipientName: string;
  amount: number;
  note?: string;
  paymentMode: PaymentMode;
  bankAccountId: string;
  upiPin: string;
  simulateError?: boolean;
}

export interface IntegrationChecklist {
  framework: string;
  npciCompliance: {
    upiVersion: string;
    vpaFormatCompliant: boolean;
    utrGeneration: boolean;
    qrFormat: string;
  };
  pspReadiness: {
    provider: string;
    status: 'DEMO_SANDBOX' | 'AWAITING_APPROVAL' | 'PRODUCTION_ACTIVE';
    requirements: { title: string; completed: boolean; desc: string }[];
  };
}
