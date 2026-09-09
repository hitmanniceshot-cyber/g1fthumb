'use client';

import React from 'react';
import { Smartphone, Monitor, LayoutGrid, Eye, Sun, Moon } from 'lucide-react';

interface YouTubePreviewProps {
  thumbnailUrl: string | null;
  title: string;
  description?: string;
  channelName?: string;
  views?: string;
  timeAgo?: string;
  isSquintMode: boolean;
  showSafeZones: boolean;
  activeView: 'desktop' | 'mobile' | 'sidebar';
  onViewChange: (view: 'desktop' | 'mobile' | 'sidebar') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const YouTubePreview: React.FC<YouTubePreviewProps> = ({
  thumbnailUrl,
  title,
  description = '',
  channelName = 'Kreator Hebat',
  views = '128K x ditonton',
  timeAgo = '2 hari yang lalu',
  isSquintMode,
  showSafeZones,
  activeView,
  onViewChange,
  isDarkMode,
  onToggleTheme,
}) => {
  const displayTitle = title.trim() || 'Judul Video YouTube Anda Akan Muncul Di Sini';

  return (
    <div className={`rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0f0f0f] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-5 shadow-sm`}>
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview Simulator</span>
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button
              onClick={() => onViewChange('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'mobile'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Feed
            </button>
            <button
              onClick={() => onViewChange('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'desktop'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop Grid
            </button>
            <button
              onClick={() => onViewChange('sidebar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'sidebar'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Sidebar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Simulator Container */}
      <div className="flex justify-center items-center min-h-[360px] p-2 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl overflow-hidden">
        {/* 1. MOBILE FEED VIEW */}
        {activeView === 'mobile' && (
          <div className={`w-[360px] rounded-3xl border ${isDarkMode ? 'bg-[#0f0f0f] border-zinc-800' : 'bg-white border-slate-200'} shadow-xl overflow-hidden pb-4 transition-all`}>
            {/* Mobile status bar mockup */}
            <div className="flex justify-between items-center px-4 py-2 text-[11px] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60">
              <span>09:41</span>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Thumbnail Area */}
            <div className="relative w-full aspect-video bg-zinc-800 flex items-center justify-center overflow-hidden">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isSquintMode ? 'blur-[3px] contrast-125' : ''
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-400 p-4 text-center">
                  <Eye className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">Upload thumbnail untuk melihat preview</span>
                </div>
              )}

              {/* Timestamp Badge */}
              <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wide z-10">
                14:20
              </div>

              {/* Safe Zone Overlay */}
              {showSafeZones && (
                <div className="absolute bottom-1 right-1 w-20 h-9 border-2 border-dashed border-rose-500 bg-rose-500/25 rounded flex items-center justify-center text-[10px] text-white font-bold pointer-events-none z-20">
                  DURASI
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex gap-3 px-3 pt-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                KH
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="font-medium text-sm leading-snug line-clamp-2"
                  title={displayTitle}
                >
                  {displayTitle}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>{channelName}</span>
                  <span>•</span>
                  <span>{views}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>
                {description.trim() && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-1.5">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. DESKTOP GRID VIEW */}
        {activeView === 'desktop' && (
          <div className={`w-[360px] rounded-xl overflow-hidden transition-all`}>
            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isSquintMode ? 'blur-[3px] contrast-125' : ''
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-400 p-4 text-center">
                  <Eye className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">Upload thumbnail untuk melihat preview</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded tracking-wide z-10">
                14:20
              </div>
              {showSafeZones && (
                <div className="absolute bottom-1 right-1 w-20 h-9 border-2 border-dashed border-rose-500 bg-rose-500/25 rounded flex items-center justify-center text-[10px] text-white font-bold pointer-events-none z-20">
                  DURASI
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex gap-3 pt-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                KH
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="font-semibold text-sm leading-snug line-clamp-2"
                  title={displayTitle}
                >
                  {displayTitle}
                </h4>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  <div>{channelName}</div>
                  <div className="flex items-center gap-1">
                    <span>{views}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DESKTOP SIDEBAR VIEW */}
        {activeView === 'sidebar' && (
          <div className="w-[420px] flex gap-3 items-start p-2 rounded-xl transition-all">
            {/* Thumbnail */}
            <div className="relative w-40 aspect-video rounded-lg bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isSquintMode ? 'blur-[3px] contrast-125' : ''
                  }`}
                />
              ) : (
                <div className="text-zinc-400 text-[10px] p-2 text-center">No Thumbnail</div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] font-semibold px-1 py-0.5 rounded z-10">
                14:20
              </div>
              {showSafeZones && (
                <div className="absolute bottom-0.5 right-0.5 w-14 h-6 border-2 border-dashed border-rose-500 bg-rose-500/25 rounded flex items-center justify-center text-[8px] text-white font-bold pointer-events-none z-20">
                  DURASI
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <h4
                className="font-medium text-xs leading-snug line-clamp-2"
                title={displayTitle}
              >
                {displayTitle}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{channelName}</p>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{views}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
