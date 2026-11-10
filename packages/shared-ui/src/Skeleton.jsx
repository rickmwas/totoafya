import React from 'react';
import { cn } from './utils';

/**
 * Skeleton Primitives & Composites (SCR-25)
 * "The Sunlit Botanical Editorial" warm stone pulse (bg-[#F1EFEA] animate-pulse)
 */

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('bg-[#F1EFEA] animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-[24px] border border-[#F1EFEA] p-5 shadow-sm space-y-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function HeroSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-[28px] border border-[#F1EFEA] p-6 shadow-sm flex flex-col items-center text-center space-y-4',
        className
      )}
      {...props}
    >
      <Skeleton className="h-6 w-32 rounded-full" />
      <Skeleton className="w-24 h-24 rounded-full" />
      <div className="space-y-2 w-full flex flex-col items-center">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <div className="w-full pt-2 flex gap-3 justify-center">
        <Skeleton className="h-12 w-36 rounded-full" />
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
    </div>
  );
}

export function TimelineSkeleton({ items = 3, className, ...props }) {
  return (
    <div className={cn('space-y-6 relative pl-6', className)} {...props}>
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#F1EFEA]" />
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="relative flex items-start gap-4">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#F1EFEA] flex items-center justify-center">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#F1EFEA] p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArticleCardSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl overflow-hidden border border-[#F1EFEA] shadow-sm flex p-3 gap-3',
        className
      )}
      {...props}
    >
      <Skeleton className="w-28 h-24 rounded-2xl shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function MilestoneHeroSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-b from-[#F9F8F5] to-white rounded-[32px] border border-[#F1EFEA] p-6 shadow-sm space-y-5',
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <div className="flex items-center gap-5">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      </div>
      <div className="pt-2 flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
    </div>
  );
}
