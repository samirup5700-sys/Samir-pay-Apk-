import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'icon-only';
  inverted?: boolean;
}

export const SamirPayLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  variant = 'full',
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Geometric Green Shield with SP Monogram & Speed Flash */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-2xl shadow-sm transition-transform active:scale-95 ${
          inverted
            ? 'bg-white text-emerald-700 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-700/20'
        }`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Subtle shield backdrop */}
          <path
            d="M18 4L6 9.2V17.5C6 24.8 11.2 31.6 18 33.2C24.8 31.6 30 24.8 30 17.5V9.2L18 4Z"
            fill={inverted ? '#059669' : '#ffffff'}
            fillOpacity={inverted ? '0.15' : '0.2'}
          />
          {/* Stylized S and P intertwined */}
          <path
            d="M13 13.5C13 11.8 14.5 10.5 16.5 10.5H21C22.7 10.5 24 11.8 24 13.5C24 15.2 22.7 16.5 21 16.5H16C14.3 16.5 13 17.8 13 19.5C13 21.2 14.3 22.5 16 22.5H23"
            stroke={inverted ? '#059669' : '#ffffff'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Speed flash / UPI lightning arrow */}
          <path
            d="M20 18L15 26H19L17.5 31L23 23H19L20 18Z"
            fill={inverted ? '#10B981' : '#A7F3D0'}
          />
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight ${
                inverted ? 'text-white' : 'text-slate-900'
              }`}
            >
              Samir<span className={inverted ? 'text-emerald-300' : 'text-emerald-600'}>Pay</span>
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                inverted
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              UPI
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                inverted ? 'text-emerald-200' : 'text-slate-500'
              }`}
            >
              Simple. Fast. Secure.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
