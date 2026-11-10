import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  HeartHandshake,
  Phone,
  ShieldCheck,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { PillButton } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';
import db from '@/api/totoafyaClient';

/**
 * SCR28Bereavement (SCR-28: /sensitive/bereavement)
 * "The Sunlit Botanical Editorial" Sensitive Exception & Bereavement Care Surface
 *
 * Implements:
 * 1. Muted, peaceful warm stone/sage palette (#F9F8F5, #EFECE6)
 * 2. Silences baby milestones, kick counters, and celebratory alerts (Mother.bereavement_mode)
 * 3. Compassionate Swahili and English condolence copy
 * 4. Postnatal physical healing guidance (breast milk engorgement, lochia bleeding monitoring)
 * 5. 1-tap direct dialers for Befrienders Kenya (0722 178 177) and Healthcare helpline (1190)
 * 6. Respectful pregnancy record archiving without deletion
 * 7. Zero Unicode emojis, minimum 48x48px hit targets
 */

export default function SCR28Bereavement() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [mother, setMother] = useState(null);
  const [bereavementActive, setBereavementActive] = useState(false);
  const [archived, setArchived] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadMother();
  }, []);

  const loadMother = async () => {
    try {
      const mothers = await db.entities.Mother.list('-created_date', 1);
      const m = mothers[0] || null;
      setMother(m);
      if (m?.bereavement_mode) {
        setBereavementActive(true);
      } else {
        const stored = localStorage.getItem('toto_bereavement_mode') === 'true';
        setBereavementActive(stored);
      }
    } catch (e) {
      console.warn('Could not load mother record in bereavement:', e);
      const stored = localStorage.getItem('toto_bereavement_mode') === 'true';
      setBereavementActive(stored);
    }
  };

  const toggleBereavementMode = async () => {
    setSaving(true);
    const nextState = !bereavementActive;
    try {
      if (mother?.id) {
        await db.entities.Mother.update(mother.id, {
          bereavement_mode: nextState,
          bereavement_date: nextState ? new Date().toISOString() : null,
        });
      }
      localStorage.setItem('toto_bereavement_mode', String(nextState));
      setBereavementActive(nextState);
      setStatusMessage(
        nextState
          ? isSw
            ? 'Hali ya utulivu imewashwa. Arifa zote za sherehe zimesitishwa.'
            : 'Bereavement mode activated. Celebratory milestone notifications are silenced.'
          : isSw
          ? 'Hali ya kawaida imerejeshwa.'
          : 'Standard mode restored.'
      );
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (e) {
      console.error('Failed to toggle bereavement mode:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveRecord = async () => {
    setSaving(true);
    try {
      if (mother?.id) {
        await db.entities.Mother.update(mother.id, {
          pregnancy_archived: true,
          bereavement_mode: true,
        });
      }
      setArchived(true);
      setBereavementActive(true);
      localStorage.setItem('toto_bereavement_mode', 'true');
      setStatusMessage(
        isSw
          ? 'Kumbukumbu ya ujauzito imehifadhiwa kwa heshima kwenye kumbukumbu ya faragha.'
          : 'Pregnancy record has been respectfully preserved in your private archive.'
      );
    } catch (e) {
      console.error('Failed to archive record:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="bg-[#F9F8F5] min-h-screen flex flex-col font-sans text-[#2D3748] pb-24">
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <button
            onClick={() => navigate('/settings')}
            className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center transition-colors active:scale-95"
            aria-label={isSw ? 'Rudi kwenye mipangilio' : 'Back to settings'}
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-[#718096]">
            {isSw ? 'Huduma ya Huruma na Utulivu' : 'Compassionate Care & Healing'}
          </span>
          <div className="w-10" />
        </div>

        {/* Hero Condolence Message */}
        <div className="max-w-[430px] mx-auto w-full px-5 pt-6 space-y-6">
          <div className="bg-white rounded-[28px] border border-[#E2E8F0] p-6 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center mx-auto">
              <HeartHandshake size={28} />
            </div>

            <h1
              className="font-serif text-2xl font-bold text-[#1A202C] leading-snug"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              {isSw
                ? 'Tunakupa Pole Sana Mama'
                : 'Holding You in Gentle Care'}
            </h1>

            <p className="text-xs text-[#4A5568] leading-relaxed">
              {isSw
                ? 'Kumpoteza mtoto au ujauzito ni safari nzito ya kihisia na kimwili. Tuko pamoja nawe, na tuko hapa kukulinda na kukuongoza katika kupona kwa amani na heshima.'
                : 'Experiencing pregnancy or infant loss is a profound physical and emotional journey. You are not alone. We are here to support your healing with utmost dignity, quietude, and compassionate medical guidance.'}
            </p>
          </div>

          {/* Status Message Alert */}
          {statusMessage && (
            <div className="p-3.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl text-xs font-bold text-[#166534] flex items-center gap-2 animate-fade-in shadow-xs">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Mode Toggle Card: Silences celebratory alerts */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-sm text-[#1A202C]">
                  {isSw ? 'Washa Hali ya Utulivu (Bereavement Mode)' : 'Activate Quiet Healing Mode'}
                </h2>
                <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                  {isSw
                    ? 'Inaposimamishwa, programu itazima arifa zote za sherehe za mtoto, kihesabu mateke, na miadi ya kawaida ili kukulinda kihisia.'
                    : 'When active, the app silences all celebratory milestones, kick counters, and cheerful reminders across all screens.'}
                </p>
              </div>

              <button
                type="button"
                onClick={toggleBereavementMode}
                disabled={saving}
                className={`min-w-[48px] min-h-[48px] px-4 rounded-full font-bold text-xs shrink-0 transition-all ${
                  bereavementActive
                    ? 'bg-[#006B5F] text-white shadow-sm'
                    : 'bg-[#F1EFEA] text-[#4A5568] hover:bg-[#E2E8F0]'
                }`}
              >
                {bereavementActive
                  ? isSw
                    ? 'Imewashwa'
                    : 'Active'
                  : isSw
                  ? 'Washa'
                  : 'Enable'}
              </button>
            </div>
          </div>

          {/* Immediate Emotional & Helplines Dialers (1-Tap) */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <h2 className="font-serif font-bold text-sm text-[#1A202C]">
              {isSw ? 'Msaada wa Ushauri na Simu za Haraka' : 'Emotional Support & Helplines'}
            </h2>
            <p className="text-xs text-[#718096]">
              {isSw
                ? 'Ikiwa unahitaji mtu wa kuongea naye kwa siri na huruma, tafadhali piga simu hizi bila kusita:'
                : 'Compassionate, confidential professional counselors are available to support you:'}
            </p>

            <div className="space-y-2 pt-1">
              {/* Befrienders Kenya */}
              <a
                href="tel:0722178177"
                className="min-h-[48px] p-3.5 rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#1A202C] hover:bg-[#F1EFEA] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="font-bold">Befrienders Kenya</p>
                    <p className="text-[11px] text-[#718096] font-normal">
                      0722 178 177 · {isSw ? 'Ushauri wa Kihisia Masaa 24' : '24/7 Grief Counseling'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-[#006B5F] text-white text-[11px] font-bold">
                  {isSw ? 'Piga Sasa' : 'Call'}
                </span>
              </a>

              {/* Kenya MoH Helpline 1190 */}
              <a
                href="tel:1190"
                className="min-h-[48px] p-3.5 rounded-2xl bg-[#F9F8F5] border border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#1A202C] hover:bg-[#F1EFEA] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="font-bold">
                      {isSw ? 'Nambari ya Dharura ya Afya' : 'National Health Helpline'}
                    </p>
                    <p className="text-[11px] text-[#718096] font-normal">
                      1190 · {isSw ? 'Bila Malipo (Toll-Free)' : 'Toll-Free Emergency Line'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-[#DC2626] text-white text-[11px] font-bold">
                  {isSw ? 'Piga 1190' : 'Call 1190'}
                </span>
              </a>
            </div>
          </div>

          {/* Physical Healing & Postnatal Guidance */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-sm text-[#006B5F]">
              {isSw ? 'Mwongozo wa Afya ya Kimwili Baada ya Kupoteza' : 'Physical Postnatal Healing Guidance'}
            </h2>

            {/* Breast Milk Engorgement Management */}
            <div className="space-y-1.5 text-xs">
              <strong className="block text-[#1A202C] font-bold">
                {isSw ? '1. Kutuliza Maziwa ya Matiti (Milk Engorgement):' : '1. Managing Breast Milk Engorgement:'}
              </strong>
              <p className="text-[#4A5568] leading-relaxed">
                {isSw
                  ? 'Mwili unaweza kuendelea kutoa maziwa kwa siku chache. Weka kitambaa safi cha baridi (cold compress) au majani ya kabichi safi baridi kwenye matiti. Vaa sidiria inayobana kiasi lakini inayotuliza. Epuka kukamua maziwa au kugusa chuchu kwani kufanya hivyo huchochea uzalishaji zaidi wa maziwa.'
                  : 'Your body may continue producing milk for several days. Apply cold compresses or chilled clean cabbage leaves to soothe engorgement. Wear a supportive, non-wired bra. Avoid pumping or manual expression as stimulation triggers continued lactation.'}
              </p>
            </div>

            <div className="h-[0.5px] bg-[#F1EFEA]" />

            {/* Lochia Bleeding Warning Signs */}
            <div className="space-y-1.5 text-xs">
              <strong className="block text-[#1A202C] font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-[#DC2626]" />
                <span>{isSw ? '2. Uangalizi wa Damu ya Uzazi (Lochia):' : '2. Monitoring Postpartum Bleeding (Lochia):'}</span>
              </strong>
              <p className="text-[#4A5568] leading-relaxed">
                {isSw
                  ? 'Damu inatarajiwa kupungua taratibu na kubadilika rangi kutoka nyekundu hadi kahawia kisha manjano. Nenda hospitalini mara moja ukiona: kutokwa na damu inayoloa ped zaidi ya moja kwa saa moja, mabonge makubwa ya damu, harufu mbaya, au homa kali.'
                  : 'Bleeding should gradually decrease from bright red to brownish-pink over days. Seek immediate emergency care if you soak more than one sanitary pad per hour, pass large clots, notice a foul odor, or develop a fever.'}
              </p>
            </div>
          </div>

          {/* Respectful Archive Pregnancy Record Option */}
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Archive size={18} className="text-[#718096]" />
              <h2 className="font-serif font-bold text-sm text-[#1A202C]">
                {isSw ? 'Kuhifadhi Kumbukumbu kwa Heshima' : 'Respectful Record Archival'}
              </h2>
            </div>
            <p className="text-xs text-[#718096] leading-relaxed">
              {isSw
                ? 'Hatufuti rekodi zako za kliniki au vipimo. Unaweza kuchagua kuhifadhi ujauzito huu kwenye kumbukumbu ya faragha ili usionekane kwenye skrini kuu ya kila siku.'
                : 'We do not erase your clinical records. You may respectfully archive this pregnancy so it rests in your private vault rather than displaying on your active dashboard.'}
            </p>

            <button
              type="button"
              onClick={handleArchiveRecord}
              disabled={saving || archived}
              className="w-full min-h-[48px] rounded-full border border-[#E2E8F0] bg-[#F9F8F5] hover:bg-[#F1EFEA] text-xs font-bold text-[#4A5568] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            >
              <Archive size={16} />
              <span>
                {archived
                  ? isSw
                    ? 'Kumbukumbu Imehifadhiwa'
                    : 'Record Safely Archived'
                  : isSw
                  ? 'Hifadhi Kumbukumbu kwa Heshima'
                  : 'Respectfully Archive Pregnancy Record'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
