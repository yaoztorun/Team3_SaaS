# Sippin - AI Coding Agent Instructions

## Project Overview
Sippin is a **React Native Web PWA** (Progressive Web App) for cocktail enthusiasts. Built with TypeScript, it runs primarily as a web application with native-like mobile experience. Backend powered by **Supabase** (PostgreSQL + Auth + Storage).

**Live:** [team3-saas.vercel.app](https://team3-saas.vercel.app) (prod) | [team3-saasdev.vercel.app](https://team3-saasdev.vercel.app) (dev)

## Architecture

### Tech Stack
- **Frontend:** React Native Web, TypeScript, Expo
- **Styling:** NativeWind (Tailwind CSS for React Native) + GlueStack UI components
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Analytics:** PostHog (events) + Google Analytics 4 (acquisition)
- **Deployment:** Vercel (auto-deploy from `main` → prod, `dev` → staging)

### Key Directories
```
src/
├── api/          # Supabase query functions (cocktail.ts, profile.ts, etc.)
├── components/   
│   ├── global/   # Reusable components (PrimaryButton, CocktailCard, etc.)
│   └── ui/       # GlueStack UI wrappers (Box, Text, Button, etc.)
├── screens/      # Screen components organized by feature
│   ├── Add/      # Recipe creation (LogView, RecipeView)
│   ├── Auth/     # Login, Register, Reset Password
│   ├── Explore/  # Discovery features
│   ├── Home/     # Feed and cocktail details
│   ├── Profile/  # User profile and settings
│   ├── Social/   # Friends, events, community
│   └── navigation/ # Stack/Tab navigators
├── hooks/        # useAuth, useUserStats, etc.
├── types/        # TypeScript types (supabase.ts is auto-generated)
├── theme/        # colors.ts, spacing.ts, navigationTransitions.ts
├── utils/        # storage.ts, camera.ts, referral.ts, streak.ts
└── analytics/    # PostHog tracking (index.ts, ANALYTICS_EVENTS)
```

## Critical Patterns

### 1. Styling: NativeWind + Custom Components
- **Use `className` prop with Tailwind classes** for styling React Native components
- Example: `<Box className="flex-1 bg-white p-4">`
- **Theme colors** are defined in `global.css` CSS variables and mirrored in `src/theme/colors.ts`
- Primary teal: `colors.primary[500]` = `#14b8a6` (also `bg-primary-500` in Tailwind)
- **Buttons:** Use `<PrimaryButton>` for primary actions (has gradient + loading state)
- **UI primitives:** Import from `@/src/components/ui/*` (Box, Text, HStack, Center, Pressable)

### 2. Path Aliases
- `@/*` resolves to project root (configured in `tsconfig.json`)
- Example: `import { supabase } from '@/src/lib/supabase'`
- Always use path aliases for imports

### 3. Supabase Patterns

#### Type Generation
- Run `npm run types:generate` after schema changes to regenerate `src/types/supabase.ts`
- Use `Tables<'TableName'>` type for DB rows: `type DBCocktail = Tables<'Cocktail'>`

#### Query Structure (see `src/api/cocktail.ts`)
```typescript
// Always include related data with .select() joins
const { data, error } = await supabase
  .from('Cocktail')
  .select(`
    *,
    Profile (
      id,
      full_name,
      avatar_url
    )
  `)
  .eq('is_public', true)
  .order('created_at', { ascending: false });
```

#### Authentication
- Current user: `const { data: { user } } = await supabase.auth.getUser()`
- Auth state managed by `useAuth()` hook in `src/hooks/useAuth.tsx`
- Session persisted via `window.localStorage` (see `src/lib/supabase.ts`)

#### Image Upload (see `src/utils/storage.ts`)
```typescript
import uploadImageUri from '@/src/utils/storage';

// Uploads to Supabase Storage, returns public URL
const publicUrl = await uploadImageUri(uri, userId, 'filename.jpg', 'Log images');
```

### 4. Navigation Structure
- **Root:** `App.tsx` → `RootStack` or `AuthStack` (based on auth state)
- **Authenticated:** `RootStack` → `BottomTabs` (5 tabs: Home, Explore, Add, Social, Profile)
- **Screens:** Use `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`
- **Transitions:** Custom animations in `src/theme/navigationTransitions.ts`

### 5. Analytics Tracking (see `ANALYTICS.md`)
- **Always track user actions** with `posthogCapture(ANALYTICS_EVENTS.*, properties)`
- Import: `import { posthogCapture, ANALYTICS_EVENTS } from '@/src/analytics'`
- Track AAARRR funnel: Acquisition (signup), Activation (first cocktail), Revenue (shop clicks), Referral (shares)
- User identification: `identifyUser(userId, traits)` in `useAuth` hook

### 6. Component Conventions
- **Export named components:** `export const CocktailCard: React.FC<Props> = ({ ... }) => { ... }`
- **Global components** in `src/components/global/` are imported via barrel export: `import { PrimaryButton, Heading } from '@/src/components/global'`
- **Props interfaces:** Define inline above component: `interface CocktailCardProps { ... }`

### 7. Environment Variables
- Stored in `.env.local` (not committed, use `.env.example` as template)
- Access with `process.env.EXPO_PUBLIC_*` (prefix required for Expo)
- Required vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_POSTHOG_API_KEY`

## Development Workflow

### Setup
```bash
npm install                # Install dependencies
npm run web                # Start dev server (primary dev mode)
npm run pwa                # Build & serve production PWA locally
npm run types:generate     # Regenerate Supabase types after schema changes
```

### Git Branching (see `CONTRIBUTING.md`)
- **Long-lived:** `main` (prod) and `dev` (staging)
- **Feature branches:** `<type>/<area>-<description>`
  - Types: `feature`, `bugfix`, `refactor`, `chore`
  - Areas: `frontend`, `backend`, `database`, `api`, `ci/cd`
  - Example: `feature/frontend-cocktail-filter`, `bugfix/backend-auth-token`
- **Workflow:** Branch from `dev` → PR to `dev` → merge `dev` to `main` when stable

### Deployment
- **Automatic via GitHub Actions** to Vercel
- Push to `dev` → deploys staging | Push to `main` → deploys production
- No manual deployment needed

## Common Tasks

### Adding a New Screen
1. Create in `src/screens/<Feature>/<ScreenName>.tsx`
2. Add route to navigator in `src/screens/navigation/`
3. Use `@react-navigation/native-stack` with TypeScript types

### Creating a New API Function
1. Add to relevant file in `src/api/` (e.g., `cocktail.ts`, `profile.ts`)
2. Use `supabase.from('Table').select()` pattern with joins
3. Handle errors with console.error and return empty/null on failure
4. Export as named async function

### Adding Analytics Event
1. Add event constant to `ANALYTICS_EVENTS` in `src/analytics/index.ts`
2. Call `posthogCapture(ANALYTICS_EVENTS.EVENT_NAME, { property: value })`
3. Document in `ANALYTICS.md` under relevant AAARRR stage

### Updating Database Schema
1. Make changes in Supabase dashboard or via migration SQL
2. Run `npm run types:generate` to update `src/types/supabase.ts`
3. Update corresponding TypeScript types in `src/types/` if needed (e.g., `cocktail.ts`)

## Important Files
- `App.tsx` - Entry point, auth routing, analytics initialization
- `src/lib/supabase.ts` - Supabase client config
- `src/hooks/useAuth.tsx` - Authentication state & user tracking
- `src/theme/colors.ts` - Color palette (synced with `global.css`)
- `src/types/supabase.ts` - **Auto-generated**, do not edit manually
- `CONTRIBUTING.md` - Git workflow and branch naming
- `ANALYTICS.md` - Complete analytics tracking guide

## Testing Notes
- Primary testing: **Chrome DevTools** device emulation (F12 → mobile viewport)
- PWA features: Test with `npm run pwa` → install to home screen
- iOS-specific: Check for iOS-specific code with `Platform.OS === 'ios'` or user agent detection
