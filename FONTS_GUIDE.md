# Font Usage Guide

## Team Font Decisions
- **Headers/Headings**: Rubik
- **Body/Regular Text**: Inter

## How to Use

### Option 1: Using the Heading Component (Recommended for Headings)

The `Heading` component automatically applies Rubik font with semantic sizing and colors:

```tsx
import { Heading } from '@/src/components/global';

// Different heading levels with automatic sizing and color
<Heading level="h1">Page Title</Heading>        // text-4xl font-semibold text-neutral-950
<Heading level="h2">Section Title</Heading>     // text-3xl font-medium text-neutral-950
<Heading level="h3">Subsection</Heading>        // text-2xl font-medium text-neutral-900
<Heading level="h4">Small Heading</Heading>     // text-xl font-medium text-neutral-900
<Heading level="h5">Card Title</Heading>        // text-lg font-normal text-neutral-900
<Heading level="h6">Tiny Heading</Heading>      // text-base font-normal text-neutral-900

// You can override color with custom classes
<Heading level="h3" className="text-primary-600 mb-4">
  Colored Heading
</Heading>
```

**Default is h3** if you don't specify a level.
**Colors:**
- h1, h2: text-neutral-950 (rgb 10, 10, 10) - Nearly black
- h3, h4, h5, h6: text-neutral-900 (rgb 23, 23, 23) - Very dark grey

### Option 2: Using Tailwind Classes Directly

#### For Headings
```tsx
<Text className="font-heading text-2xl font-bold">
  This is a heading
</Text>
```

#### For Body Text
```tsx
<Text className="font-body text-base">
  This is regular body text
</Text>
```

## Font Weights Available

### Rubik (for headings)
- Regular (400) - `font-normal`
- Medium (500) - `font-medium`
- SemiBold (600) - `font-semibold`
- Bold (700) - `font-bold`
- ExtraBold (800) - `font-extrabold`

**Current Usage:**
- h1, h2: font-semibold (600) / font-medium (500)
- h3, h4: font-medium (500)
- h5, h6: font-normal (400)

### Inter (for body)
- Light (300) - `font-light`
- Regular (400) - `font-normal`
- Medium (500) - `font-medium`
- SemiBold (600) - `font-semibold`
- Bold (700) - `font-bold`

## Common Patterns & Actual Usage

### Navigation Bar Titles (h2)
```tsx
<Heading level="h2">Explore</Heading>
<Heading level="h2">Profile</Heading>
// Used in: TopBar component
```

### Auth Screen Titles (h2)
```tsx
<Heading level="h2">Welcome Back</Heading>
<Heading level="h2">Create Account</Heading>
// Used in: LoginScreen, RegisterScreen, ForgotPassword, ResetPassword
```

### Detail Page Main Titles (h3)
```tsx
<Heading level="h3">{cocktail.name}</Heading>
<Heading level="h3">{bar.name}</Heading>
<Heading level="h3">{user.full_name}</Heading>
// Used in: CocktailDetail, BarDetail, ItemDetail, UserProfile
```

### Section Headers (h4)
```tsx
<Heading level="h4">All Cocktails</Heading>
<Heading level="h4">AI Assistant</Heading>
<Heading level="h4">Settings</Heading>
// Used in: ExploreScreen sections, Settings pages, BestBars list, Modals
```

### Card Titles & Subsections (h5)
```tsx
<Heading level="h5">{party.name}</Heading>
<Heading level="h5">Ingredients</Heading>
<Heading level="h5">About</Heading>
// Used in: PartiesView, PartyDetails, CocktailDetail subsections, CocktailCarouselCard
```

### Small Labels & Names (h6)
```tsx
<Heading level="h6">{cocktail.name}</Heading>
<Heading level="h6">{user.full_name}</Heading>
<Heading level="h6">Description</Heading>
// Used in: CocktailCard overlay, FriendsView user names, ItemDetail
```

### Page Title (h1) - Currently Unused
Reserved for future use.

### Body Paragraph
```tsx
<Text className="font-body text-base">
  This is a paragraph of regular body text that users will read.
</Text>
```

### Small Caption
```tsx
<Text className="font-body text-sm text-gray-600">
  Small caption or helper text
</Text>
```

### Button Text
```tsx
<Text className="font-body font-medium text-white">
  Click Me
</Text>
```

## Implementation Details

The fonts are loaded via:
1. **Web**: Google Fonts CDN in `public/index.html` and `global.css`
   - Rubik: weights 400, 500, 600, 700, 800
   - Inter: weights 300, 400, 500, 600, 700
   - Roboto: weights 400, 500 (for Google Sign-In button compliance)
2. **Tailwind Config**: Font families defined in `tailwind.config.js`
   - `font-heading` → Rubik
   - `font-body` → Inter
3. **Heading Component**: `src/components/global/Heading.tsx`
   - Automatically applies `font-heading` (Rubik)
   - h1, h2: text-neutral-950 (nearly black)
   - h3, h4, h5, h6: text-neutral-900 (very dark grey)
   - Semantic sizing based on h1-h6 levels
4. **Base Text Component**: `src/components/ui/text/styles.tsx`
   - Uses Inter by default (no explicit font class needed)

## Notes

- **ALWAYS use the `<Heading>` component for any headings/titles** - never use `<Text>` with manual font classes
- The `<Heading>` component handles font family, weight, size, AND color automatically
- Do NOT add `text-neutral-900` or `text-neutral-950` to headings - it's already included
- Only override color when you need a different color (e.g., `className="text-primary-600"`)
- The base `<Text>` component uses Inter by default for all body text
- System fallback fonts are included for better cross-platform support
- Heading colors: h1/h2 use text-neutral-950 (nearly black), h3/h4/h5/h6 use text-neutral-900 (very dark grey)
