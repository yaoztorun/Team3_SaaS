# Analytics Implementation Guide

## Overview

This document describes the analytics tracking implementation for the React Native Web PWA. We use PostHog for detailed event tracking and Google Analytics 4 (GA4) for basic acquisition metrics.

## Setup

### PostHog
- **Library**: `posthog-js`
- **Initialized in**: `/src/analytics/index.ts`
- **Configuration**: `.env.local`
  - `EXPO_PUBLIC_POSTHOG_API_KEY`
  - `EXPO_PUBLIC_POSTHOG_API_HOST`
- **Autocapture**: Disabled (manual events only)

### Google Analytics 4
- **Initialized in**: `/public/index.html` via `<script>` tag
- **Purpose**: Landing page visits, referrer tracking, traffic source analysis
- **No manual tracking required**: Automatic pageview tracking

## AAARRR Metrics Implementation

### 🎯 Acquisition
Track user signups and registrations.

**Events:**
- `signup_started` - When user initiates signup process
- `signup_completed` - When user successfully creates an account
- `login_completed` - When user successfully logs in

**Properties tracked:**
- `method`: 'email' or 'google'
- `success`: true/false
- `error`: error message (if failed)
- `has_name`: whether user provided a name during signup

**Implementation locations:**
- `/src/screens/Auth/RegisterScreen.tsx` - Email signup flow
- `/src/screens/Auth/LoginScreen.tsx` - Email login & Google OAuth initiation
- `/src/hooks/useAuth.tsx` - Google OAuth completion tracking (SIGNED_IN event)

**Example:**
```typescript
// Email signup
posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
  method: 'email',
});

trackWithTTFA(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
  method: 'email',
  has_name: true,
});

// Google OAuth (tracked automatically in useAuth.tsx)
// signup_started → tracked when user clicks Google button
// signup_completed → tracked on SIGNED_IN event if new user
// login_completed → tracked on SIGNED_IN event if existing user
```

**Google OAuth Flow:**
1. User clicks "Sign in with Google" → `signup_started` tracked
2. User completes Google authentication (redirects away and back)
3. `useAuth.tsx` detects `SIGNED_IN` event
4. Checks if user is new (created < 10 seconds ago)
5. Tracks `signup_completed` (new user) or `login_completed` (existing user)

### ✨ Activation
Track first meaningful actions that indicate user engagement.

**Events:**
- `first_cocktail_logged` - User's first drink log (key activation metric)
- `first_share_clicked` - First time user clicks share
- `feature_used` - General feature usage tracking

**Properties tracked (for `first_cocktail_logged`):**
- `cocktail_id`: ID of the cocktail
- `has_photo`: whether a photo was included
- `rating`: user's rating (0-5)
- `visibility`: 'private', 'friends', or 'public'

**Features tracked via `feature_used` event:**
- `post_liked` / `post_unliked` - User likes/unlikes a post (HomeScreen)
- `comment_added` - User adds a comment (HomeScreen)
- `comment_deleted` - User deletes a comment (HomeScreen)
- `cocktail_logged` - User logs a cocktail (subsequent logs after first)
- `recipe_created` - User creates a custom recipe (RecipeView)
- `friend_search` - User searches for friends (FriendsView)
- `friend_request_sent` - User sends a friend request (FriendsView)
- `friend_request_accepted` - User accepts a friend request (FriendsView)
- `what_can_i_make` - User uses ingredient matcher (WhatCanIMake)
- `bar_search` - User searches for bars (BestBars)
- `cocktail_search` - User searches for cocktails (AllCocktails)
- `cocktail_filter` - User filters cocktails by type/difficulty (AllCocktails)
- `shop_search_filter` - User searches/filters shop items (Shop)
- `ai_assistant_used` - User interacts with AI assistant (AIAssistant)

**Implementation locations:**
- `/src/screens/Add/AddScreen.tsx` - First cocktail logged, subsequent logs
- `/src/screens/Add/RecipeView.tsx` - Recipe creation
- `/src/screens/Home/HomeScreen.tsx` - Post interactions (like, comment)
- `/src/screens/Social/FriendsView.tsx` - Friend features
- `/src/screens/Explore/Pages/WhatCanIMake.tsx` - Ingredient matcher
- `/src/screens/Explore/Pages/BestBars.tsx` - Bar search
- `/src/screens/Explore/Pages/AllCocktails.tsx` - Cocktail search/filter
- `/src/screens/Explore/Pages/Shop.tsx` - Shop search/filter
- `/src/screens/Explore/Pages/AIAssistant.tsx` - AI chat

