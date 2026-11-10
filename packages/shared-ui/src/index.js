// Core Atomic & Molecular Primitives per "The Sunlit Botanical Editorial" (Wave 1 & Wave 2)
export { PillButton } from './PillButton.jsx';
export { StatusBadge } from './StatusBadge.jsx';
export { ModeSwitcherPill } from './ModeSwitcherPill.jsx';
export { TextInput } from './TextInput.jsx';
export { AppointmentBanner } from './AppointmentBanner.jsx';
export { DangerSignAlertBanner } from './DangerSignAlertBanner.jsx';
export { MUACIndicator } from './MUACIndicator.jsx';
export { OfflineSyncChip } from './atoms/OfflineSyncChip.jsx';

// Core 6-State Lifecycle Primitives (Wave 3 / TD-3.3: SCR-25, SCR-26, SCR-27)
export {
  Skeleton,
  CardSkeleton,
  HeroSkeleton,
  TimelineSkeleton,
  ArticleCardSkeleton,
  MilestoneHeroSkeleton,
} from './Skeleton.jsx';
export { EmptyState } from './EmptyState.jsx';
export { ErrorRecovery } from './ErrorRecovery.jsx';

// Core Organisms & Composite Molecules (Wave 2 / TD-2.1)
export { PregnancyMilestoneHero } from './PregnancyMilestoneHero.jsx';
export { ChildMilestoneHero } from './ChildMilestoneHero.jsx';
export { QuickActionCard } from './QuickActionCard.jsx';
export { MilestoneCard } from './MilestoneCard.jsx';

// Core Foundation & Layout Primitives (Retained for platform-wide compatibility)
export { Button } from './Button.jsx';
export { Input } from './Input.jsx';
export { SearchInput } from './SearchInput.jsx';
export { Badge } from './Badge.jsx';
export {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardContent,
  CardFooter,
} from './Card.jsx';
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from './Table.jsx';
export { SyncStatusBar } from './SyncStatusBar.jsx';
export { cn } from './utils.js';
