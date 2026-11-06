# Facility PC UI Component Migration Mapping

All redundant copy-pasted shadcn/ui primitives have been purged in favor of `@totoafya/shared-ui` and `@totoafya/design-system`.

| Legacy Local Path | Recommended Replacement | Notes |
| :--- | :--- | :--- |
| `@/components/ui/button` | `@totoafya/shared-ui` -> `Button` | Accessible 44px min touch target, brand variants |
| `@/components/ui/input` | `@totoafya/shared-ui` -> `Input`, `SearchInput` | Accessible helper text, error states, bilingual |
| `@/components/ui/badge` | `@totoafya/shared-ui` -> `Badge` | Clinical status & WHO risk badges |
| `@/components/ui/card` | `@totoafya/shared-ui` -> `Card`, `CardHeader`, `CardTitle`, `CardContent` | Elevation & borders |
| `@/components/ui/table` | `@totoafya/shared-ui` -> `Table`, `TableHeader`, `TableRow`, `TableCell` | Queue and census tables |
| `@/components/ui/toast` | `@/components/ui/toaster` | Retained local toaster plumbing |

Tokens and design rules are loaded from `@totoafya/design-system` via the shared Tailwind preset.
