import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database, HardDrive } from 'lucide-react';
import { cn } from './utils';

export function SyncStatusBar({
  isOnline = true,
  isLiveDb = false,
  pendingCount = 0,
  isSyncing = false,
  onSync = null,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'w-full px-4 py-2 bg-white border-b border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs',
        className
      )}
    >
      {/* Left: Connectivity & Database Mode */}
      <div className="flex items-center gap-3">
        {/* Network Status Pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] select-none',
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          )}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3 h-3 text-emerald-700" />
              <span>{isSw ? 'Mtandaoni' : 'Online'}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <WifiOff className="w-3 h-3 text-amber-700" />
              <span>{isSw ? 'Nje ya Mtandao' : 'Offline'}</span>
            </>
          )}
        </div>

        {/* Database Provider Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border select-none',
            isLiveDb
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          )}
        >
          {isLiveDb ? (
            <>
              <Database className="w-3 h-3 text-teal-700" />
              <span>{isSw ? 'Hifadhidata Moja kwa Moja' : 'Live Supabase'}</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 text-slate-600" />
              <span>{isSw ? 'Kwenye Kifaa (Mock DB)' : 'Local Storage (Mock)'}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Outbox Queue & Sync Action */}
      <div className="flex items-center gap-3">
        {/* Pending Queue Count */}
        <div className="flex items-center gap-1.5 text-slate-600">
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {pendingCount} {isSw ? 'zinazosubiri kutumwa' : 'pending sync'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isSw ? 'Data zote zimelandanishwa' : 'All synced'}
            </span>
          )}
        </div>

        {/* Manual Sync Trigger */}
        {onSync && (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className={cn(
              'min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#006B5F] bg-[#E6F4F1] hover:bg-[#D5EDE8] active:bg-[#C2E4DD] transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title={isSw ? 'Landanisha sasa' : 'Sync now'}
            aria-label={isSw ? 'Landanisha sasa' : 'Sync now'}
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5 shrink-0', isSyncing && 'animate-spin text-[#006B5F]')}
              aria-hidden="true"
            />
            <span>{isSyncing ? (isSw ? 'Inalandanisha...' : 'Syncing...') : (isSw ? 'Landanisha' : 'Sync')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default SyncStatusBar;
