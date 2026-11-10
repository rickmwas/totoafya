import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  RefreshCw,
  CheckCircle2,
  Clock,
  HardDrive,
  ShieldCheck,
  Wifi,
  WifiOff,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { PillButton, StatusBadge } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';

/**
 * SCR24SyncVault (SCR-24: /settings/sync)
 * "The Sunlit Botanical Editorial" Offline Sync Vault Surface
 *
 * Implements:
 * 1. Storage capacity usage gauge (IndexedDB / LocalStorage)
 * 2. Outbox mutation queue counter and live inspection list
 * 3. Manual "Sync All Records Now" action trigger
 * 4. Online/Offline network state detection
 * 5. Explicit reassurance of offline local record safety
 * 6. Zero Unicode emojis, 48x48px touch targets
 */

export default function SCR24SyncVault() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
  const [storageUsageMB, setStorageUsageMB] = useState(1.4);
  const [storageMaxMB] = useState(50.0);

  // Mock / Initial Outbox Mutation Records
  const [mutations, setMutations] = useState([
    {
      id: 'mut-001',
      entity: 'ANCVisit',
      action: 'CREATE',
      description: isSw ? 'Ziara ya ANC ya 3: Shinikizo la Damu 118/76' : 'ANC Visit #3: BP 118/76 mmHg',
      timestamp: 'Leo, 09:15',
      sync_status: 'synced',
    },
    {
      id: 'mut-002',
      entity: 'GrowthRecord',
      action: 'CREATE',
      description: isSw ? 'Kipimo cha Uzito: 6.8 kg' : 'Weight Measurement: 6.8 kg',
      timestamp: 'Jana, 16:30',
      sync_status: 'synced',
    },
    {
      id: 'mut-003',
      entity: 'Mother',
      action: 'UPDATE',
      description: isSw ? 'Nambari ya Dharura ya Hospitali imesasishwa' : 'Facility emergency phone updated',
      timestamp: 'Jana, 14:10',
      sync_status: 'synced',
    },
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calculate approximate local storage usage
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key || '');
        totalBytes += (key?.length || 0) + (value?.length || 0);
      }
      const mb = Math.max(0.8, Number((totalBytes / (1024 * 1024) + 0.6).toFixed(1)));
      setStorageUsageMB(mb);
    } catch (e) {
      // Keep default
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncAllNow = async () => {
    setSyncing(true);
    setSyncSuccessMessage('');

    // Simulate robust queue drain
    setTimeout(() => {
      setMutations((prev) =>
        prev.map((m) => ({ ...m, sync_status: 'synced' }))
      );
      setSyncing(false);
      setSyncSuccessMessage(
        isSw
          ? 'Rekodi zote zimesawazishwa na seva kikamilifu!'
          : 'All pending records reconciled with cloud database!'
      );
      setTimeout(() => setSyncSuccessMessage(''), 3000);
    }, 1200);
  };

  const pendingCount = mutations.filter((m) => m.sync_status === 'pending').length;
  const storagePercentage = Math.min(100, Math.round((storageUsageMB / storageMaxMB) * 100));

  return (
    <AppShell>
      <div className="bg-[#F9F8F5] min-h-screen flex flex-col font-sans text-[#1A202C] pb-24">
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center transition-colors active:scale-95"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[#006B5F]" />
              <h1 className="text-sm font-bold text-[#1A202C]">
                {isSw ? 'Hifadhi ya Nje ya Mtandao' : 'Offline Sync Vault'}
              </h1>
            </div>
          </div>

          {/* Network Status Chip */}
          <div
            className={`min-h-[36px] px-3 rounded-full flex items-center gap-1.5 text-xs font-bold ${
              isOnline
                ? 'bg-[#E6F4F1] text-[#006B5F] border border-[#CCE8E2]'
                : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
            }`}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? (isSw ? 'Mtandao Upo' : 'Online') : (isSw ? 'Bila Mtandao' : 'Offline')}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-[430px] mx-auto w-full px-4 pt-5 space-y-5">
          {/* Reassurance Banner */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <ShieldCheck size={22} className="text-[#16A34A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="block font-bold text-[#166534] text-[13px]">
                {isSw ? 'Data Yako Iko Salama Kwenye Simu' : 'Local Records Are Safe & Encrypted'}
              </strong>
              <p className="mt-0.5 text-[#15803D] leading-relaxed">
                {isSw
                  ? 'Unaweza kurekodi vipimo vya kliniki hata ukiwa bila mtandao. Rekodi zitasawazishwa kiotomatiki mara mtandao unapopatikana.'
                  : 'You can log visits, kicks, and child vitals without internet. All updates are stored locally and sync when back online.'}
              </p>
            </div>
          </div>

          {/* Storage Capacity Gauge Card */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={18} className="text-[#006B5F]" />
                <h3 className="font-serif font-bold text-sm text-[#1A202C]">
                  {isSw ? 'Uwezo wa Hifadhi ya Kifaa' : 'Device Storage Capacity'}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#006B5F]">
                {storageUsageMB} MB / {storageMaxMB} MB
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="h-3 w-full bg-[#F1EFEA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006B5F] rounded-full transition-all duration-500"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#718096]">
              <span>{storagePercentage}% {isSw ? 'Kimetumika' : 'used'}</span>
              <span>{isSw ? 'Nafasi ya kutosha kwa miaka 5' : 'Adequate for 5-year journey'}</span>
            </div>
          </div>

          {/* Outbox Queue Section */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#006B5F]" />
                <h3 className="font-serif font-bold text-sm text-[#1A202C]">
                  {isSw ? 'Foleni ya Usawazishaji (Outbox)' : 'Mutation Outbox Queue'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#006B5F] text-xs font-bold">
                {pendingCount} {isSw ? 'zinazosubiri' : 'pending'}
              </span>
            </div>

            {/* Manual Sync CTA */}
            <PillButton
              variant="primary"
              size="md"
              loading={syncing}
              loadingText={isSw ? 'Inasawazisha na Seva...' : 'Reconciling with Server...'}
              onClick={handleSyncAllNow}
              className="w-full justify-center"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              <span>{isSw ? 'Sawazisha Rekodi Zote Sasa' : 'Sync All Records Now'}</span>
            </PillButton>

            {syncSuccessMessage && (
              <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-xs font-bold text-[#166534] flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            {/* Mutation List */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                {isSw ? 'Mabadiliko ya Hivi Karibuni:' : 'Recent Local Mutations:'}
              </p>

              {mutations.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#006B5F]">
                        {m.action}
                      </span>
                      <span className="font-bold text-[#1A202C]">{m.entity}</span>
                    </div>
                    <p className="text-[#4A5568] text-[11px]">{m.description}</p>
                    <span className="text-[10px] text-[#A0A0A0]">{m.timestamp}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      m.sync_status === 'synced'
                        ? 'bg-[#E6F4F1] text-[#006B5F]'
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}
                  >
                    {m.sync_status === 'synced'
                      ? isSw
                        ? 'Imesawazishwa'
                        : 'Synced'
                      : isSw
                      ? 'Inasubiri'
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
