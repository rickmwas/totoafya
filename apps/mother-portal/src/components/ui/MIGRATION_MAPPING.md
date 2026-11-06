# Mother Portal UI Component Migration Mapping

All redundant copy-pasted shadcn/ui primitives have been purged in favor of `@totoafya/shared-ui` and `@totoafya/design-system`.

| Legacy Local Path | Recommended Replacement | Notes |
| :--- | :--- | :--- |
| `@/components/ui/button` | `@totoafya/shared-ui` -> `Button` | Accessible 44px min touch target, brand variants |
| `@/components/ui/input` | `@totoafya/shared-ui` -> `Input`, `SearchInput` | Bilingual, accessible helper text & error states |
| `@/components/ui/badge` | `@totoafya/shared-ui` -> `Badge` | Clinical status & WHO risk badges |
| `@/components/ui/card` | `@totoafya/shared-ui` -> `Card`, `CardHeader`, `CardTitle`, `CardContent` | Standard elevation & borders |
| `@/components/ui/table` | `@totoafya/shared-ui` -> `Table`, `TableHeader`, `TableRow`, `TableCell` | Responsive queue & history tables |
| `@/components/ui/toast` | `@/components/ui/toaster` | Retained local toaster integration |

Tokens and design rules are loaded from `@totoafya/design-system` via the shared Tailwind preset.