**Time to First Action (TTFA):**
The `trackWithTTFA()` helper automatically includes `time_to_first_action_ms` property, measuring time from session start to the event.

**Example:**
```typescript
trackWithTTFA(ANALYTICS_EVENTS.FIRST_COCKTAIL_LOGGED, {
  cocktail_id: selectedCocktailId,
  has_photo: !!uploadedUrl,
  rating: rating,
  visibility: shareWith,
  location_type: isAtHome ? 'home' : 'bar',
});
```

### 💰 Revenue
Track partnership and affiliate monetization through shop item interactions.

**Events:**
- `shop_item_viewed` - When user views a shop item detail page
- `shop_item_clicked` - When user clicks through to purchase a shop item

**Properties tracked:**
- `item_id`: ID of the shop item
- `item_name`: name of the product
- `item_category`: category of the product
- `item_price`: price of the product
- `affiliate_link`: the external purchase link

**Implementation locations:**
- `/src/screens/Explore/Pages/ItemDetail.tsx` - Shop item tracking

**Example:**
```typescript
posthogCapture(ANALYTICS_EVENTS.SHOP_ITEM_VIEWED, {
  item_id: item.id,
  item_name: item.name,
  item_category: item.category,
  item_price: item.price,
});

posthogCapture(ANALYTICS_EVENTS.SHOP_ITEM_CLICKED, {
  item_id: item.id,
  item_name: item.name,
  affiliate_link: item.purchaseLink,
});
```

### 🔄 Retention
PostHog automatically calculates retention metrics from user activity.

**Automatic metrics:**
- MAU/DAU ratio
- Retention curves
- Cohort analysis
- Session frequency

**How it works:**
- User identification via `identifyUser(userId, traits)`
- Session tracking via `startSession()`
- All events associated with identified users

**Implementation:**
- User identified in `/src/hooks/useAuth.tsx` on login/session restore
- Session starts automatically when user logs in
- User reset on logout

### 📢 Referral
Track sharing and invite actions, including viral loop completion.

**Events:**
- `share_clicked` - When user shares content (all shares tracked)
- `share_link_opened` - When someone opens a shared link (via UTM params)
- `share_converted` - When shared link leads to a signup

**Properties tracked:**
- `post_id`: ID of shared post
- `cocktail_name`: name of cocktail being shared
- `share_method`: 'whatsapp', 'copy_link', or 'system'
- `is_first_time`: whether this is user's first share (boolean)
- `time_to_first_action_ms`: time from signup to first share (first share only)
- `referred_by`: user ID who shared the link (for conversions)
- `utm_source`: 'share' (for link opens)
- `utm_medium`: share method that was used (for link opens)

**Implementation locations:**
- `/src/components/global/FeedPostCard.tsx` - Share button handlers
- `/src/utils/share.ts` - Share URL generation with UTM params
- `/src/utils/referral.ts` - UTM extraction and referral attribution (trackShareLinkOpen function)
- `/App.tsx` - Share link open tracking (calls trackShareLinkOpen on web)
- `/src/screens/Auth/RegisterScreen.tsx` - Share conversion tracking
- `/src/hooks/useAuth.tsx` - Share conversion tracking on Google OAuth signup

**Example:**
```typescript
// First share (tracked with TTFA)
trackFirstTime(ANALYTICS_EVENTS.SHARE_CLICKED, {
  post_id: id,
  cocktail_name: cocktailName,
  share_method: 'whatsapp',
}); // Automatically adds: is_first_time: true, time_to_first_action_ms

// Subsequent shares
posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
  post_id: id,
  cocktail_name: cocktailName,
  share_method: 'copy_link',
});

// When shared link is opened
posthogCapture(ANALYTICS_EVENTS.SHARE_LINK_OPENED, {
  referred_by: 'user_abc_123',
  utm_medium: 'whatsapp',
});

// When shared link leads to signup
posthogCapture(ANALYTICS_EVENTS.SHARE_CONVERTED, {
  referred_by: 'user_abc_123',
  utm_medium: 'whatsapp',
});
```

