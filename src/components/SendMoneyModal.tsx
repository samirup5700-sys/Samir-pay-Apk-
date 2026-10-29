import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  AtSign,
  Share2,
  Download,
  Loader2,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Contact, Transaction, BankAccount } from '../types/payment';
import { formatINR } from '../utils/upi';
import { sound } from '../utils/audio';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  contacts: Contact[];
  initialMode?: 'UPI_ID' | 'PHONE' | 'BANK_TRANSFER';
  initialPrefill?: {
    upiId?: string;
    name?: string;
    phone?: string;
    amount?: number;
    note?: string;
  };
  onPaymentComplete: (tx: Transaction) => void;
}

type Step = 'INPUT' | 'PIN_ENTRY' | 'PROCESSING' | 'SUCCESS' | 'FAILURE';

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  user,
  contacts,
  initialMode = 'UPI_ID',
  initialPrefill,
  onPaymentComplete,
}) => {
  const [mode, setMode] = useState<'UPI_ID' | 'PHONE' | 'BANK_TRANSFER'>(initialMode);
  const [step, setStep] = useState<Step>('INPUT');

  // Input states
  const [upiId, setUpiId] = useState<string>(initialPrefill?.upiId || '');
  const [recipientName, setRecipientName] = useState<string>(initialPrefill?.name || '');
  const [phone, setPhone] = useState<string>(initialPrefill?.phone || '');
  const [amount, setAmount] = useState<string>(initialPrefill?.amount ? String(initialPrefill.amount) : '');
  const [note, setNote] = useState<string>(initialPrefill?.note || '');
  const [selectedBankId, setSelectedBankId] = useState<string>(
    user.linkedBanks.find((b) => b.isPrimary)?.id || user.linkedBanks[0]?.id || ''
  );

  // Bank transfer specific
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccount, setConfirmAccount] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('SBIN0001824');
  const [ifscBankName, setIfscBankName] = useState<string>('State Bank of India');

  // Verification & Error states
  const [isVerifyingVpa, setIsVerifyingVpa] = useState<boolean>(false);
  const [vpaVerified, setVpaVerified] = useState<boolean>(false);
  const [vpaError, setVpaError] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const [simulateError, setSimulateError] = useState<boolean>(false);

  // PIN Keypad state
  const [pin, setPin] = useState<string>('');
  const PIN_LENGTH = 4; // 4-digit UPI PIN standard

  // Completed transaction result
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle prefill updates when modal opens
  useEffect(() => {
    if (initialPrefill) {
      if (initialPrefill.upiId) {
        setUpiId(initialPrefill.upiId);
        verifyVpa(initialPrefill.upiId);
      }
      if (initialPrefill.name) setRecipientName(initialPrefill.name);
      if (initialPrefill.phone) setPhone(initialPrefill.phone);
      if (initialPrefill.amount) setAmount(String(initialPrefill.amount));
      if (initialPrefill.note) setNote(initialPrefill.note);
    }
    if (initialMode) setMode(initialMode);
  }, [initialPrefill, initialMode, isOpen]);

  if (!isOpen) return null;

  // Selected debit bank
  const selectedBank =
    user.linkedBanks.find((b) => b.id === selectedBankId) || user.linkedBanks[0];

  // Quick VPA verification
  const verifyVpa = async (vpaToVerify: string) => {
    if (!vpaToVerify || !vpaToVerify.includes('@')) {
      setVpaVerified(false);
      return;
    }

    setIsVerifyingVpa(true);
    setVpaError('');

    try {
      const res = await fetch('/api/verify-vpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: vpaToVerify }),
      });
      const data = await res.json();
      if (data.valid) {
        setVpaVerified(true);
        if (data.registeredName && !recipientName) {
          setRecipientName(data.registeredName);
        }
      } else {
        setVpaVerified(false);
        setVpaError(data.message || 'Invalid UPI ID format');
      }
    } catch {
      setVpaVerified(true); // Fallback
    } finally {
      setIsVerifyingVpa(false);
    }
  };

  const handleAppendHandle = (handle: string) => {
    sound.playKeypadTick();
    const currentBase = upiId.includes('@') ? upiId.split('@')[0] : upiId;
    if (currentBase) {
      const newUpi = `${currentBase}${handle}`;
      setUpiId(newUpi);
      verifyVpa(newUpi);
    }
  };

  // Add quick amount chips
  const handleAddAmount = (add: number) => {
    sound.playKeypadTick();
    const current = parseFloat(amount) || 0;
    setAmount(String(current + add));
  };

  // Validate before proceeding to PIN
  const handleProceedToPin = () => {
    sound.playKeypadTick();
    setInputError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setInputError('Please enter a valid amount.');
      return;
    }

    if (numAmount > selectedBank.balance && !simulateError) {
      setInputError(`Amount exceeds available balance in ${selectedBank.bankName}.`);
      return;
    }

    if (mode === 'UPI_ID') {
      if (!upiId || !upiId.includes('@')) {
        setInputError('Please enter a valid recipient UPI ID.');
        return;
      }
    } else if (mode === 'PHONE') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setInputError('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!upiId) {
        // Auto synthesize UPI ID from phone
        setUpiId(`${cleanPhone.slice(-10)}@upi`);
      }
    } else if (mode === 'BANK_TRANSFER') {
      if (!accountNumber || accountNumber !== confirmAccount) {
        setInputError('Bank account numbers do not match.');
        return;
      }
      if (!ifsc) {
        setInputError('Please enter a valid IFSC code.');
        return;
      }
      if (!recipientName) {
        setInputError('Please enter Account Holder name.');
        return;
      }
      if (!upiId) {
        setUpiId(`${accountNumber}@${ifsc.toLowerCase()}.ifsc.npci`);
      }
    }

    setPin('');
    setStep('PIN_ENTRY');
  };

  // Keypad actions
  const handlePinDigit = (digit: string) => {
    sound.playKeypadTick();
    if (pin.length < PIN_LENGTH) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === PIN_LENGTH) {
        // Auto-submit when all digits filled
        setTimeout(() => executePayment(nextPin), 200);
      }
    }
  };

  const handlePinBackspace = () => {
    sound.playKeypadTick();
    setPin((prev) => prev.slice(0, -1));
  };

  // Submit payment
  const executePayment = async (submittedPin: string) => {
    setStep('PROCESSING');

    try {
      const targetUpi =
        mode === 'UPI_ID'
          ? upiId
          : mode === 'PHONE'
          ? `${phone.replace(/\D/g, '').slice(-10)}@upi`
          : `${accountNumber}@${ifsc.toLowerCase()}.ifsc.npci`;

      const targetName = recipientName || (mode === 'PHONE' ? `Contact (${phone})` : 'Payee');

      const res = await fetch('/api/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUpiId: targetUpi,
          recipientName: targetName,
          amount: parseFloat(amount),
          note,
          paymentMode: mode === 'PHONE' ? 'PHONE' : mode === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'UPI_ID',
          bankAccountId: selectedBankId,
          upiPin: submittedPin,
          simulateError,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCompletedTx(data.transaction);
        setStep('SUCCESS');
        sound.playSuccessChime();

        // Celebration confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
          });
        } catch {
          // ignore confetti if blocked
        }

        onPaymentComplete(data.transaction);
      } else {
        setErrorMessage(data.message || 'Payment failed. Please try again.');
        setStep('FAILURE');
      }
    } catch {
      setErrorMessage('Network error communicating with payment switch.');
      setStep('FAILURE');
    }
  };

  const handleShareReceipt = async () => {
    if (!completedTx) return;
    const shareText = `Samir Pay Payment Successful! \nAmount: ₹${completedTx.amount}\nTo: ${completedTx.recipientName}\nUPI Ref: ${completedTx.referenceId}\nUTR: ${completedTx.utrNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Samir Pay Payment Receipt',
          text: shareText,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Receipt copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {step === 'PIN_ENTRY' ? (
              <button
                onClick={() => setStep('INPUT')}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="text-base font-bold text-slate-900">
              {step === 'PIN_ENTRY'
                ? 'Enter UPI PIN'
                : step === 'SUCCESS'
                ? 'Payment Successful'
                : step === 'FAILURE'
                ? 'Payment Status'
                : 'Send Money'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: INPUT DETAILS */}
        {step === 'INPUT' && (
          <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => {
                  sound.playKeypadTick();
                  setMode('UPI_ID');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'UPI_ID'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>UPI ID</span>
              </button>
              <button
                onClick={() => {
                  sound.playKeypadTick();
                  setMode('PHONE');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'PHONE'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => {
                  sound.playKeypadTick();
                  setMode('BANK_TRANSFER');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'BANK_TRANSFER'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bank A/C</span>
              </button>
            </div>

            {/* Error banner if any */}
            {inputError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{inputError}</span>
              </div>
            )}

            {/* 1.1 UPI ID MODE */}
            {mode === 'UPI_ID' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Recipient UPI ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s/g, '');
                        setUpiId(val);
                        if (val.includes('@')) {
                          verifyVpa(val);
                        } else {
                          setVpaVerified(false);
                        }
                      }}
                      placeholder="e.g. rahul@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono outline-none transition-all pr-10"
                    />
                    <div className="absolute right-3 top-3">
                      {isVerifyingVpa ? (
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                      ) : vpaVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : null}
                    </div>
                  </div>
                  {vpaError && <p className="text-[11px] text-red-600 mt-1">{vpaError}</p>}
                </div>

                {/* Popular Bank Handles Chips */}
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Quick handles:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['@samirpay', '@okhdfcbank', '@oksbi', '@paytm', '@icici', '@ybl'].map(
                      (h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleAppendHandle(h)}
                          className="px-2 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-slate-600 font-mono transition-colors"
                        >
                          {h}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Recipient Name Preview / Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payee Name {vpaVerified && <span className="text-emerald-700">(Verified ✓)</span>}
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Payee full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* 1.2 PHONE NUMBER MODE */}
            {mode === 'PHONE' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-semibold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(raw);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payee Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm outline-none transition-all"
                  />
                </div>

                {/* Quick Select from Contacts */}
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Or choose from contacts:</span>
                  <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto no-scrollbar border border-slate-100 rounded-xl divide-y divide-slate-50">
                    {contacts.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          sound.playKeypadTick();
                          setPhone(c.phone.replace(/\D/g, '').slice(-10));
                          setRecipientName(c.name);
                          setUpiId(c.upiId);
                        }}
                        className="w-full text-left p-2 flex items-center justify-between hover:bg-emerald-50/50 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                            style={{ backgroundColor: c.avatarColor }}
                          >
                            {c.initials}
                          </span>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1.3 BANK TRANSFER MODE */}
            {mode === 'BANK_TRANSFER' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter account number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Re-enter Account Number
                  </label>
                  <input
                    type="text"
                    value={confirmAccount}
                    onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter to confirm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setIfsc(val);
                      if (val.startsWith('SBIN')) setIfscBankName('State Bank of India');
                      else if (val.startsWith('HDFC')) setIfscBankName('HDFC Bank');
                      else if (val.startsWith('ICIC')) setIfscBankName('ICICI Bank');
                      else setIfscBankName('Verified Bank Branch');
                    }}
                    placeholder="e.g. SBIN0001824"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono uppercase outline-none transition-all"
                  />
                  {ifsc && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      Branch: {ifscBankName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Name as registered with bank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* AMOUNT INPUT SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (INR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-2xl font-bold text-slate-800">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-2xl font-bold font-mono outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Quick Amount Addition Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[100, 500, 1000, 2000].map((add) => (
                  <button
                    key={add}
                    type="button"
                    onClick={() => handleAddAmount(add)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 bg-white transition-colors shrink-0"
                  >
                    +₹{add}
                  </button>
                ))}
              </div>

              {/* Note / Remarks */}
              <div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (e.g. Lunch, Rent, Groceries)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs outline-none"
                />
              </div>

              {/* Source Account Selector */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Debiting From</span>
                  <span className="text-slate-500 font-mono">
                    Bal: {formatINR(selectedBank.balance)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    {user.linkedBanks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (XX{b.accountNumberLast4}) · {formatINR(b.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sandbox Failure Simulator Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] text-slate-600">Simulate Bank Failure test</span>
                <input
                  type="checkbox"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bottom Proceed CTA Button */}
            <button
              onClick={handleProceedToPin}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Pay {amount ? `₹${amount}` : ''}</span>
            </button>
          </div>
        )}

        {/* STEP 2: UPI PIN KEYPAD */}
        {step === 'PIN_ENTRY' && (
          <div className="p-6 flex flex-col items-center justify-between h-[460px]">
            {/* Top Info */}
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 font-medium">Paying to</p>
              <h4 className="text-lg font-bold text-slate-900">{recipientName || upiId}</h4>
              <p className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
                ₹{parseFloat(amount).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">
                Debiting from {selectedBank.bankName} (XX{selectedBank.accountNumberLast4})
              </p>
            </div>

            {/* Masked PIN Indicators */}
            <div className="my-4">
              <p className="text-xs font-semibold text-slate-600 text-center mb-3">
                ENTER 4-DIGIT UPI PIN
              </p>
              <div className="flex items-center justify-center gap-4">
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      i < pin.length
                        ? 'bg-emerald-700 scale-110 shadow-sm'
                        : 'border-2 border-slate-300 bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-3">
                UPI PIN is never saved or shared with anyone
              </p>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-emerald-100 text-lg font-semibold text-slate-800 transition-colors flex items-center justify-center font-mono"
                >
                  {digit}
                </button>
              ))}
              <div className="h-12" /> {/* Empty spacer */}
              <button
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-emerald-100 text-lg font-semibold text-slate-800 transition-colors flex items-center justify-center font-mono"
              >
                0
              </button>
              <button
                onClick={handlePinBackspace}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors flex items-center justify-center"
                aria-label="Backspace"
              >
                ⌫
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING SPINNER */}
        {step === 'PROCESSING' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <div>
              <h4 className="text-base font-bold text-slate-800">Processing Payment...</h4>
              <p className="text-xs text-slate-500 mt-1">Connecting to NPCI UPI Switch</p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 'SUCCESS' && completedTx && (
          <div className="p-6 overflow-y-auto no-scrollbar space-y-5">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/10 animate-in zoom-in-75 duration-200">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Payment Successful</h3>
              <p className="text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {formatINR(completedTx.amount)}
              </p>
              <p className="text-xs text-slate-500">Paid to {completedTx.recipientName}</p>
            </div>

            {/* Official Digital Receipt Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">UPI Ref ID</span>
                <span className="font-mono font-medium text-slate-800">{completedTx.referenceId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">UTR Number</span>
                <span className="font-mono font-medium text-slate-800">{completedTx.utrNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">To UPI ID</span>
                <span className="font-mono text-slate-800">{completedTx.recipientUpiId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Debited From</span>
                <span className="text-slate-800">{completedTx.debitedBank}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Date & Time</span>
                <span className="text-slate-800">
                  {new Date(completedTx.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleShareReceipt}
                className="w-full py-3 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FAILURE SCREEN */}
        {step === 'FAILURE' && (
          <div className="p-6 flex flex-col items-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Failed</h3>
              <p className="text-xs text-red-600 mt-1 max-w-xs">{errorMessage}</p>
            </div>
            <button
              onClick={() => setStep('INPUT')}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
