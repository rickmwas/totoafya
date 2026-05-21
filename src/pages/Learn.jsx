import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Play, Clock, BookOpen, Star } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG = {
  breastfeeding: { icon: '🤱', color: '#E91E8C', bg: '#FFF0F6', en: 'Breastfeeding', sw: 'Kunyonyesha' },
  nutrition:     { icon: '🥗', color: '#2E7A5D', bg: '#F0FBF6', en: 'Nutrition', sw: 'Lishe' },
  immunization:  { icon: '💉', color: '#0047FF', bg: '#EFF4FF', en: 'Immunization', sw: 'Chanjo' },
  hygiene:       { icon: '🧼', color: '#0099CC', bg: '#EEF9FF', en: 'Hygiene', sw: 'Usafi' },
  development:   { icon: '🌱', color: '#7C3AED', bg: '#F5F0FF', en: 'Development', sw: 'Maendeleo' },
  pregnancy:     { icon: '🤰', color: '#F9A825', bg: '#FFF8E1', en: 'Pregnancy', sw: 'Ujauzito' },
  danger_signs:  { icon: '⚠️', color: '#E51010', bg: '#FFF0F0', en: 'Danger Signs', sw: 'Dalili za Hatari' },
  family_planning: { icon: '👨👩👧', color: '#666666', bg: '#F5F5F7', en: 'Family Planning', sw: 'Uzazi wa Mpango' },
};

