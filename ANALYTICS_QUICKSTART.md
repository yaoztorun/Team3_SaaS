# Quick Analytics Implementation Checklist

## Adding a New Analytics Event

### 1. Add Event Constant
**File:** `/src/analytics/index.ts`

```typescript
export const ANALYTICS_EVENTS = {
  // ... existing events
  YOUR_NEW_EVENT: 'your_new_event',
} as const;
```

### 2. Implement Tracking
Choose the appropriate tracking method:

#### For Regular Events
```typescript
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';

posthogCapture(ANALYTICS_EVENTS.YOUR_NEW_EVENT, {
  property1: 'value1',
  property2: 123,
});
```

#### For First-Time/Activation Events
```typescript
import { ANALYTICS_EVENTS, trackWithTTFA } from '@/src/analytics';

trackWithTTFA(ANALYTICS_EVENTS.YOUR_NEW_EVENT, {
  property1: 'value1',
});
```

### 3. Document the Event
Add to `/ANALYTICS.md` under the appropriate AAARRR category:

```markdown
**Events:**
- `your_new_event` - Description of when this fires

**Properties tracked:**
- `property1`: description
- `property2`: description

**Implementation locations:**
- `/path/to/component.tsx`
```

## Common Event Patterns

### Feature Usage
```typescript
posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
  feature: 'feature_name',
  context: 'where_it_was_used',
  // any relevant metadata
});
```

### User Actions with Success/Failure
```typescript
try {
  await someAction();
  posthogCapture(ANALYTICS_EVENTS.ACTION_COMPLETED, {
    action: 'action_name',
    success: true,
  });
} catch (error) {
  posthogCapture(ANALYTICS_EVENTS.ACTION_COMPLETED, {
    action: 'action_name',
    success: false,
    error: error.message,
  });
}
```

### First-time Actions (Check if it's the user's first time)
```typescript
// Check if this is the first time
const { count } = await supabase
  .from('SomeTable')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

if (count === 1) {
  trackWithTTFA(ANALYTICS_EVENTS.FIRST_ACTION, { ... });
} else {
  posthogCapture(ANALYTICS_EVENTS.ACTION, { ... });
}
```

## Testing Your Events

### 1. Local Development
- Open PostHog in browser and filter by your user email
- Perform the action
- Verify event appears with correct properties

### 2. Console Logging (Temporary)
```typescript
posthogCapture(ANALYTICS_EVENTS.YOUR_EVENT, properties);
console.log('[Analytics]', ANALYTICS_EVENTS.YOUR_EVENT, properties);
```

### 3. PostHog Live Events
- Go to PostHog dashboard → Live Events
- Watch for your event in real-time

## Property Guidelines

### ✅ Good Properties
- User actions: `feature`, `action`, `screen_name`
- IDs: `cocktail_id`, `user_id`, `post_id`
- Booleans: `has_photo`, `is_premium`, `success`
- Counts: `item_count`, `rating`
- Categories: `method`, `source`, `type`

### ❌ Avoid
- PII: full names, addresses, phone numbers
- Large text: full captions, long descriptions
- Dynamic keys: use consistent property names

## Quick Reference: When to Use Each Function

| Function | Use Case | Example |
|----------|----------|---------|
| `posthogCapture()` | Regular events | Button clicks, navigation, features |
| `trackWithTTFA()` | First-time user actions | First cocktail logged, first share |
| `identifyUser()` | User login/signup | After successful authentication |
| `startSession()` | New session | After user logs in (auto-called) |
| `resetUser()` | User logout | When user signs out (auto-called) |

## Pre-launch Checklist

Before deploying:
- [ ] All event names use `ANALYTICS_EVENTS` constants
- [ ] Events are documented in `ANALYTICS.md`
- [ ] Properties don't contain PII
- [ ] Success and failure cases are tracked
- [ ] Events tested in PostHog dashboard
- [ ] User identification working correctly
