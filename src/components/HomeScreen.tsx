import React, { useState } from 'react';
import {
  QrCode,
  ArrowUpRight,
  Smartphone,
  Building2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  Tv,
  Car,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { UserProfile, Contact, Transaction } from '../types/payment';
import { formatINR, formatTxDate } from '../utils/upi';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  user: UserProfile;
  contacts: Contact[];
  transactions: Transaction[];
  onOpenSend: (mode?: 'UPI_ID' | 'PHONE' | 'BANK_TRANSFER', prefill?: { upiId?: string; name?: string; phone?: string; amount?: number }) => void;
  onOpenReceive: () => void;
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onOpenBillPayment: (category: 'MOBILE' | 'ELECTRICITY' | 'FASTAG' | 'DTH') => void;
  onOpenIntegrationInfo: () => void;
  onOpenApkModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  contacts,
  transactions,
  onOpenSend,
  onOpenReceive,
  onOpenScanner,
  onOpenHistory,
  onOpenBillPayment,
  onOpenIntegrationInfo,
  onOpenApkModal,
  onSelectTransaction,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(user.primaryUpiId);
    setCopiedUpi(true);
    sound.playKeypadTick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const recentTransactions = transactions.slice(0, 5);
  const primaryBank = user.linkedBanks.find((b) => b.isPrimary) || user.linkedBanks[0];

  return (
    <div className="pb-24 pt-2 px-4 max-w-lg mx-auto space-y-4">
      {/* 1. Green Hero Card: Balance & User VPA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white p-5 shadow-lg shadow-emerald-800/15">
        {/* Decorative subtle ambient curves */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: User Name & Demo Tag */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100 font-medium tracking-wide">Welcome back</p>
              <h2 className="text-lg font-bold tracking-tight text-white">{user.name}</h2>
            </div>
            <button
              onClick={onOpenReceive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold text-white transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-200" />
              <span>My QR</span>
            </button>
          </div>

          {/* Balance Display */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-100 font-medium">Available Balance (Demo)</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-emerald-200 hover:text-white transition-colors p-1"
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums">
                {showBalance ? formatINR(user.demoBalance) : '₹ •••••••'}
              </span>
              {primaryBank && (
                <span className="text-[11px] text-emerald-200 font-medium">
                  via {primaryBank.bankName.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Bar: Primary UPI ID with Copy Button */}
          <div className="pt-2 border-t border-emerald-600/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-100">
              <span className="text-emerald-200 font-medium">UPI ID:</span>
              <span className="font-mono font-medium text-white select-all">{user.primaryUpiId}</span>
            </div>
            <button
              onClick={handleCopyUpi}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors"
              title="Copy UPI ID"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary 4-Action Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Transfer Money
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Scan Any QR */}
          <button
            onClick={onOpenScanner}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <QrCode className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2 text-center leading-tight">
              Scan QR
            </span>
          </button>

          {/* Pay UPI ID */}
          <button
            onClick={() => onOpenSend('UPI_ID')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold font-mono">@</span>
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2 text-center leading-tight">
              To UPI ID
            </span>
          </button>

          {/* To Mobile / Contact */}
          <button
            onClick={() => onOpenSend('PHONE')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <Smartphone className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2 text-center leading-tight">
              To Mobile
            </span>
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => onOpenSend('BANK_TRANSFER')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2 text-center leading-tight">
              To Bank A/C
            </span>
          </button>
        </div>
      </div>

      {/* 3. Quick Contacts Carousel */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Pay Contacts
          </h3>
          <button
            onClick={() => onOpenSend('PHONE')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            New Contact
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() =>
                onOpenSend('UPI_ID', {
                  upiId: contact.upiId,
                  name: contact.name,
                  phone: contact.phone,
                })
              }
              className="flex flex-col items-center shrink-0 w-16 group active:scale-95 transition-transform"
            >
              <div
                className="w-12 h-12 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-sm group-hover:ring-2 ring-emerald-500 transition-all"
                style={{ backgroundColor: contact.avatarColor }}
              >
                {contact.initials}
              </div>
              <span className="text-[11px] font-semibold text-slate-800 mt-1.5 text-center truncate w-full">
                {contact.name.split(' ')[0]}
              </span>
              {contact.recentAmount && (
                <span className="text-[10px] text-slate-500 tabular-nums">
                  ₹{contact.recentAmount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Utility Recharges & Bill Payments */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Recharge & Pay Bills
          </h3>
          <span className="text-[11px] text-slate-500">BBPS Enabled</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Mobile Recharge */}
          <button
            onClick={() => onOpenBillPayment('MOBILE')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center">
              Mobile
            </span>
          </button>

          {/* Electricity */}
          <button
            onClick={() => onOpenBillPayment('ELECTRICITY')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center">
              Electricity
            </span>
          </button>

          {/* FASTag */}
          <button
            onClick={() => onOpenBillPayment('FASTAG')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center">
              FASTag
            </span>
          </button>

          {/* DTH */}
          <button
            onClick={() => onOpenBillPayment('DTH')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center">
              DTH
            </span>
          </button>
        </div>
      </div>

      {/* 5. Android APK & Install Card */}
      <div
        onClick={onOpenApkModal}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-3.5 flex items-center justify-between shadow-md shadow-emerald-800/15 hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <img
            src="/pwa-192x192.png"
            alt="Samir Pay Icon"
            className="w-10 h-10 rounded-xl border border-white/20 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white">
                Get Samir Pay Android App
              </h4>
              <span className="text-[9px] font-bold bg-white text-emerald-800 px-1.5 py-0.2 rounded">
                APK
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              Install directly on your phone or build APK in cloud.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
      </div>

      {/* 6. NPCI / Official Integration Transparency Banner */}
      <div
        onClick={onOpenIntegrationInfo}
        className="cursor-pointer rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Demo Sandbox · NPCI UPI Ready
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Live money transfers require authorized PSP bank onboarding.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* 7. Recent Transactions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Recent Transactions
          </h3>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No transactions yet. Send or receive money to begin!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCredit ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[170px]">
                        {isCredit ? tx.senderName : tx.recipientName}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{formatTxDate(tx.timestamp)}</span>
                        <span>·</span>
                        <span>{tx.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                    <p className="text-[10px] text-slate-600 uppercase font-mono mt-0.5">
                      {tx.paymentMode.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
