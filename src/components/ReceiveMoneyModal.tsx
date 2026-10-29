import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  Volume2,
  Sparkles,
  ArrowDownLeft,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, Transaction } from '../types/payment';
import { buildUpiUri, generateQrDataUrl, formatINR } from '../utils/upi';
import { sound } from '../utils/audio';
import { SamirPayLogo } from './SamirPayLogo';

interface ReceiveMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPaymentReceived: (tx: Transaction) => void;
}

export const ReceiveMoneyModal: React.FC<ReceiveMoneyModalProps> = ({
  isOpen,
  onClose,
  user,
  onPaymentReceived,
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [soundboxLang, setSoundboxLang] = useState<'en' | 'hi'>('en');

  // Regenerate QR whenever amount, note, or user changes
  useEffect(() => {
    if (!isOpen) return;

    const uri = buildUpiUri({
      pa: user.primaryUpiId,
      pn: user.name,
      am: customAmount ? parseFloat(customAmount) : undefined,
      cu: 'INR',
      tn: customNote || 'Payment to ' + user.name,
    });

    generateQrDataUrl(uri).then((url) => {
      setQrDataUrl(url);
    });
  }, [user.primaryUpiId, user.name, customAmount, customNote, isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(user.primaryUpiId);
    setCopiedUpi(true);
    sound.playKeypadTick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `SamirPay_QR_${user.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  // Soundbox Simulator Trigger
  const handleTestSoundbox = () => {
    const amt = parseFloat(customAmount) || 500;
    sound.playSuccessChime();
    setTimeout(() => {
      sound.announceReceivedAmount(amt, soundboxLang);
    }, 400);
  };

  // Simulate Inbound Credit
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    sound.playKeypadTick();

    try {
      const amt = parseFloat(customAmount) || 500;
      const res = await fetch('/api/payments/receive-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          senderName: 'Ananya Gupta',
          senderUpiId: 'ananya.g@oksbi',
          note: customNote || 'Received via Samir Pay QR',
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        sound.playSuccessChime();
        sound.announceReceivedAmount(amt, soundboxLang);
        onPaymentReceived(data.transaction);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Receive Money</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Main QR Card */}
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl flex flex-col items-center text-center relative shadow-sm">
            {/* Header info */}
            <div className="mb-3">
              <p className="text-xs text-slate-500 font-medium">Scan & Pay using any UPI app</p>
              <h4 className="text-base font-bold text-slate-900">{user.name}</h4>
              <p className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
                {user.primaryUpiId}
              </p>
            </div>

            {/* QR Code Graphic Container with Centered Logo */}
            <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI QR Code"
                  className="w-52 h-52 object-contain rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}

              {/* Samir Pay center badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white rounded-xl shadow-md border border-slate-100">
                <SamirPayLogo size="sm" variant="icon-only" />
              </div>
            </div>

            {/* Dynamic Amount Badge if specified */}
            {customAmount && parseFloat(customAmount) > 0 && (
              <div className="mt-3 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-lg tabular-nums">
                Requesting: {formatINR(parseFloat(customAmount))}
              </div>
            )}

            {/* Copy UPI ID Button */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleCopyUpi}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition-colors shadow-2xs"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </button>
            </div>
          </div>

          {/* Optional: Set Specific Amount & Note */}
          <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Set Amount (Optional)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">
                  Note / Reason
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Dinner split"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Soundbox Simulator */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-900">Samir Soundbox Simulator</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundboxLang('en')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    soundboxLang === 'en'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setSoundboxLang('hi')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    soundboxLang === 'hi'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  HI
                </button>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Listen to the voice audio confirmation triggered whenever customer payment arrives.
            </p>

            <button
              onClick={handleTestSoundbox}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                Test Voice Announcement ({customAmount ? `₹${customAmount}` : '₹500'})
              </span>
            </button>
          </div>

          {/* Test Inbound Payment Simulation */}
          <button
            onClick={handleSimulatePayment}
            disabled={isSimulating}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {isSimulating
                ? 'Processing inbound transfer...'
                : `Simulate Inbound Payment (${customAmount ? `₹${customAmount}` : '₹500'})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
