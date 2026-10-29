import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  RotateCcw,
  ExternalLink,
  Check,
  ChevronRight,
  Info,
  CreditCard,
  QrCode,
  Fingerprint,
} from 'lucide-react';
import { UserProfile, BankAccount } from '../types/payment';
import { formatINR } from '../utils/upi';
import { sound } from '../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetDemo: () => void;
  onOpenIntegrationInfo: () => void;
  onOpenApkModal: () => void;
  onOpenReceive: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetDemo,
  onOpenIntegrationInfo,
  onOpenApkModal,
  onOpenReceive,
}) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState<boolean>(true);
  const [checkedBankId, setCheckedBankId] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSetPrimaryBank = async (bankId: string) => {
    sound.playKeypadTick();
    try {
      const res = await fetch('/api/user/bank/primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUser({ linkedBanks: data.data });
      }
    } catch {
      // Fallback local update
      const updatedBanks = user.linkedBanks.map((b) => ({
        ...b,
        isPrimary: b.id === bankId,
      }));
      onUpdateUser({ linkedBanks: updatedBanks });
    }
  };

  const handleSimulateBalanceCheck = (bank: BankAccount) => {
    sound.playKeypadTick();
    setCheckedBankId(bank.id);
    setTimeout(() => {
      setCheckedBankId(null);
    }, 4000);
  };

  const handleSimulatePinChange = () => {
    sound.playSuccessChime();
    setPinChangeSuccess(true);
    setTimeout(() => {
      setPinChangeSuccess(false);
      setShowPinModal(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">User Profile & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
          {/* User Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/80 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-emerald-700/20">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 truncate">{user.name}</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  KYC VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">{user.phone}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
            </div>
          </div>

          {/* UPI ID Management */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                UPI IDs (VPA)
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenReceive();
                }}
                className="text-xs font-semibold text-emerald-700 flex items-center gap-1 hover:text-emerald-800"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {user.primaryUpiId}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 ml-2 px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                </div>
              </div>

              {user.secondaryUpiIds.map((vpa) => (
                <div
                  key={vpa}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-mono text-slate-600">{vpa}</span>
                  <span className="text-[10px] text-slate-500">Secondary</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Bank Accounts */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Linked Bank Accounts
            </h4>

            <div className="space-y-2.5">
              {user.linkedBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{bank.bankName}</h5>
                        <p className="text-[11px] text-slate-500 font-mono">
                          A/C No: •••• {bank.accountNumberLast4} · {bank.accountType}
                        </p>
                      </div>
                    </div>

                    {bank.isPrimary ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        PRIMARY
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimaryBank(bank.id)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    {checkedBankId === bank.id ? (
                      <span className="font-mono font-bold text-emerald-700">
                        Balance: {formatINR(bank.balance)}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSimulateBalanceCheck(bank)}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Check Balance
                      </button>
                    )}
                    <button
                      onClick={() => setShowPinModal(true)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Change UPI PIN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & App Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Security & Preferences
            </h4>

            <div className="space-y-3 text-xs">
              {/* Biometrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-700" />
                  <span className="font-medium text-slate-700">Biometric / Screen Lock</span>
                </div>
                <input
                  type="checkbox"
                  checked={biometricsEnabled}
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {/* SMS Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span className="font-medium text-slate-700">SMS Transaction Alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* Android App & APK Installation */}
          <button
            onClick={() => {
              onClose();
              onOpenApkModal();
            }}
            className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-emerald-950">
                    Android App &amp; APK Package
                  </h5>
                  <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                    com.samirpay.app
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Install on phone or download APK via cloud builder
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>

          {/* Official NPCI UPI Integration Status Info */}
          <button
            onClick={onOpenIntegrationInfo}
            className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  NPCI UPI Integration Blueprint
                </h5>
                <p className="text-[11px] text-slate-500">
                  Readiness for Authorized Indian Payment Aggregators
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              sound.playKeypadTick();
              if (window.confirm('Reset all demo transactions and restore default balances?')) {
                onResetDemo();
                onClose();
              }
            }}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Transactions & Balances</span>
          </button>
        </div>

        {/* Change UPI PIN Simulator Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Set New UPI PIN</h4>
              {pinChangeSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>UPI PIN Updated Successfully!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Enter OTP sent to {user.phone.slice(-4)}:
                  </p>
                  <input
                    type="password"
                    maxLength={6}
                    defaultValue="849201"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-mono text-sm tracking-widest"
                  />
                  <p className="text-xs text-slate-500">Enter New 4-digit UPI PIN:</p>
                  <input
                    type="password"
                    maxLength={4}
                    defaultValue="4892"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-mono text-sm tracking-widest"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowPinModal(false)}
                      className="flex-1 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSimulatePinChange}
                      className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
