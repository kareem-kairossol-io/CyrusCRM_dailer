# CRM Mobile App — Screens & Theme Spec

This document is written for an AI coding model to implement. Follow every instruction literally and exactly. Do not improvise colors, spacing, or component structure that isn't listed here — if something isn't specified, pick the closest matching value that IS specified elsewhere in this document.

The app is React Native + Expo Router (`expo-router`), with native bottom tabs (`expo-router/unstable-native-tabs`). It already supports light/dark mode via `useColorScheme()` and a `Colors` object in `@/constants/theme`.

Stack: TypeScript, React Native `StyleSheet`, Expo Router file-based routing.

---

## 0. Files that already exist (functional, unstyled — DO NOT change their logic, only their styling)

| File | Purpose |
|---|---|
| `components/app-tabs.tsx` | Bottom tab bar: Home, Calls |
| `app/(tabs)/index.tsx` | Home screen (exists in project, needs styling per Section 4) |
| `app/(tabs)/calls.tsx` | Calls list screen — already wired to `CallLogService.getCalls()` |
| `app/call-actions/[id].tsx` | Call detail/actions screen — already wired to `CallLogService.getCallById()` / `deleteCall()` |
| `services/CallLogService.ts` | Data source. Do not modify. |

Your job: apply the theme/styles below to these files, and build out the Home screen content. Do not change any data-fetching logic, state logic, or navigation logic — only JSX structure needed for new visual elements (cards, badges, icons) and `StyleSheet` values.

---

## 1. Theme Source of Truth

The color palette, typography scale, radius scale, and shadow rules below are taken directly from the company's existing CRM web design system and must be reused as-is for brand consistency, just applied to React Native instead of CSS.

**Do NOT apply right-to-left (RTL) mirroring, Arabic font, or Arabic copy to this app.** This mobile app is LTR / English UI. The RTL rules in the original web spec do not apply here — ignore them entirely. Only the colors, type scale, spacing, radius, and shadow rules carry over.

### 1a. Color Palette

Define these in `constants/theme.ts` inside the existing `Colors` object, under `light` and `dark`:

| Token | Light mode value | Dark mode value |
|---|---|---|
| `background` | `#FAF9F7` (off-white) | `#0B0B0C` (near-black) |
| `backgroundElement` (cards, rows) | `#FFFFFF` | `rgba(255,255,255,0.04)` |
| `text` (primary) | `#1A1A1A` | `#FFFFFF` |
| `textSecondary` | `#6B6B70` | `#C9C9CC` |
| `border` | `#E7E5E1` | `rgba(255,255,255,0.08)` |
| `accent` (primary/orange) | `#E8862B` | `#E8862B` |
| `accentGradientStart` | `#F2A23D` | `#F2A23D` |
| `accentGradientEnd` | `#E8862B` | `#E8862B` |
| `success` | `#2E9E5B` | `#3DBE73` |
| `danger` | `#D64545` | `#E5605F` |
| `badgeBackground` | `rgba(232,134,43,0.10)` | `rgba(255,255,255,0.06)` |

Accent orange (`#E8862B`) never changes between light/dark — it's the one fixed brand color.

### 1b. Typography

Use the system font (no custom font family needed for this mobile app — that was Arabic-Kufi-specific to the web login, not applicable here).

| Role | Size | Weight | Color token |
|---|---|---|---|
| Screen title (e.g. "Calls") | 28 | 700 | `text` |
| Section heading | 18 | 700 | `text` |
| Body / list primary (contact name) | 16 | 600 | `text` |
| Body secondary (meta line) | 13 | 400 | `textSecondary` |
| Small label / caption | 12 | 500 | `textSecondary` |
| Stat number | 26 | 800 | `text` |

### 1c. Radius Scale

- Small elements (badges, chips): `999` (full pill)
- Buttons, inputs: `12`
- Cards, rows-as-cards: `16`
- Large containers / bottom sheets: `20`

### 1d. Shadow Rules — exactly 3 places allowed, nowhere else

1. **Primary button** — faint colored shadow only:
   `shadowColor: '#E8862B', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }` (Android: `elevation: 3`)
2. **Floating/modal elements** (e.g. delete confirmation sheet, if custom-built instead of native `Alert`):
   `shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }`
3. Nothing else. List rows, cards, tab bar, inputs = **no shadow**. Separation comes only from `background` vs `backgroundElement` contrast and the thin `border` token, never from shadow.

