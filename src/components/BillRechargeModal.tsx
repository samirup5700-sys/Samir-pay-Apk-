import React, { useState } from 'react';
import {
  X,
  Zap,
  Lightbulb,
  Car,
  Tv,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BillRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'MOBILE' | 'ELECTRICITY' | 'FASTAG' | 'DTH';
  onProceedToPay: (details: {
    upiId: string;
    name: string;
    amount: number;
    note: string;
  }) => void;
}

export const BillRechargeModal: React.FC<BillRechargeModalProps> = ({
  isOpen,
  onClose,
  category,
  onProceedToPay,
}) => {
  const [selectedBiller, setSelectedBiller] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [fetchedAmount, setFetchedAmount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  if (!isOpen) return null;

  const billerConfigs = {
    MOBILE: {
      title: 'Mobile Prepaid / Postpaid Recharge',
      icon: Zap,
      label: 'Mobile Number',
      placeholder: 'Enter 10-digit mobile number',
      billers: ['Jio Prepaid', 'Airtel India', 'Vi (Vodafone Idea)', 'BSNL Mobile'],
      defaultAmount: 299,
      note: 'Mobile Plan Recharge',
      vpa: 'recharge.jio@billdesk',
    },
    ELECTRICITY: {
      title: 'Electricity Bill Payment',
      icon: Lightbulb,
      label: 'Consumer / CA Number',
      placeholder: 'Enter 9 or 10-digit CA number',
      billers: ['Tata Power DDL', 'BSES Rajdhani', 'BESCOM Bengaluru', 'Adani Electricity Mumbai'],
      defaultAmount: 1450,
      note: 'Electricity Bill Payment',
      vpa: 'tatapower@billdesk',
    },
    FASTAG: {
      title: 'FASTag Toll Recharge',
      icon: Car,
      label: 'Vehicle Registration Number',
      placeholder: 'e.g. MH02AB1234',
      billers: ['ICICI Bank FASTag', 'Paytm Payments Bank FASTag', 'SBI FASTag', 'HDFC FASTag'],
      defaultAmount: 500,
      note: 'FASTag Instant Toll Recharge',
      vpa: 'fastag.icici@npci',
    },
    DTH: {
      title: 'DTH / Cable TV Recharge',
      icon: Tv,
      label: 'Subscriber ID / Smartcard Number',
      placeholder: 'Enter 10-digit Subscriber ID',
      billers: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'],
      defaultAmount: 380,
      note: 'DTH TV Subscription',
      vpa: 'tataplay@billdesk',
    },
  };

  const config = billerConfigs[category];
  const Icon = config.icon;

  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) return;

    sound.playKeypadTick();
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      setFetchedAmount(config.defaultAmount);
    }, 500);
  };

  const handlePay = () => {
    sound.playKeypadTick();
    onProceedToPay({
      upiId: config.vpa,
      name: selectedBiller || config.billers[0],
      amount: fetchedAmount || config.defaultAmount,
      note: `${config.note} (${accountNumber})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Choose Biller */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Operator / Provider
            </label>
            <select
              value={selectedBiller || config.billers[0]}
              onChange={(e) => setSelectedBiller(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
            >
              {config.billers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number Input */}
          <form onSubmit={handleFetchBill} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {config.label}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                placeholder={config.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {!fetchedAmount && (
              <button
                type="submit"
                disabled={!accountNumber || isFetching}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors"
              >
                {isFetching ? 'Fetching BBPS Bill...' : 'Fetch Bill / View Plans'}
              </button>
            )}
          </form>

          {/* Fetched Bill Preview */}
          {fetchedAmount && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-900 font-medium">Biller Verified (BBPS)</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  DUE NOW
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600 font-mono">{accountNumber}</span>
                <span className="text-2xl font-black text-emerald-700 tabular-nums">
                  ₹{fetchedAmount}
                </span>
              </div>

              <button
                onClick={handlePay}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Pay ₹{fetchedAmount} with UPI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
