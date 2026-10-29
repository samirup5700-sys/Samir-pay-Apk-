import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import {
  UserProfile,
  Contact,
  Transaction,
  PaymentPayload,
  UPIVerificationResponse,
} from '../types/payment';
import {
  getLocalUser,
  saveLocalUser,
  getLocalContacts,
  saveLocalContacts,
  getLocalTransactions,
  saveLocalTransactions,
  resetLocalStorage,
} from './storage';

// Initialize native Capacitor features when running on Android
export async function initCapacitor(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#059669' });
      await SplashScreen.hide();

      // Native Android hardware back button handler
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          // Minimize app rather than crash
          CapApp.minimizeApp();
        }
      });
    } catch (e) {
      console.warn('Capacitor native init warning:', e);
    }
  }
}

function generateUTR(): string {
  const prefix = '4' + Math.floor(100 + Math.random() * 900);
  const suffix = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${suffix}`;
}

export const api = {
  // Fetch user profile
  async getUser(): Promise<UserProfile> {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          saveLocalUser(data.data);
          return data.data;
        }
      }
    } catch {
      // Offline / standalone APK fallback
    }
    return getLocalUser();
  },

  // Fetch contacts
  async getContacts(): Promise<Contact[]> {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          saveLocalContacts(data.data);
          return data.data;
        }
      }
    } catch {
      // Offline fallback
    }
    return getLocalContacts();
  },

  // Fetch transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          saveLocalTransactions(data.data);
          return data.data;
        }
      }
    } catch {
      // Offline fallback
    }
    return getLocalTransactions();
  },

  // Verify VPA
  async verifyVpa(upiId: string): Promise<UPIVerificationResponse> {
    try {
      const res = await fetch('/api/verify-vpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    const clean = upiId.trim().toLowerCase();
    const parts = clean.split('@');
    const local = parts[0].replace(/[._-]/g, ' ');
    const formatted = local
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Registered Payee';

    return {
      valid: clean.includes('@'),
      registeredName: formatted,
      upiId: clean,
      message: 'Verified Payee (Offline Match)',
    };
  },

  // Send Money / Execute Payment
  async pay(payload: PaymentPayload): Promise<{
    success: boolean;
    message?: string;
    transaction?: Transaction;
    remainingBalance?: number;
  }> {
    try {
      const res = await fetch('/api/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Also update local storage cache
        const txs = getLocalTransactions();
        txs.unshift(data.transaction);
        saveLocalTransactions(txs);
        return data;
      } else if (!res.ok) {
        return { success: false, message: data.message || 'Payment declined' };
      }
    } catch {
      // Offline / standalone APK execution
    }

    // Local standalone execution
    const user = getLocalUser();
    const bank =
      user.linkedBanks.find((b) => b.id === payload.bankAccountId) ||
      user.linkedBanks.find((b) => b.isPrimary) ||
      user.linkedBanks[0];

    if (!payload.simulateError && bank && bank.balance < payload.amount) {
      return {
        success: false,
        message: `Insufficient balance in ${bank.bankName}. Available: ₹${bank.balance.toFixed(2)}`,
      };
    }

    if (payload.simulateError) {
      const utr = generateUTR();
      const failedTx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceId: `UPI/${utr}`,
        utrNumber: utr,
        amount: payload.amount,
        type: 'DEBIT',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        recipientName: payload.recipientName,
        recipientUpiId: payload.recipientUpiId,
        senderName: user.name,
        senderUpiId: user.primaryUpiId,
        category: payload.paymentMode === 'QR_CODE' ? 'MERCHANT' : 'TRANSFER',
        note: payload.note || '',
        paymentMode: payload.paymentMode,
        debitedBank: bank ? `${bank.bankName} (XX${bank.accountNumberLast4})` : 'Demo Bank',
      };
      const txs = getLocalTransactions();
      txs.unshift(failedTx);
      saveLocalTransactions(txs);
      return {
        success: false,
        message: 'Payment declined by beneficiary bank (Simulated Test).',
        transaction: failedTx,
      };
    }

    if (bank) {
      bank.balance = Math.max(0, Math.round((bank.balance - payload.amount) * 100) / 100);
    }
    user.demoBalance = Math.round(
      user.linkedBanks.reduce((sum, b) => sum + b.balance, 0) * 100
    ) / 100;
    saveLocalUser(user);

    const utr = generateUTR();
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: `UPI/${utr}`,
      utrNumber: utr,
      amount: payload.amount,
      type: 'DEBIT',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      recipientName: payload.recipientName,
      recipientUpiId: payload.recipientUpiId,
      senderName: user.name,
      senderUpiId: user.primaryUpiId,
      category: payload.paymentMode === 'QR_CODE' ? 'MERCHANT' : 'TRANSFER',
      note: payload.note || '',
      paymentMode: payload.paymentMode,
      debitedBank: bank ? `${bank.bankName} (XX${bank.accountNumberLast4})` : 'Primary Bank',
    };

    const txs = getLocalTransactions();
    txs.unshift(newTx);
    saveLocalTransactions(txs);

    return {
      success: true,
      message: 'Payment Successful',
      transaction: newTx,
      remainingBalance: user.demoBalance,
    };
  },

  // Inbound Payment Simulation
  async receiveSimulation(params: {
    amount: number;
    senderName?: string;
    senderUpiId?: string;
    note?: string;
  }): Promise<{ success: boolean; transaction: Transaction; newBalance: number }> {
    try {
      const res = await fetch('/api/payments/receive-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const txs = getLocalTransactions();
          txs.unshift(data.transaction);
          saveLocalTransactions(txs);
          return data;
        }
      }
    } catch {
      // Offline fallback
    }

    const user = getLocalUser();
    const primaryBank = user.linkedBanks.find((b) => b.isPrimary) || user.linkedBanks[0];
    if (primaryBank) {
      primaryBank.balance = Math.round((primaryBank.balance + params.amount) * 100) / 100;
    }
    user.demoBalance = user.linkedBanks.reduce((sum, b) => sum + b.balance, 0);
    saveLocalUser(user);

    const utr = generateUTR();
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: `UPI/${utr}`,
      utrNumber: utr,
      amount: params.amount,
      type: 'CREDIT',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      recipientName: user.name,
      recipientUpiId: user.primaryUpiId,
      senderName: params.senderName || 'Ananya Gupta',
      senderUpiId: params.senderUpiId || 'ananya.g@oksbi',
      category: 'TRANSFER',
      note: params.note || 'Payment received via Samir Pay QR',
      paymentMode: 'QR_CODE',
      creditedBank: primaryBank
        ? `${primaryBank.bankName} (XX${primaryBank.accountNumberLast4})`
        : 'Primary Bank',
    };

    const txs = getLocalTransactions();
    txs.unshift(newTx);
    saveLocalTransactions(txs);

    return {
      success: true,
      transaction: newTx,
      newBalance: user.demoBalance,
    };
  },

  // Reset demo data
  async reset(): Promise<UserProfile> {
    try {
      await fetch('/api/user/reset', { method: 'POST' });
    } catch {
      // ignore
    }
    const { user } = resetLocalStorage();
    return user;
  },
};