### 1e. Spacing

Use an 4/8/12/16/20/24 spacing scale. Screen horizontal padding = `16`. Vertical gap between list rows = `0` (use a 1px `border` bottom divider instead, like the web spec's table rows). Gap between stacked cards/sections = `16`.

---

## 2. Components to Build

Build these as reusable components under `components/`. Each spec below lists props, states, and exact styling.

### 2a. `StatCard` (`components/stat-card.tsx`)
Used on Home for at-a-glance numbers (e.g. "Calls today", "Missed calls", "Avg. duration").

- Props: `icon` (optional), `value: string | number`, `label: string`
- Background: `backgroundElement` token
- Radius: `16`
- Padding: `20`
- No border in light mode; `1px solid border` token in dark mode
- No shadow
- Layout: icon (small, `accent` colored) at top, `value` below it using the "Stat number" type role, `label` below that using "Small label" type role
- Three `StatCard`s sit in a horizontal row with `12` gap between them, each taking equal width (`flex: 1`)

### 2b. `CallRow` (`components/call-row.tsx`)
Used in the Calls list (replaces the current inline `renderItem` in `app/(tabs)/calls.tsx` — extract it into this component, same props/behavior, just move the JSX+styles here and import it).

- Props: `call: CallRecord`, `onPress: () => void`
- Row layout: horizontal, `paddingHorizontal: 16`, `paddingVertical: 12`, bottom `border` divider (`1px`, `border` token), no radius (flat list row, not a card)
- Left side: a small circular avatar, 40x40, `borderRadius: 20`, background = `badgeBackground`, containing the first letter of `contactName` (or a phone icon if no name) in `accent` color, bold
- Middle (flex:1, marginLeft 12): contact name (Body/primary role) on top, meta line below it: `direction` icon + `status` badge (see `StatusBadge` below) + formatted date (Body/secondary role), all in one row with small gaps
- Right side: call duration (Small label role) and a direction arrow icon:
  - `direction === 'OUTGOING'` → arrow pointing up-right, `accent` color
  - `direction === 'INCOMING'` and `status === 'ANSWERED'` → arrow pointing down-left, `success` color
  - `status === 'NO_ANSWER'` → arrow pointing down-left, `danger` color
- Pressed state: background flashes to `rgba(232,134,43,0.04)` (same hover tint as the web table rows)

### 2c. `StatusBadge` (`components/status-badge.tsx`)
- Props: `status: 'ANSWERED' | 'NO_ANSWER'`
- Pill shape, radius `999`, padding `4px 10px`, font size 11, weight 600
- `ANSWERED`: background `rgba(46,158,91,0.12)`, text `success` token
- `NO_ANSWER`: background `rgba(214,69,69,0.12)`, text `danger` token

### 2d. `PrimaryButton` (`components/primary-button.tsx`)
Used for "Call back" on the Call Actions screen and any other primary action.
- Background: linear gradient `accentGradientStart` → `accentGradientEnd`, left-to-right (use `expo-linear-gradient`, already a common Expo dependency — add it if not present)
- Text: white, weight 700, size 16
- Radius: `14`
- Padding: `16` vertical, `20` horizontal
- Shadow: see Section 1d rule #1
- Full width within its container
- Pressed state: reduce opacity to `0.9`, no other change

### 2e. `SecondaryButton` (`components/secondary-button.tsx`)
Used for "Delete call" and "Play recording" on Call Actions.
- Background: `backgroundElement` token
- Border: `1px solid border` token
- Text: `text` token, weight 600, size 15
- Radius: `10`
- Padding: `14` vertical, `16` horizontal
- No shadow
- "Delete call" variant additionally sets text color to `danger` token — pass a `variant="danger"` prop for this

### 2f. `EmptyState` (`components/empty-state.tsx`)
- Props: `message: string`, optional `actionLabel` + `onAction`
- Centered vertically and horizontally, icon (generic, `textSecondary` color) above `message` (Body/secondary role), optional `SecondaryButton` below if `actionLabel` provided

---

## 3. Calls Screen (`app/(tabs)/calls.tsx`) — styling pass

The data logic (loading, error, refresh, list) already works. Apply this styling:

- Screen background: `background` token
- Screen title "Calls" at top, Screen-title type role, `paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8`
- Replace the inline row rendering with `<CallRow call={item} onPress={() => router.push(...)} />`
- Loading state: centered `ActivityIndicator` with `color={accent}`
- Error state: centered `EmptyState` with `message="Could not load calls."` and `actionLabel="Retry"` wired to the existing `loadCalls` retry function
- Empty state (no calls): centered `EmptyState` with `message="No calls yet."`, no action button
- Pull-to-refresh indicator tint: `accent` token (`tintColor` on iOS, `colors={[accent]}` on Android)

---

## 4. Home Screen (`app/(tabs)/index.tsx`) — build this out

Currently a placeholder. Build it as a dashboard:

1. **Header**: "Home" title (Screen-title role) + a short subtitle line, e.g. "Here's what's happening with your calls." (Body/secondary role). `paddingHorizontal: 16, paddingTop: 16`.
2. **Stat row**: three `StatCard`s in a horizontal row, computed client-side from `CallLogService.getCalls()`:
   - "Calls today" — count of calls where `date` falls within the current calendar day
   - "Missed" — count where `status === 'NO_ANSWER'`
   - "Avg. duration" — average `duration` of answered calls, formatted `m:ss`
3. **Recent calls section**: Section-heading "Recent calls", followed by up to 5 most recent `CallRow` items (reuse the same component from Section 2b), each pressable to `call-actions/[id]` just like on the Calls screen. Below the list, a `SecondaryButton` labeled "See all calls" that navigates to the Calls tab (`router.push('/(tabs)/calls')` or `router.push('/calls')` depending on the project's route naming — match whatever `app/(tabs)/calls.tsx` resolves to).
4. Fetch calls once on mount using `CallLogService.getCalls()`, same loading/error handling pattern as the Calls screen (reuse `ActivityIndicator` / `EmptyState`).
5. Vertical gap of `16` between Header, Stat row, and Recent calls section. Whole screen wrapped in a `ScrollView` with `contentContainerStyle={{ paddingBottom: 24 }}`.

---

## 5. Call Actions Screen (`app/call-actions/[id].tsx`) — styling pass

The data logic (fetch by id, call back, delete, recording check) already works. Apply this styling:

- Screen background: `background` token, `padding: 20`
- At top: large avatar (56x56, same style as `CallRow`'s avatar but bigger, initial + `badgeBackground`/`accent`), centered, with contact name (Section-heading role) below it centered, then phone number (Body/secondary role) centered
- Below that, a small row of three pieces of info separated by `·`: direction, `StatusBadge`, formatted date/time — centered, Body/secondary role
- `24` vertical gap, then:
  - `PrimaryButton` "Call back" (always shown)
  - `SecondaryButton` "Play recording" (only shown if `call.recordingPath` is non-empty) — leave its `onPress` as a no-op/TODO, playback wiring is out of scope for this pass
  - `SecondaryButton` variant="danger" "Delete call" — keep the existing confirmation `Alert.alert` logic as-is, just restyle the button that triggers it
- `12` gap between the three buttons
- Not found state: centered `EmptyState` with `message="Call not found."`

---

## 6. Bottom Tab Bar (`components/app-tabs.tsx`)

Already wired with two triggers: `index` (Home) and `calls` (Calls). For this pass:

- Ensure `Colors.light.background` / `Colors.dark.background` and `backgroundElement` (for the tab bar's `indicatorColor`) match the tokens in Section 1a — update `constants/theme.ts` accordingly.
- Selected tab label/icon color should use the `accent` token (`#E8862B`) via `labelStyle.selected.color` and the icon's tint, replacing the current `colors.text` selected color.
- You need an icon asset `assets/images/tabIcons/calls.png` in the same monochrome/template style as the existing `home.png`, sized identically. If you cannot generate binary image assets, use a solid-color placeholder square PNG at the correct dimensions and leave a `// TODO: replace with final calls icon` comment.

---

## 7. What NOT to do

- Do not add RTL layout, Arabic fonts, or Arabic copy — this app is LTR/English.
- Do not add shadows anywhere outside the 3 places listed in Section 1d.
- Do not change any function names, state variables, or data-fetching calls in the existing screen files — only add styling and the new components listed above.
- Do not invent new colors outside the token table in Section 1a. If you need a new semantic color (e.g. "warning"), derive it the same way `success`/`danger` were derived and note it at the top of your PR/response instead of guessing silently.