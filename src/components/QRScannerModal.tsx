import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Flashlight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { parseUpiUri, UpiParams } from '../utils/upi';
import { sound } from '../utils/audio';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scanned: {
    upiId: string;
    name?: string;
    amount?: number;
    note?: string;
  }) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample quick test QRs
  const SAMPLE_QRS = [
    {
      title: 'Blue Tokai Coffee',
      desc: '₹240 · Artisan Coffee',
      uri: 'upi://pay?pa=bluetokai@icici&pn=Blue%20Tokai%20Coffee&am=240.00&cu=INR&tn=Iced%20Latte%20and%20Pastry',
    },
    {
      title: 'Priya Sharma (Friend)',
      desc: '₹1,200 · Dinner split',
      uri: 'upi://pay?pa=priya.v@samirpay&pn=Priya%20Sharma&am=1200.00&cu=INR&tn=Dinner%20Split',
    },
    {
      title: 'Sharma General Store',
      desc: '₹645 · Groceries',
      uri: 'upi://pay?pa=sharmastore@paytm&pn=Sharma%20General%20Store&am=645.00&cu=INR&tn=Groceries',
    },
  ];

  // Start Camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        setCameraError('');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Camera API not accessible in this environment. Use sample QRs or upload an image below.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err: unknown) {
        console.warn('Camera stream error:', err);
        setCameraError(
          'Camera access was denied or not available. Use 1-tap Sample QRs below to test scanning immediately!'
        );
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProcessPayload = (rawPayload: string) => {
    sound.playSuccessChime();
    const parsed = parseUpiUri(rawPayload);

    if (parsed && parsed.pa) {
      onScanSuccess({
        upiId: parsed.pa,
        name: parsed.pn,
        amount: parsed.am ? parseFloat(String(parsed.am)) : undefined,
        note: parsed.tn,
      });
      onClose();
    } else {
      // Direct raw UPI string
      const clean = rawPayload.trim();
      onScanSuccess({
        upiId: clean,
        name: clean.split('@')[0],
      });
      onClose();
    }
  };

  // Mock scan from gallery image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playKeypadTick();
    // Simulate image QR decode
    setTimeout(() => {
      handleProcessPayload(
        'upi://pay?pa=samir.merchant@icici&pn=Samir%20Pay%20Merchant%20Store&am=350.00&cu=INR&tn=Scanned%20from%20Gallery'
      );
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Scan Any UPI QR</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-slate-950 flex items-center justify-center h-64 overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2 max-w-xs">
              <Camera className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-xs">
                {cameraError || 'Initializing camera viewfinder...'}
              </p>
            </div>
          )}

          {/* Holographic Target Box */}
          <div className="relative z-10 w-48 h-48 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

            {/* Scanning Laser Line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse" />
          </div>

          <p className="absolute bottom-3 text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
            Align Bharat QR / UPI code inside the frame
          </p>
        </div>

        {/* Action Controls & Sample QR Bar */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Gallery Upload & Flash buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Upload from Gallery</span>
            </button>
            <button
              onClick={() => {
                sound.playKeypadTick();
                setTorchOn(!torchOn);
              }}
              className={`p-2.5 rounded-xl border transition-colors ${
                torchOn
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="Torch toggle"
            >
              <Flashlight className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Tap Sample QRs for Instant Testing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate 1-Tap QR Scans</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Fast Test
              </span>
            </div>

            <div className="space-y-1.5">
              {SAMPLE_QRS.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => handleProcessPayload(sample.uri)}
                  className="w-full p-2.5 text-left rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center justify-between transition-all group active:scale-[0.99]"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                      {sample.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sample.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-lg transition-colors">
                    Scan Now
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
