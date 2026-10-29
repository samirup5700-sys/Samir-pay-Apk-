import React from 'react';
import { X, Bell, CheckCircle2, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { formatINR } from '../utils/upi';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onClear,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Payment Credited',
      desc: '₹2,500.00 received from Neha Kapoor via Samir Pay QR.',
      time: '5 hours ago',
      icon: TrendingUp,
      iconColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'notif-2',
      title: 'Security Advisory: NPCI Guidelines',
      desc: 'Never share your 4-digit UPI PIN or OTP with anyone claiming to be bank executive.',
      time: '1 day ago',
      icon: ShieldAlert,
      iconColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'notif-3',
      title: 'BBPS Auto-Pay Reminder',
      desc: 'Tata Power Electricity bill due in 3 days. Available for 1-click clearance.',
      time: '2 days ago',
      icon: Sparkles,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto no-scrollbar divide-y divide-slate-100">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              onClear();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
