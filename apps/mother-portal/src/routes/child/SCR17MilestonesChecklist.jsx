import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Filter,
} from 'lucide-react';
import {
  CHILD_MILESTONES_CATALOG,
  getMilestonesByAgeBand,
  getMilestonesByCategory,
  resolveAgeBandFromMonths,
  MILESTONE_CATEGORIES,
  MILESTONE_AGE_BANDS,
} from '@totoafya/business-logic';
import { MilestoneCard, StatusBadge, PillButton } from '@totoafya/shared-ui';

export function SCR17MilestonesChecklist({
  lang = 'en',
  onNavigate,
  childAgeMonths = 4,
  childName = 'Joy Wambui',
  className = '',
}) {
  const isSw = lang === 'sw';

  // Default to child's current age band
  const initialAgeBand = resolveAgeBandFromMonths(childAgeMonths);
  const [selectedAgeBand, setSelectedAgeBand] = useState(initialAgeBand);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'motor' | 'cognitive' | 'language' | 'social' | 'feeding'

  // Map of completed milestone IDs (optimistic local state)
  const [completedMap, setCompletedMap] = useState({
    'm-0-3m-motor': true,
    'm-0-3m-cognitive': true,
    'm-0-3m-language': true,
    'm-0-3m-social': true,
    'm-0-3m-feeding': true,
    'm-3-6m-motor': true,
    'm-3-6m-social': true,
  });

  const toggleMilestone = (id) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter milestones by selected age band and category
  const filteredMilestones = useMemo(() => {
    let list = selectedAgeBand === 'all'
      ? CHILD_MILESTONES_CATALOG
      : getMilestonesByAgeBand(selectedAgeBand);

    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category === selectedCategory);
    }
    return list;
  }, [selectedAgeBand, selectedCategory]);

  // Completion calculation for selected age band
  const ageBandMilestones = useMemo(() => {
    return selectedAgeBand === 'all'
      ? CHILD_MILESTONES_CATALOG
      : getMilestonesByAgeBand(selectedAgeBand);
  }, [selectedAgeBand]);

  const completedCount = ageBandMilestones.filter((m) => Boolean(completedMap[m.id])).length;
  const totalCount = ageBandMilestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      data-testid="scr17-milestones-checklist"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-12 text-left bg-[#F9F8F5] min-h-screen ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              aria-label={isSw ? 'Rudi nyumbani' : 'Back to dashboard'}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F1EFEA] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1A202C] tracking-tight">
              {isSw ? 'Hatua za Makuzi (Milestones)' : 'Developmental Milestones'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {childName} • {isSw ? `Umri: Miezi ${childAgeMonths}` : `Age: ${childAgeMonths} Months`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Card & Summary */}
      <section
        aria-label={isSw ? 'Maendeleo ya Makuzi' : 'Milestones Progress Summary'}
        className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Utekelezaji wa Hatua' : 'Milestones Achieved'}
          </span>
          <span className="text-lg font-bold text-[#1A202C]">
            {completedCount} / {totalCount} {isSw ? 'Zimefikiwa' : 'Achieved'}
          </span>
          <span className="text-xs text-[#15803D] font-medium">
            {progressPercent}% {isSw ? 'katika kipindi hiki' : 'completed in this age band'}
          </span>
        </div>

        {/* Small progress meter */}
        <div className="w-14 h-14 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#E2E8F0]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#006B5F]"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[11px] font-bold font-mono text-[#1A202C]">
            {progressPercent}%
          </span>
        </div>
      </section>

      {/* Age Band Filter Tabs (8 bands) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
          {isSw ? 'Chagua Umri wa Mtoto:' : 'Select Age Band:'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {Object.values(MILESTONE_AGE_BANDS).map((band) => {
            const isActive = selectedAgeBand === band.id;
            return (
              <button
                key={band.id}
                type="button"
                onClick={() => setSelectedAgeBand(band.id)}
                className={`min-h-[48px] px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#006B5F] text-white shadow-xs ring-2 ring-[#006B5F] ring-offset-2 ring-offset-[#F9F8F5]'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:bg-[#F9F8F5]'
                }`}
              >
                {isSw ? band.labelSw : band.labelEn}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedAgeBand('all')}
            className={`min-h-[48px] px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedAgeBand === 'all'
                ? 'bg-[#006B5F] text-white shadow-xs'
                : 'bg-white text-[#4A5568] border border-[#E2E8F0] hover:bg-[#F9F8F5]'
            }`}
          >
            {isSw ? 'Zote (0–5y)' : 'All (0–5y)'}
          </button>
        </div>
      </div>

      {/* Category Filter Chips (5 categories) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`min-h-[48px] px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#1A202C] text-white'
              : 'bg-white text-[#718096] border border-[#E2E8F0]'
          }`}
        >
          {isSw ? 'Idara Zote' : 'All Categories'}
        </button>
        {Object.values(MILESTONE_CATEGORIES).map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[48px] px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-[#1A202C] text-white'
                  : 'bg-white text-[#718096] border border-[#E2E8F0]'
              }`}
            >
              {isSw ? cat.labelSw : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Checklist Stream using MilestoneCard */}
      <div className="flex flex-col gap-4">
        {filteredMilestones.map((milestone) => {
          const isDone = Boolean(completedMap[milestone.id]);

          return (
            <div key={milestone.id} className="flex flex-col gap-2">
              <MilestoneCard
                title={milestone.title}
                titleSw={milestone.titleSw}
                description={milestone.description}
                descriptionSw={milestone.descriptionSw}
                category={milestone.categoryEn}
                categorySw={milestone.categorySw}
                timing={milestone.ageBandLabelEn}
                timingSw={milestone.ageBandLabelSw}
                status={isDone ? 'achieved' : 'in_progress'}
                isCompleted={isDone}
                actionLabel={isDone ? 'Imefikiwa (Achieved)' : 'Weka Kuwa Imefikiwa'}
                actionLabelSw={isDone ? 'Imefikiwa' : 'Weka Kuwa Imefikiwa'}
                onAction={() => toggleMilestone(milestone.id)}
                lang={lang}
              />

              {/* Red-Flag Alert Warning if delayed */}
              {milestone.isRedFlagIfDelayed && !isDone && (
                <div className="ml-2 -mt-1 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#1A202C] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>{isSw ? 'Ushauri wa Kliniki:' : 'Clinical Milestone Note:'}</strong>{' '}
                    {isSw ? (milestone.redFlagWarningSw || '') : (milestone.redFlagWarningEn || '')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
