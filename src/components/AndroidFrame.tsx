import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col items-center justify-start sm:py-6 sm:px-4">
      {/* Desktop Viewport Switcher Toolbar (Hidden on actual mobile screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-3 py-1.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 text-xs text-slate-300">
        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Samir Pay Mobile Engine
        </span>

        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setDeviceFrameMode(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Frame</span>
          </button>
          <button
            onClick={() => setDeviceFrameMode(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              !deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Fluid View</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'sm:max-w-[420px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/80 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
            : 'max-w-2xl min-h-screen sm:min-h-[90vh] sm:rounded-3xl sm:border border-slate-200 shadow-xl'
        } bg-slate-100 flex flex-col relative overflow-hidden`}
      >
        {/* Android Status Bar */}
        <div className="h-8 bg-white border-b border-slate-100/60 px-5 flex items-center justify-between select-none shrink-0 z-40 text-slate-700">
          {/* Clock */}
          <span className="text-[12px] font-bold font-mono tracking-tight">
            {currentTime}
          </span>

          {/* Front Camera Punch-hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-slate-800/40" />

          {/* Android Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono font-bold">92%</span>
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-slate-100">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-4 bg-white flex items-center justify-center shrink-0 z-40 select-none pb-1">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
