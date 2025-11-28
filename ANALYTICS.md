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
- `/src/screens/Auth/RegisterScreen.tsx`
- `/src/screens/Auth/LoginScreen.tsx`

**Example:**
```typescript
posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
  method: 'email',
});

trackWithTTFA(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
  method: 'email',
  has_name: true,
});
```

### ✨ Activation
Track first meaningful actions that indicate user engagement.

**Events:**
- `first_cocktail_logged` - User's first drink log (key activation metric)
- `first_share_clicked` - First time user clicks share
- `feature_used` - General feature usage tracking

**Properties tracked:**
- `cocktail_id`: ID of the cocktail
- `has_photo`: whether a photo was included
- `rating`: user's rating (0-5)
- `visibility`: 'private', 'friends', or 'public'
- `location_type`: 'home' or 'bar'
- `feature`: name of the feature used

**Implementation locations:**
- `/src/screens/Add/AddScreen.tsx` - First cocktail logged

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
Track premium upgrades and monetization events.

**Events:**
- `premium_upgraded` - When user upgrades to premium

**Properties to track:**
- `plan_type`: subscription tier
- `price`: amount paid
- `billing_period`: 'monthly' or 'annual'

**Status:** 🚧 Not yet implemented (premium features TBD)

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
Track sharing and invite actions.

**Events:**
- `share_clicked` - When user shares content (all shares tracked)
- `invite_sent` - When user sends an invite

**Properties tracked:**
- `post_id`: ID of shared post
- `cocktail_name`: name of cocktail being shared
- `share_method`: 'whatsapp', 'copy_link', or 'system'

**Implementation locations:**
- `/src/components/global/FeedPostCard.tsx` - Share button handlers

**Example:**
```typescript
posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
  post_id: id,
  cocktail_name: cocktailName,
  share_method: 'whatsapp',
});
```

**Note:** PostHog can automatically identify first-time sharers using the "First Time Event" filter in insights, so we track all `share_clicked` events uniformly rather than having a separate `first_share_clicked` event.

**Status:** ✅ Implemented (invite functionality pending)

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
- `PREMIUM_UPGRADED`
- `INVITE_SENT`
- `SHARE_CLICKED`

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

## Privacy & Compliance

- ✅ Autocapture is disabled to prevent unintended PII collection
- ✅ All events are manually defined and reviewed
- ✅ User identity is cleared on logout
- ⚠️ Ensure cookie consent is implemented for GDPR compliance
- ⚠️ Review user properties to ensure no sensitive data is tracked

## PostHog Dashboard Setup

### Recommended Insights

1. **Acquisition Funnel**
   - signup_started → signup_completed
   - Conversion rate by method (email vs Google)

2. **Activation Rate**
   - % of users who complete first_cocktail_logged
   - Average time_to_first_action_ms

3. **Feature Adoption**
   - feature_used event breakdown by feature name
   - Share click rate

4. **Retention Cohorts**
   - Weekly/monthly cohort retention
   - DAU/MAU ratio

### User Properties to Monitor
- `email` (hashed or anonymized)
- `created_at`
- `last_login`
- Total cocktails logged (calculated)

## Next Steps

### Immediate
- [x] Track signup/login events
- [x] Track first cocktail logged
- [x] Track share clicks (WhatsApp, copy link, system share)
- [x] Implement user identification

### Short-term
- [ ] Add more feature_used events for key features:
  - AI Assistant usage
  - Cocktail search
  - Bar discovery
  - Party creation
- [ ] Implement invite/referral functionality
- [ ] Track failed API calls for debugging

### Long-term
- [ ] Implement premium upgrade tracking
- [ ] A/B testing framework using PostHog experiments
- [ ] Custom funnels for specific user journeys
- [ ] Integration with backend for server-side events

## Troubleshooting

### Events not appearing in PostHog
1. Check that `EXPO_PUBLIC_POSTHOG_API_KEY` is set correctly
2. Verify `initAnalytics()` is called before events
3. Check browser console for PostHog errors
4. Ensure user has not blocked PostHog domain

### TTFA showing as 0 or undefined
- Ensure `startSession()` was called after login
- Verify session storage is working in the browser

### User properties not updating
- Confirm `identifyUser()` is called with the correct user ID
- Check that traits object is properly formatted

## Support

For questions or issues:
- PostHog docs: https://posthog.com/docs
- Internal: Check `/src/analytics/index.ts` for implementation details