**UTM Tracking:**
Share URLs are automatically enhanced with UTM parameters for attribution:
- Format: `/log/{id}?utm_source=share&utm_medium={method}&ref={userId}`
- Tracked in sessionStorage until signup completes
- User properties include `referred_by` for viral loop analysis

**First Share Tracking:**
Uses `trackFirstTime()` helper which:
- Checks localStorage to detect first-time events
- Automatically includes `is_first_time: true` property
- Tracks time to first action for activation metrics
- Resets on user logout


## API Reference

### Core Functions

#### `initAnalytics()`
Initialize PostHog. Called once in `App.tsx` on app startup.

```typescript
initAnalytics();
```

#### `posthogCapture(eventName, properties?)`
Track a custom event with optional properties.

```typescript
posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
  feature: 'search',
  query: 'mojito',
});
```

#### `identifyUser(userId, traits?)`
Identify a user and set user properties.

```typescript
identifyUser(user.id, {
  email: user.email,
  created_at: new Date().toISOString(),
});
```

#### `trackWithTTFA(eventName, properties?)`
Track an event with automatic Time To First Action measurement.

```typescript
trackWithTTFA(ANALYTICS_EVENTS.FIRST_COCKTAIL_LOGGED, {
  cocktail_id: '123',
});
```

#### `trackFirstTime(eventName, properties?)`
Track a first-time event with TTFA. Returns `true` if this was the first occurrence, `false` otherwise. Uses localStorage to track state.

```typescript
const isFirstShare = trackFirstTime(ANALYTICS_EVENTS.SHARE_CLICKED, {
  post_id: '123',
  share_method: 'whatsapp',
});
// Automatically adds: is_first_time: true, time_to_first_action_ms
```

#### `startSession()`
Start a new analytics session. Automatically called on user login.

```typescript
startSession();
```

#### `resetUser()`
Clear user identity and session. Automatically called on logout.

```typescript
resetUser();
```

### Event Constants

All event names are defined in `ANALYTICS_EVENTS` constant:

```typescript
import { ANALYTICS_EVENTS } from '@/src/analytics';

// Usage
posthogCapture(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { ... });
```

**Available constants:**
- `SIGNUP_STARTED`
- `SIGNUP_COMPLETED`
- `LOGIN_COMPLETED`
- `FIRST_COCKTAIL_LOGGED`
- `FEATURE_USED`
- `SHOP_ITEM_VIEWED`
- `SHOP_ITEM_CLICKED`
- `SHARE_CLICKED`
- `SHARE_LINK_OPENED`
- `SHARE_CONVERTED`

## Best Practices

### 1. Always use event constants
❌ Don't: `posthogCapture('signup_completed')`
✅ Do: `posthogCapture(ANALYTICS_EVENTS.SIGNUP_COMPLETED)`

### 2. Include relevant context
❌ Don't: `posthogCapture(ANALYTICS_EVENTS.FEATURE_USED)`
✅ Do: `posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, { feature: 'search' })`

### 3. Track both success and failure
```typescript
if (error) {
  posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
    method: 'email',
    success: false,
    error: error.message,
  });
} else {
  posthogCapture(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
    method: 'email',
  });
}
```

### 4. Use trackWithTTFA for activation events
First-time user actions should use `trackWithTTFA()` to measure time to activation.

### 5. Identify users early
Call `identifyUser()` as soon as the user logs in or signs up to ensure all subsequent events are associated with that user.

## Data Flow

```
1. User opens app
   └─> initAnalytics() called in App.tsx

2. User logs in
   └─> identifyUser(userId, traits) in useAuth.tsx
   └─> startSession() in useAuth.tsx
   └─> ANALYTICS_EVENTS.LOGIN_COMPLETED tracked

3. User performs actions
   └─> Events tracked with posthogCapture()
   └─> First-time actions use trackWithTTFA()

4. User logs out
   └─> resetUser() in useAuth.tsx
```

## Support

For questions or issues:
- PostHog docs: https://posthog.com/docs
- Internal: Check `/src/analytics/index.ts` for implementation details
