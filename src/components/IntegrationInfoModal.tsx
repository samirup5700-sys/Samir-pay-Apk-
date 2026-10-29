import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Building,
  Key,
} from 'lucide-react';

interface IntegrationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationInfoModal: React.FC<IntegrationInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const modules = [
    {
      title: 'UPI URI 2.0 Specification',
      status: 'COMPLIANT',
      desc: 'Standard upi://pay deep-linking with pa, pn, mc, tr, tn, am, cu query parameters.',
    },
    {
      title: 'VPA Resolution Engine',
      status: 'READY FOR HOOK',
      desc: 'Standard handle syntax validation + hook points for NPCI Central Switch VPA Inquiry API.',
    },
    {
      title: '12-Digit NPCI UTR Generation',
      status: 'COMPLIANT',
      desc: 'Authentic 12-digit numeric Unique Transaction Reference (UTR) adhering to settlement standards.',
    },
    {
      title: 'Dynamic Bharat QR',
      status: 'COMPLIANT',
      desc: 'Generates ISO/IEC 18004 standard QR codes compatible with Google Pay, PhonePe, Paytm, and BHIM.',
    },
    {
      title: 'Multi-Bank PSP Switch Adapter',
      status: 'READY FOR HOOK',
      desc: 'Pluggable backend endpoints ready for Razorpay Smart Collect, Cashfree, Setu, or Bank TPAP APIs.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              UPI & NPCI Integration Specs
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

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Regulatory Transparency Callout */}
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <h4 className="text-xs font-bold text-emerald-900">
                Official NPCI TPAP Compliance Notice
              </h4>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>Samir Pay</strong> is currently operating in <strong>Demo & Sandbox Mode</strong>. 
              In compliance with Reserve Bank of India (RBI) and NPCI circulars, 
              <strong> real money transfers must work only after official integration and approval</strong> 
              with an authorized Indian UPI Payment Service Provider (PSP) bank or certified aggregator.
            </p>
          </div>

          {/* Technical Architecture Readiness */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Architecture Readiness Checklist
            </h4>

            {modules.map((m) => (
              <div
                key={m.title}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{m.title}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps to Go Live with Authorized Provider */}
          <div className="p-4 bg-slate-100/70 rounded-2xl space-y-2 text-xs">
            <h5 className="font-bold text-slate-900">How to Connect Real Payments</h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Sign agreement with a Sponsor PSP Bank (e.g. HDFC, ICICI, Axis, Yes Bank) or Payment Aggregator (Razorpay / Cashfree / Setu).</li>
              <li>Provide merchant KYC and obtain Bank Merchant ID & API Secret credentials.</li>
              <li>Configure the webhook URL in <code className="bg-slate-200 px-1 py-0.5 rounded">server.ts</code> with HMAC-SHA256 signature verification.</li>
              <li>Complete NPCI end-to-end security audit and flip the flag from Demo to Live Production.</li>
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
