# Font Usage Guide

## Team Font Decisions
- **Headers/Headings**: Rubik
- **Body/Regular Text**: Inter

## How to Use

### Option 1: Using the Heading Component (Recommended for Headings)

The `Heading` component automatically applies Rubik font with semantic sizing:

```tsx
import { Heading } from '@/src/components/global';

// Different heading levels with automatic sizing
<Heading level="h1">Page Title</Heading>        // text-4xl font-bold
<Heading level="h2">Section Title</Heading>     // text-3xl font-bold
<Heading level="h3">Subsection</Heading>        // text-2xl font-semibold
<Heading level="h4">Small Heading</Heading>     // text-xl font-semibold
<Heading level="h5">Card Title</Heading>        // text-lg font-semibold
<Heading level="h6">Tiny Heading</Heading>      // text-base font-semibold

// You can add custom classes
<Heading level="h3" className="text-primary-600 mb-4">
  Colored Heading
</Heading>
```

**Default is h3** if you don't specify a level.

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

### Option 2: Direct Font Names (Less Common)

You can also use the font names directly:

```tsx
<Text className="font-rubik text-xl font-semibold">
  Heading with Rubik
</Text>

<Text className="font-inter">
  Body text with Inter
</Text>
```

### Option 3: Inline Styles (Avoid When Possible)

Only use this when necessary:

```tsx
<Text style={{ fontFamily: 'Rubik, system-ui, sans-serif' }}>
  Heading
</Text>

<Text style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
  Body
</Text>
```

## Font Weights Available

### Rubik (for headings)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)
- ExtraBold (800)

Usage: `font-medium`, `font-semibold`, `font-bold`, etc.

### Inter (for body)
- Light (300)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

Usage: `font-light`, `font-medium`, `font-semibold`, `font-bold`, etc.

## Common Patterns

### Page Title
```tsx
<Heading level="h1">My App Title</Heading>
// or
<Heading level="h2">Page Title</Heading>
```

### Section Header
```tsx
<Heading level="h3">Section Header</Heading>
```

### Card or Component Title
```tsx
<Heading level="h4">Card Title</Heading>
```

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
2. **Tailwind Config**: Font families defined in `tailwind.config.js`
3. **Base Text Component**: Uses `font-body` (Inter) by default in `src/components/ui/text/styles.tsx`

## Notes

- The base `<Text>` component from `@/src/components/ui/text` already uses `font-body` (Inter) by default
- Always use `className` with Tailwind classes when possible for consistency
- For headings, explicitly add `font-heading` class
- System fallback fonts are included for better cross-platform support
