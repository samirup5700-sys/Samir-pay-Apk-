import React from 'react';
import { SamirPayLogo } from './SamirPayLogo';
import { Bell, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types/payment';

interface HeaderProps {
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenIntegrationInfo: () => void;
  onOpenApkModal: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenProfile,
  onOpenNotifications,
  onOpenIntegrationInfo,
  onOpenApkModal,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left: Samir Pay Logo */}
        <div className="flex items-center gap-2">
          <SamirPayLogo size="md" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Install Android APK Button */}
          <button
            onClick={onOpenApkModal}
            title="Install Android App / Download APK"
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs transition-all"
          >
            <span className="text-[11px]">Install App</span>
          </button>

          {/* Demo Sandbox Tag (interactive button) */}
          <button
            onClick={onOpenIntegrationInfo}
            title="Click to view NPCI & PSP Integration Details"
            className="hidden xs:flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold">Demo</span>
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-emerald-600/20 active:scale-95 transition-transform"
            aria-label="Open User Profile"
          >
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};
