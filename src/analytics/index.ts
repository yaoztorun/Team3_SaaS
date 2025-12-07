import posthog from 'posthog-js';

// Track if PostHog has been initialized
let isInitialized = false;

// AAARRR Event Constants
export const ANALYTICS_EVENTS = {
  // Acquisition
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  
  // Activation
  FIRST_COCKTAIL_LOGGED: 'first_cocktail_logged',
  FEATURE_USED: 'feature_used',
  
  // Revenue - Partnership tracking
  SHOP_ITEM_VIEWED: 'shop_item_viewed',
  SHOP_ITEM_CLICKED: 'shop_item_clicked',
  
  // Referral
  SHARE_CLICKED: 'share_clicked',
  SHARE_LINK_OPENED: 'share_link_opened',
  SHARE_CONVERTED: 'share_converted',
} as const;

export function initAnalytics() {
  // Prevent re-initialization
  if (isInitialized) {
    return;
  }
  
  // PostHog init
  posthog.init(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    api_host: process.env.EXPO_PUBLIC_POSTHOG_API_HOST!,
    autocapture: false, // autocapture noisy, better manual events
  });
  
  isInitialized = true;
}

export function posthogCapture(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  posthog.identify(userId, traits);
  if (traits) posthog.people && posthog.people.set(traits);
}

// Helper to track time to first action
let sessionStartTime: number | null = null;

export function startSession() {
  sessionStartTime = Date.now();
}

export function trackWithTTFA(eventName: string, properties?: Record<string, any>) {
  const props = { ...properties };
  if (sessionStartTime) {
    props.time_to_first_action_ms = Date.now() - sessionStartTime;
  }
  posthogCapture(eventName, props);
}

// Helper to track first-time events (prevents double counting)
export function trackFirstTime(eventName: string, properties?: Record<string, any>) {
  const key = `first_time_${eventName}`;
  const hasTracked = localStorage.getItem(key);
  
  if (!hasTracked) {
    localStorage.setItem(key, 'true');
    trackWithTTFA(eventName, { ...properties, is_first_time: true });
    return true;
  }
  return false;
}

// Reset user identity on logout
export function resetUser() {
  posthog.reset();
  sessionStartTime = null;
  // Clear first-time event tracking on logout
  Object.keys(localStorage)
    .filter(key => key.startsWith('first_time_'))
    .forEach(key => localStorage.removeItem(key));
}