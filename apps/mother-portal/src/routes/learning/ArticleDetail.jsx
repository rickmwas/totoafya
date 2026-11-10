import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  HeartPulse,
  Sparkles,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { PillButton } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';

/**
 * ArticleDetail (SCR-20: /guide/article)
 * "The Sunlit Botanical Editorial" Clinical Learning Article Surface
 *
 * Implements:
 * 1. Editorial layout with Merriweather serif typography
 * 2. Category badge and reading time indicator
 * 3. "Save to Care Plan" primary interactive action
 * 4. Midwife-verified Kenyan maternal nutrition and clinical guidelines
 * 5. Zero Unicode emojis, minimum 48x48px hit targets
 */

export default function ArticleDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [savedToPlan, setSavedToPlan] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleSave = () => {
    setSavedToPlan((prev) => !prev);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isSw ? 'Lishe Bora ya Mama Mjamzito' : 'Optimal Maternal Nutrition in Kenya',
          text: isSw
            ? 'Soma mwongozo wa afya ya uzazi kutoka TotoAfya Digital.'
            : 'Read this maternal health guide from TotoAfya Digital.',
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AppShell>
      <div className="bg-[#F9F8F5] min-h-screen flex flex-col font-sans text-[#1A202C] pb-24">
        {/* Top Header Navigation */}
        <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <button
            onClick={() => navigate(-1)}
            className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center transition-colors active:scale-95"
            aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
          >
            <ArrowLeft size={20} />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-[#006B5F]">
            {isSw ? 'Mwongozo wa Afya' : 'Health Guide'}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center transition-colors active:scale-95"
              aria-label={isSw ? 'Shiriki makala' : 'Share article'}
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleToggleSave}
              className={`min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center transition-colors active:scale-95 ${
                savedToPlan
                  ? 'bg-[#E6F4F1] text-[#006B5F]'
                  : 'hover:bg-[#F1EFEA] text-[#4A5568]'
              }`}
              aria-label={isSw ? 'Hifadhi kwenye mpango' : 'Save to care plan'}
            >
              {savedToPlan ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        </div>

        {/* Article Container */}
        <article className="max-w-[430px] mx-auto w-full px-5 pt-6 space-y-6">
          {/* Category & Read Time Meta */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#E6F4F1] text-[#006B5F] text-[11px] font-bold uppercase tracking-wider">
              {isSw ? 'Lishe & Uzazi' : 'Nutrition & ANC'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#718096]">
              <Clock size={13} />
              <span>{isSw ? 'Dakika 5 za kusoma' : '5 min read'}</span>
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A202C] leading-tight">
            {isSw
              ? 'Lishe Bora ya Mama Mjamzito: Mwongozo wa Vyakula Halisi vya Kenya'
              : 'Optimal Maternal Nutrition: A Kenya Whole-Foods Antenatal Guide'}
          </h1>

          {/* Midwife Endorsement Banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center shrink-0">
              <HeartPulse size={20} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-[#1A202C]">
                {isSw ? 'Imethibitishwa na Muuguzi Mkunga' : 'Reviewed by Certified Nurse-Midwife'}
              </p>
              <p className="text-[#718096] text-[11px]">
                {isSw ? 'Miongozo ya Wizara ya Afya (MoH Kenya)' : 'Kenya Ministry of Health ANC Guidelines'}
              </p>
            </div>
          </div>

          {/* Article Lead In */}
          <p className="font-serif text-base text-[#2D3748] leading-relaxed italic border-l-2 border-[#006B5F] pl-4">
            {isSw
              ? 'Mlo kamili wakati wa ujauzito hauhitaji vyakula ghali vya madukani. Vyakula asilia vinavyopatikana sokoni nchini Kenya vina virutubisho vyote muhimu vya kumjenga mtoto mwenye afya imara.'
              : 'Nourishing your growing baby does not require expensive imported supplements. Locally accessible Kenyan whole foods provide the exact macro and micronutrients needed for optimal fetal neurodevelopment and maternal energy.'}
          </p>

          {/* Section 1: Iron & Blood Volume */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#006B5F]">
              {isSw ? '1. Vyakula Vinavyojenga Damu (Madini ya Chuma)' : '1. Building Maternal Blood Volume (Iron & Folate)'}
            </h2>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              {isSw
                ? 'Wakati wa ujauzito, mwili unahitaji damu mara mbili zaidi kusaidia mtoto kukua vizuri na kuzuia upungufu wa damu (anemia). Changanya mboga za kienyeji na vyanzo vya vitamini C ili kuongeza ufyonzwaji wa chuma:'
                : 'During pregnancy, your blood volume expands significantly to support the placenta and growing baby. Pairing iron-rich plant sources with natural Vitamin C dramatically boosts mineral absorption:'}
            </p>
            <ul className="space-y-2 text-xs text-[#2D3748]">
              <li className="flex items-start gap-2 bg-white rounded-xl p-3 border border-[#E2E8F0]">
                <CheckCircle2 size={16} className="text-[#006B5F] shrink-0 mt-0.5" />
                <span>
                  <strong>{isSw ? 'Mboga za Majani:' : 'Traditional Greens:'}</strong>{' '}
                  {isSw
                    ? 'Managu, Terere (Amaranth), Kunde, na Sukuma wiki iliyopikwa kiasi bila kuivisha kupita kiasi.'
                    : 'Managu (African nightshade), Terere (Amaranth greens), Cowpea leaves (Kunde), and lightly steamed Sukuma wiki.'}
                </span>
              </li>
              <li className="flex items-start gap-2 bg-white rounded-xl p-3 border border-[#E2E8F0]">
                <CheckCircle2 size={16} className="text-[#006B5F] shrink-0 mt-0.5" />
                <span>
                  <strong>{isSw ? 'Samaki Wadogo (Omena):' : 'Silver Cyprinid (Omena):'}</strong>{' '}
                  {isSw
                    ? 'Omena ina madini tele ya chuma, calcium, na mafuta ya Omega-3 yanayosaidia ubongo wa mtoto.'
                    : 'Omena is an exceptional, economical source of bioavailable iron, dietary calcium, and brain-building Omega-3 fatty acids.'}
                </span>
              </li>
              <li className="flex items-start gap-2 bg-white rounded-xl p-3 border border-[#E2E8F0]">
                <CheckCircle2 size={16} className="text-[#006B5F] shrink-0 mt-0.5" />
                <span>
                  <strong>{isSw ? 'Vidonge vya IFAS:' : 'Daily IFAS Tablets:'}</strong>{' '}
                  {isSw
                    ? 'Meza kidonge chako cha IFAS (Iron & Folic Acid) kila siku bila kuacha pamoja na maji safi au juisi ya machungwa.'
                    : 'Take your combined Iron-Folic Acid Supplement (IFAS) tablet daily with water or fresh orange juice, never with tea or coffee.'}
                </span>
              </li>
            </ul>
          </section>

          {/* Section 2: Energy & Fiber */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#006B5F]">
              {isSw ? '2. Nguvu Endelevu na Usagaji Chakula' : '2. Sustained Energy & Digestive Comfort'}
            </h2>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              {isSw
                ? 'Nafaka zisizokobolewa kama Dona Ugali, mtama, ulezi, na viazi vitamu hutoa nguvu ya taratibu mwilini na kuzuia tatizo la kufunga choo (constipation).'
                : 'Whole grains such as whole-grain maize (Dona Ugali), sorghum, finger millet, and sweet potatoes release sustained energy while dietary fiber prevents pregnancy-related constipation.'}
            </p>
          </section>

          {/* Save to Care Plan CTA Card */}
          <div className="bg-gradient-to-br from-[#006B5F] to-[#004D44] text-white rounded-[24px] p-5 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#FEF3C7]" />
              <h3 className="font-serif font-bold text-sm">
                {isSw ? 'Mpango wako wa Afya wa Kila Siku' : 'Personalized Antenatal Care Plan'}
              </h3>
            </div>
            <p className="text-xs text-[#E6F4F1] leading-relaxed">
              {isSw
                ? 'Hifadhi mwongozo huu ili vidokezo hivi viwe sehemu ya ukumbusho wako wa kila siku kwenye kliniki ya ANC.'
                : 'Add this dietary protocol to your personal care plan to receive gentle daily meal reminders and antenatal tracking.'}
            </p>
            <PillButton
              variant="secondary"
              size="md"
              onClick={handleToggleSave}
              className="w-full justify-center"
            >
              {savedToPlan ? (
                <>
                  <BookmarkCheck size={16} />
                  <span>{isSw ? 'Imehifadhiwa kwenye Mpango' : 'Saved to Care Plan'}</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>{isSw ? 'Hifadhi kwenye Mpango wa Malezi' : 'Save to Care Plan'}</span>
                </>
              )}
            </PillButton>
          </div>

          {/* Back to Learning Hub */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/learn')}
              className="w-full min-h-[48px] rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between text-xs font-bold text-[#006B5F] hover:bg-[#F9F8F5] transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{isSw ? 'Tazama Makala na Masomo Zaidi' : 'Explore More Learning Topics'}</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
