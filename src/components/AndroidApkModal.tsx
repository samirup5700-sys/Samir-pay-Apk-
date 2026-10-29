import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Cloud,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../utils/audio';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedPackage, setCopiedPackage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'pwabuilder' | 'cli'>('cloud');
  const [installing, setInstalling] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyPackage = () => {
    sound.playKeypadTick();
    navigator.clipboard.writeText('com.samirpay.app');
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2000);
  };

  const handleInstallClick = async () => {
    sound.playKeypadTick();
    setInstalling(true);
    if (isInstallable) {
      await install();
    } else {
      // Guide user
      alert(
        'To install directly on Android:\n1. Tap the 3 dots (⋮) at top-right of Chrome browser\n2. Tap "Install App" or "Add to Home screen"\n\nSamir Pay will be installed as a full-screen Android app!'
      );
    }
    setInstalling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Install Android App</h3>
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
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Android App Package Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border border-emerald-200/80 flex items-center gap-4">
            <img
              src="/pwa-192x192.png"
              alt="Samir Pay Android App Icon"
              className="w-16 h-16 rounded-2xl shadow-md border border-emerald-300 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900">Samir Pay</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Capacitor 8 Android Package</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                  com.samirpay.app
                </span>
                <button
                  onClick={handleCopyPackage}
                  className="p-1 text-emerald-700 hover:text-emerald-900"
                  title="Copy Package ID"
                >
                  {copiedPackage ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Direct Install Button (Instant on Android) */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Instant Phone Install (No Computer)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Recommended
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Install Samir Pay directly onto your Android home screen as a native full-screen app with the official green icon!
            </p>

            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {isInstalled
                  ? 'Already Installed on this Device ✓'
                  : 'Install Samir Pay on this Phone'}
              </span>
            </button>
          </div>

          {/* How to Generate the .APK Online without a computer */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span>Generate Standalone .APK File Online</span>
            </h4>

            {/* Segmented control */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('cloud')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'cloud'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                GitHub Actions
              </button>
              <button
                onClick={() => setActiveTab('pwabuilder')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'pwabuilder'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PWABuilder
              </button>
              <button
                onClick={() => setActiveTab('cli')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'cli'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PC / Studio
              </button>
            </div>

            {/* Tab 1: GitHub Actions (Free cloud builder for phones) */}
            {activeTab === 'cloud' && (
              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-emerald-800">
                  Fastest way to get .APK with only an Android phone:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    A pre-configured cloud builder workflow is ready in{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">
                      .github/workflows/build-apk.yml
                    </code>
                    .
                  </li>
                  <li>
                    Push or fork this project on <strong>GitHub.com</strong> in your phone browser.
                  </li>
                  <li>
                    Tap the <strong>Actions</strong> tab on your phone, select <strong>Build Android APK</strong>, and tap <strong>Run workflow</strong>.
                  </li>
                  <li>
                    In ~2 minutes, GitHub's cloud servers compile the Android project and output{' '}
                    <strong className="text-emerald-700">app-debug.apk</strong>.
                  </li>
                  <li>
                    Tap download to save the APK directly to your Android Downloads folder, tap it, and click <strong>Install</strong>!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: PWABuilder (Online service) */}
            {activeTab === 'pwabuilder' && (
              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-emerald-800">
                  Generate signed APK directly from URL:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    Open <strong>pwabuilder.com</strong> in your mobile browser.
                  </li>
                  <li>
                    Enter your live app URL:
                    <div className="bg-slate-100 p-2 rounded font-mono text-[11px] break-all my-1 text-slate-800 select-all">
                      {window.location.origin}
                    </div>
                  </li>
                  <li>
                    PWABuilder verifies the manifest, icons (192px/512px), and green theme.
                  </li>
                  <li>
                    Tap <strong>Package for Android</strong>.
                  </li>
                  <li>
                    Set package ID to <code className="font-mono font-bold">com.samirpay.app</code>, and tap <strong>Generate APK</strong> to download!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: Local Android Studio CLI */}
            {activeTab === 'cli' && (
              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">
                  If you ever have access to a computer:
                </p>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono text-[11px] space-y-1">
                  <p># 1. Build web assets</p>
                  <p className="text-emerald-400">npm run build</p>
                  <p># 2. Sync native Android project</p>
                  <p className="text-emerald-400">npx cap sync android</p>
                  <p># 3. Build APK directly</p>
                  <p className="text-emerald-400">cd android &amp;&amp; ./gradlew assembleDebug</p>
                </div>
                <p className="text-[11px] text-slate-500">
                  The generated APK will be in <code className="font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>
            )}
          </div>

          {/* Download Prepared Project ZIP to Phone */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>Export Android Source (.ZIP)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Ready for Upload</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Download all project files including the Android folder, Capacitor configs, and icons to upload directly to GitHub or cloud APK builders.
            </p>
            <a
              href="/api/download-project-zip"
              download="SamirPay-Android-Project.zip"
              className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download SamirPay-Android-Project.zip</span>
            </a>
          </div>

          {/* Android Permissions & Features Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
            <h5 className="font-bold text-slate-800">Configured Android Permissions</h5>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Camera (QR Scanner)
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Haptic Vibration
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Internet &amp; Network
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Green Status Bar
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
