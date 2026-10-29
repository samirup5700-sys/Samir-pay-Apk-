import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { Header } from './components/Header';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { SendMoneyModal } from './components/SendMoneyModal';
import { ReceiveMoneyModal } from './components/ReceiveMoneyModal';
import { QRScannerModal } from './components/QRScannerModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BillRechargeModal } from './components/BillRechargeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { IntegrationInfoModal } from './components/IntegrationInfoModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { SamirPayLogo } from './components/SamirPayLogo';
import { UserProfile, Contact, Transaction } from './types/payment';
import { sound } from './utils/audio';
import { api, initCapacitor } from './services/api';

// Fallback initial data in case server is starting up
const FALLBACK_USER: UserProfile = {
  id: 'usr_samir_01',
  name: 'Samir Patel',
  email: 'samir8787087680@gmail.com',
  phone: '+91 87870 87680',
  primaryUpiId: 'samir@samirpay',
  secondaryUpiIds: ['samir@okhdfcbank', '8787087680@upi'],
  kycStatus: 'VERIFIED',
  demoBalance: 37250.50,
  isDemoMode: true,
  linkedBanks: [
    {
      id: 'bank-1',
      bankName: 'State Bank of India',
      accountNumberLast4: '4892',
      ifsc: 'SBIN0001824',
      accountType: 'SAVINGS',
      balance: 24850.50,
      isPrimary: true,
      bankLogoColor: '#005b9f',
    },
    {
      id: 'bank-2',
      bankName: 'HDFC Bank',
      accountNumberLast4: '7103',
      ifsc: 'HDFC0000492',
      accountType: 'SAVINGS',
      balance: 12400.00,
      isPrimary: false,
      bankLogoColor: '#004c8f',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile>(FALLBACK_USER);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal visibility states
  const [isSendOpen, setIsSendOpen] = useState<boolean>(false);
  const [sendMode, setSendMode] = useState<'UPI_ID' | 'PHONE' | 'BANK_TRANSFER'>('UPI_ID');
  const [sendPrefill, setSendPrefill] = useState<{
    upiId?: string;
    name?: string;
    phone?: string;
    amount?: number;
    note?: string;
  } | undefined>(undefined);

  const [isReceiveOpen, setIsReceiveOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isIntegrationInfoOpen, setIsIntegrationInfoOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Utility Bill Payment modal
  const [billModalCategory, setBillModalCategory] = useState<
    'MOBILE' | 'ELECTRICITY' | 'FASTAG' | 'DTH' | null
  >(null);

  const [unreadNotifications, setUnreadNotifications] = useState<number>(2);

  // Load app state with hybrid API + local cache fallback
  const loadAppState = async () => {
    try {
      const [userData, contactsData, txData] = await Promise.all([
        api.getUser(),
        api.getContacts(),
        api.getTransactions(),
      ]);

      setUser(userData);
      setContacts(contactsData);
      setTransactions(txData);
    } catch (err) {
      console.warn('App state load warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initCapacitor();
    loadAppState();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Bottom Navigation tab selection
  const handleNavTab = (tab: NavTab) => {
    sound.playKeypadTick();
    setActiveTab(tab);

    if (tab === 'send') {
      setSendMode('UPI_ID');
      setSendPrefill(undefined);
      setIsSendOpen(true);
    } else if (tab === 'receive') {
      setIsReceiveOpen(true);
    } else if (tab === 'history') {
      setSelectedTxForReceipt(null);
      setIsHistoryOpen(true);
    } else if (tab === 'profile') {
      setIsProfileOpen(true);
    }
  };

  // Open send money with prefill
  const handleOpenSend = (
    mode: 'UPI_ID' | 'PHONE' | 'BANK_TRANSFER' = 'UPI_ID',
    prefill?: { upiId?: string; name?: string; phone?: string; amount?: number; note?: string }
  ) => {
    sound.playKeypadTick();
    setSendMode(mode);
    setSendPrefill(prefill);
    setIsSendOpen(true);
  };

  // Handle successful outbound payment
  const handlePaymentComplete = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    // Refresh user balance from backend
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      });
    showToast(`Payment of ₹${newTx.amount} Successful!`);
  };

  // Handle inbound payment received
  const handlePaymentReceived = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      });
    showToast(`Received ₹${newTx.amount} on Samir Pay!`);
  };

  // QR Code scanned successfully
  const handleScanSuccess = (scanned: {
    upiId: string;
    name?: string;
    amount?: number;
    note?: string;
  }) => {
    handleOpenSend('UPI_ID', {
      upiId: scanned.upiId,
      name: scanned.name,
      amount: scanned.amount,
      note: scanned.note,
    });
  };

  // Reset Demo state
  const handleResetDemo = async () => {
    try {
      const resetUser = await api.reset();
      setUser(resetUser);
      await loadAppState();
      showToast('Demo balances and transactions reset.');
    } catch {
      showToast('Demo data reset.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-700 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <SamirPayLogo size="xl" inverted showSubtitle />
        <div className="w-8 h-8 rounded-full border-2 border-emerald-300 border-t-white animate-spin mt-4" />
        <p className="text-xs text-emerald-100 font-medium tracking-wide">
          Securing Samir Pay Android Engine...
        </p>
      </div>
    );
  }

  return (
    <AndroidFrame>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-70 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenIntegrationInfo={() => setIsIntegrationInfoOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        unreadCount={unreadNotifications}
      />

      {/* Main Home Screen Feed */}
      <main className="flex-1">
        <HomeScreen
          user={user}
          contacts={contacts}
          transactions={transactions}
          onOpenSend={handleOpenSend}
          onOpenReceive={() => setIsReceiveOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenHistory={() => {
            setSelectedTxForReceipt(null);
            setIsHistoryOpen(true);
          }}
          onOpenBillPayment={(cat) => setBillModalCategory(cat)}
          onOpenIntegrationInfo={() => setIsIntegrationInfoOpen(true)}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          onSelectTransaction={(tx) => {
            setSelectedTxForReceipt(tx);
            setIsHistoryOpen(true);
          }}
        />
      </main>

      {/* Android Bottom Navigation Tab Bar */}
      <BottomNavBar activeTab={activeTab} onChangeTab={handleNavTab} />

      {/* MODALS */}

      {/* 1. Send Money Modal */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => {
          setIsSendOpen(false);
          setActiveTab('home');
        }}
        user={user}
        contacts={contacts}
        initialMode={sendMode}
        initialPrefill={sendPrefill}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* 2. Receive Money Modal */}
      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => {
          setIsReceiveOpen(false);
          setActiveTab('home');
        }}
        user={user}
        onPaymentReceived={handlePaymentReceived}
      />

      {/* 3. QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* 4. Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setSelectedTxForReceipt(null);
          setActiveTab('home');
        }}
        transactions={transactions}
        initialSelectedTx={selectedTxForReceipt}
        onRepeatPayment={(tx) => {
          setIsHistoryOpen(false);
          handleOpenSend('UPI_ID', {
            upiId: tx.recipientUpiId,
            name: tx.recipientName,
            amount: tx.amount,
            note: tx.note,
          });
        }}
      />

      {/* 5. User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setActiveTab('home');
        }}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onResetDemo={handleResetDemo}
        onOpenIntegrationInfo={() => {
          setIsProfileOpen(false);
          setIsIntegrationInfoOpen(true);
        }}
        onOpenApkModal={() => {
          setIsProfileOpen(false);
          setIsApkModalOpen(true);
        }}
        onOpenReceive={() => {
          setIsProfileOpen(false);
          setIsReceiveOpen(true);
        }}
      />

      {/* 6. Utility Bill & Recharge Modal */}
      {billModalCategory && (
        <BillRechargeModal
          isOpen={!!billModalCategory}
          onClose={() => setBillModalCategory(null)}
          category={billModalCategory}
          onProceedToPay={(bill) => {
            setBillModalCategory(null);
            handleOpenSend('UPI_ID', {
              upiId: bill.upiId,
              name: bill.name,
              amount: bill.amount,
              note: bill.note,
            });
          }}
        />
      )}

      {/* 7. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onClear={() => setUnreadNotifications(0)}
      />

      {/* 8. Official Integration & NPCI Specs Modal */}
      <IntegrationInfoModal
        isOpen={isIntegrationInfoOpen}
        onClose={() => setIsIntegrationInfoOpen(false)}
      />

      {/* 9. Android APK & Install Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </AndroidFrame>
  );
}
