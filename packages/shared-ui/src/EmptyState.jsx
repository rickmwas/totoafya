import React from 'react';
import {
  Baby,
  HeartPulse,
  Syringe,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { PillButton } from './PillButton';
import { cn } from './utils';

/**
 * EmptyState (SCR-26)
 * "The Sunlit Botanical Editorial" Empty State Component
 *
 * Implements:
 * 1. Handcrafted Lucide SVG line vector icons in warm stone/teal circle (zero empty grey boxes)
 * 2. Encouraging, non-judgmental bilingual headline and description
 * 3. Primary action PillButton with guaranteed 48x48px hit target
 * 4. Presets: pregnancy, child, vaccines, growth, articles, outbox
 */

const PRESETS = {
  pregnancy: {
    icon: HeartPulse,
    titleEn: 'Start Your Antenatal Journey',
    titleSw: 'Anza Safari Yako ya Ujauzito',
    descEn: 'Track appointments, fetal growth, and maternal milestones with gentle care.',
    descSw: 'Fuatilia miadi ya kliniki, ukuaji wa mtoto, na afya yako kwa amani na utulivu.',
    actionLabelEn: '+ Record First ANC Visit',
    actionLabelSw: '+ Rekodi Ziara ya Kwanza ya ANC',
    color: '#006B5F',
    bg: '#E6F4F1',
  },
  child: {
    icon: Baby,
    titleEn: 'Register Your Child',
    titleSw: 'Sajili Mtoto Wako',
    descEn: 'Keep all immunization, WHO growth records, and developmental milestones in one safe place.',
    descSw: 'Hifadhi rekodi zote za chanjo, ukuaji wa WHO, na hatua za mtoto mahali pamoja salama.',
    actionLabelEn: '+ Add Child Profile',
    actionLabelSw: '+ Ongeza Wasifu wa Mtoto',
    color: '#006B5F',
    bg: '#E6F4F1',
  },
  vaccines: {
    icon: Syringe,
    titleEn: 'No Vaccines Recorded Yet',
    titleSw: 'Hakuna Chanjo Zilizorekodiwa Bado',
    descEn: 'The KEPI cascade keeps your baby protected. Record doses received at your health center.',
    descSw: 'Ratiba ya KEPI inalinda afya ya mtoto wako. Rekodi dozi zilizotolewa hospitalini.',
    actionLabelEn: 'View KEPI Schedule',
    actionLabelSw: 'Tazama Ratiba ya KEPI',
    color: '#E68A00',
    bg: '#FEF3C7',
  },
  growth: {
    icon: TrendingUp,
    titleEn: 'No Growth Records Logged',
    titleSw: 'Hakuna Vipimo vya Ukuaji Bado',
    descEn: 'Tracking weight and height helps monitor healthy physical and nutritional development.',
    descSw: 'Kufuatilia uzito na urefu kunasaidia kujua maendeleo mazuri ya lishe na afya ya mtoto.',
    actionLabelEn: '+ Log First Measurement',
    actionLabelSw: '+ Rekodi Kipimo cha Kwanza',
    color: '#006B5F',
    bg: '#E6F4F1',
  },
  articles: {
    icon: BookOpen,
    titleEn: 'No Saved Articles Yet',
    titleSw: 'Hakuna Makala Yaliyohifadhiwa',
    descEn: 'Bookmark helpful midwife tips and health guides to read anytime, even offline.',
    descSw: 'Hifadhi makala na vidokezo vya mkunga ili usome wakati wowote, hata bila mtandao.',
    actionLabelEn: 'Explore Learning Hub',
    actionLabelSw: 'Gundua Makala ya Afya',
    color: '#7C3AED',
    bg: '#F5F0FF',
  },
  outbox: {
    icon: CheckCircle2,
    titleEn: 'All Records Are Synced',
    titleSw: 'Marekebisho Yote Yamesawazishwa',
    descEn: 'Your offline mutation outbox is completely clear. All clinical data is securely backed up.',
    descSw: 'Hakuna rekodi zinazosubiri. Data zote zimehifadhiwa salama kwenye seva.',
    actionLabelEn: 'Check Vault Status',
    actionLabelSw: 'Kagua Hali ya Usawazishaji',
    color: '#006B5F',
    bg: '#E6F4F1',
  },
};

export function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  titleEn,
  titleSw,
  description,
  descEn,
  descSw,
  actionLabel,
  actionLabelEn,
  actionLabelSw,
  onAction,
  lang = 'sw',
  className,
  children,
}) {
  const isSw = lang === 'sw';
  const config = (preset && PRESETS[preset]) || null;

  const IconComponent = CustomIcon || config?.icon || FolderOpen;
  const displayTitle =
    title ||
    (isSw ? titleSw || config?.titleSw : titleEn || config?.titleEn) ||
    (isSw ? 'Hakuna Taarifa Bado' : 'No Information Yet');

  const displayDesc =
    description ||
    (isSw ? descSw || config?.descSw : descEn || config?.descEn) ||
    (isSw ? 'Hakuna rekodi zilizopatikana kwa sasa.' : 'No records found at this time.');

  const displayActionLabel =
    actionLabel ||
    (isSw
      ? actionLabelSw || config?.actionLabelSw
      : actionLabelEn || config?.actionLabelEn);

  const iconBg = config?.bg || '#F1EFEA';
  const iconColor = config?.color || '#006B5F';

  return (
    <div
      className={cn(
        'bg-white rounded-[28px] border border-[#F1EFEA] p-8 text-center shadow-sm flex flex-col items-center max-w-md mx-auto my-4',
        className
      )}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105"
        style={{ backgroundColor: iconBg }}
      >
        <IconComponent size={28} style={{ color: iconColor }} strokeWidth={2} />
      </div>

      <h3 className="font-serif text-lg font-bold text-[#1A202C] leading-snug mb-2">
        {displayTitle}
      </h3>

      <p className="text-xs text-[#4A5568] leading-relaxed max-w-xs mb-6">
        {displayDesc}
      </p>

      {displayActionLabel && onAction && (
        <PillButton
          variant="primary"
          size="md"
          onClick={onAction}
          className="shadow-sm"
        >
          {displayActionLabel}
        </PillButton>
      )}

      {children}
    </div>
  );
}
