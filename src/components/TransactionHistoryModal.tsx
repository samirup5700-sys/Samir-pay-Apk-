import React, { useState } from 'react';
import {
  X,
  Search,
  ArrowUpRight,
  TrendingUp,
  Share2,
  Download,
  Copy,
  Check,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { Transaction } from '../types/payment';
import { formatINR, formatTxDate } from '../utils/upi';
import { sound } from '../utils/audio';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onRepeatPayment: (tx: Transaction) => void;
  initialSelectedTx?: Transaction | null;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onRepeatPayment,
  initialSelectedTx = null,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT' | 'BILLS'>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(initialSelectedTx);
  const [copiedField, setCopiedField] = useState<string>('');

  if (!isOpen) return null;

  // Filter transactions
  const filtered = transactions.filter((t) => {
    // Search matching
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      t.recipientName.toLowerCase().includes(q) ||
      t.recipientUpiId.toLowerCase().includes(q) ||
      t.senderName.toLowerCase().includes(q) ||
      t.utrNumber.includes(q) ||
      (t.note && t.note.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'DEBIT') return t.type === 'DEBIT';
    if (filterType === 'CREDIT') return t.type === 'CREDIT';
    if (filterType === 'BILLS') return t.category === 'BILL_PAYMENT' || t.category === 'RECHARGE';
    return true;
  });

  const handleCopy = (text: string, label: string) => {
    sound.playKeypadTick();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleShareReceipt = (tx: Transaction) => {
    const text = `Samir Pay Receipt\nAmount: ₹${tx.amount}\nPayee: ${tx.recipientName} (${tx.recipientUpiId})\nUTR: ${tx.utrNumber}\nDate: ${new Date(tx.timestamp).toLocaleString('en-IN')}`;
    if (navigator.share) {
      navigator.share({ title: 'Payment Receipt', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Receipt details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Transaction History</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, UPI ID, or UTR..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Filter Control */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'DEBIT', label: 'Paid' },
                { id: 'CREDIT', label: 'Received' },
                { id: 'BILLS', label: 'Bills' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sound.playKeypadTick();
                  setFilterType(f.id);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterType === f.id
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No transactions found</p>
              <p className="text-slate-400">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    sound.playKeypadTick();
                    setSelectedTx(tx);
                  }}
                  className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
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
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                        {isCredit ? tx.senderName : tx.recipientName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[170px]">
                        {isCredit ? tx.senderUpiId : tx.recipientUpiId}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatTxDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {tx.status === 'SUCCESS' ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Transaction Receipt Modal (Drawer Layer) */}
        {selectedTx && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transaction Details
                </span>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header */}
              <div className="text-center space-y-1">
                <div
                  className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                    selectedTx.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedTx.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>
                <h3 className="text-2xl font-black tabular-nums text-slate-900 mt-1">
                  {selectedTx.type === 'CREDIT' ? '+' : '-'} {formatINR(selectedTx.amount)}
                </h3>
                <p className="text-xs font-semibold text-emerald-700">
                  {selectedTx.status === 'SUCCESS' ? 'UPI Payment Successful' : 'Payment Failed'}
                </p>
              </div>

              {/* Breakdown Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">
                    {selectedTx.type === 'CREDIT' ? 'Received From' : 'Paid To'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedTx.type === 'CREDIT' ? selectedTx.senderName : selectedTx.recipientName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">UPI ID</span>
                  <span className="font-mono text-slate-800">
                    {selectedTx.type === 'CREDIT'
                      ? selectedTx.senderUpiId
                      : selectedTx.recipientUpiId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">UTR / UPI Ref</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-800">{selectedTx.utrNumber}</span>
                    <button
                      onClick={() => handleCopy(selectedTx.utrNumber, 'UTR')}
                      className="text-emerald-700 hover:text-emerald-800"
                      title="Copy UTR"
                    >
                      {copiedField === 'UTR' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Bank Account</span>
                  <span className="text-slate-800 font-medium">
                    {selectedTx.debitedBank || selectedTx.creditedBank || 'State Bank of India'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="text-slate-800">
                    {new Date(selectedTx.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedTx.note && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Note</span>
                    <span className="text-slate-800 italic">"{selectedTx.note}"</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleShareReceipt(selectedTx)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTx(null);
                    onRepeatPayment(selectedTx);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Repeat className="w-4 h-4" />
                  <span>Pay Again</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