const SAMPLE_CONTENT = [
  { id:'lc1', title:'How to Breastfeed Your Newborn', title_sw:'Jinsi ya Kunyonyesha Mtoto Mchanga', category:'breastfeeding', content_type:'video', duration_seconds:480, is_featured:true, thumbnail_url:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=250&fit=crop', target_audience:'newborn' },
  { id:'lc2', title:'Nutrition During Pregnancy', title_sw:'Lishe Wakati wa Ujauzito', category:'nutrition', content_type:'video', duration_seconds:360, thumbnail_url:'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=250&fit=crop', target_audience:'pregnant' },
  { id:'lc3', title:'Understanding Your Child\'s Vaccines', title_sw:'Kuelewa Chanjo za Mtoto Wako', category:'immunization', content_type:'video', duration_seconds:540, is_featured:true, thumbnail_url:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop', target_audience:'all' },
  { id:'lc4', title:'Baby\'s First Year: Developmental Milestones', title_sw:'Mwaka wa Kwanza wa Mtoto: Hatua za Maendeleo', category:'development', content_type:'video', duration_seconds:720, thumbnail_url:'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=250&fit=crop', target_audience:'infant' },
  { id:'lc5', title:'Danger Signs in Pregnancy', title_sw:'Dalili za Hatari Wakati wa Ujauzito', category:'danger_signs', content_type:'video', duration_seconds:300, thumbnail_url:'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=250&fit=crop', target_audience:'pregnant' },
  { id:'lc6', title:'Handwashing & Hygiene for New Mothers', title_sw:'Kunawa Mikono na Usafi kwa Mama Wapya', category:'hygiene', content_type:'video', duration_seconds:240, thumbnail_url:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop', target_audience:'all' },
  { id:'lc7', title:'Complementary Feeding: 6 Months+', title_sw:'Chakula cha Ziada: Miezi 6+', category:'nutrition', content_type:'video', duration_seconds:420, thumbnail_url:'https://images.unsplash.com/photo-1528820530954-4dac0c890527?w=400&h=250&fit=crop', target_audience:'infant' },
  { id:'lc8', title:'Safe Sleep for Your Baby', title_sw:'Usingizi Salama kwa Mtoto Wako', category:'development', content_type:'video', duration_seconds:300, thumbnail_url:'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=250&fit=crop', target_audience:'newborn' },
];

const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  return `${m} min`;
};

export default function Learn() {
  const { t, lang } = useLang();
  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [activeCategory, setActiveCategory] = useState('all');
  const [playing, setPlaying] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const items = await db.entities.LearningContent.list('-view_count', 50);
      if (items.length > 0) setContent(items);
    } catch (e) {
      // Use sample content
    }
  };

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];
  const filtered = activeCategory === 'all' ? content : content.filter(c => c.category === activeCategory);
  const featured = content.filter(c => c.is_featured).slice(0, 3);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-14 pb-5">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0] mb-1">
            {lang === 'sw' ? 'ELIMU YA AFYA' : 'HEALTH EDUCATION'}
          </p>
          <h1 className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[#0A0A0A]">
            {t('learning_hub')}
          </h1>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] px-4 mb-3">
              {lang === 'sw' ? 'ILIYOCHAGULIWA' : 'FEATURED'}
            </p>
            <div className="flex gap-3 px-4 overflow-x-auto pb-1 no-scrollbar">
              {featured.map(item => {
                const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.nutrition;
                return (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-64 rounded-[20px] overflow-hidden border border-[#E5E5E5] bg-white shadow-card active:scale-[0.97] transition-all cursor-pointer"
                    onClick={() => setPlaying(item)}
                  >
                    <div className="relative h-36">
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-float">
                          <Play size={18} className="text-[#0A0A0A] ml-0.5" fill="#0A0A0A" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] tracking-[0.12em] uppercase font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: cat.color }}>
                          {cat.icon} {lang === 'sw' ? cat.sw : cat.en}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
                        <Clock size={9} className="text-white" />
                        <span className="text-[9px] text-white font-medium">{formatDuration(item.duration_seconds)}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] font-bold text-[#0A0A0A] leading-tight line-clamp-2">
                        {lang === 'sw' && item.title_sw ? item.title_sw : item.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 px-4 overflow-x-auto pb-1 no-scrollbar mb-4">
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all active:scale-[0.96]',
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-white border border-[#E5E5E5] text-[#666666]'
                )}
              >
                {config && <span>{config.icon}</span>}
                {cat === 'all'
                  ? (lang === 'sw' ? 'Zote' : 'All')
                  : (lang === 'sw' ? config?.sw : config?.en) || cat}
              </button>
            );
          })}
        </div>

        {/* Content grid */}
        <div className="px-4 flex flex-col gap-3 pb-4">
          {filtered.map(item => {
            const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.nutrition;
            return (
              <div
                key={item.id}
                className="bg-white rounded-[20px] overflow-hidden border border-[#E5E5E5] shadow-card flex active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => setPlaying(item)}
              >
                <div className="relative w-28 flex-shrink-0">
                  <img
                    src={item.thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.backgroundColor = cat.bg; e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: cat.bg + 'CC' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <Play size={14} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] tracking-[0.1em] uppercase font-bold" style={{ color: cat.color }}>
                      {lang === 'sw' ? cat.sw : cat.en}
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-[#0A0A0A] leading-snug line-clamp-2">
                    {lang === 'sw' && item.title_sw ? item.title_sw : item.title}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={11} className="text-[#A0A0A0]" />
                    <span className="text-[11px] text-[#A0A0A0]">{formatDuration(item.duration_seconds)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video modal */}
        {playing && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center px-4"
            onClick={() => setPlaying(null)}
          >
            <div
              className="bg-white rounded-[28px] overflow-hidden w-full max-w-[400px] shadow-float animate-bounce-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative bg-black h-48 flex items-center justify-center">
                {playing.video_url ? (
                  <video src={playing.video_url} controls className="w-full h-full" autoPlay />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                    <p className="text-[12px] text-white/60">
                      {lang === 'sw' ? 'Video haipatikani bila mtandao' : 'Video unavailable offline'}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-1">
                  {CATEGORY_CONFIG[playing.category]?.en || playing.category}
                </p>
                <p className="text-[17px] font-bold text-[#0A0A0A] leading-snug mb-4">
                  {lang === 'sw' && playing.title_sw ? playing.title_sw : playing.title}
                </p>
                <button
                  onClick={() => setPlaying(null)}
                  className="w-full h-12 rounded-full bg-[#0A0A0A] text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
                >
                  {lang === 'sw' ? 'Funga' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}