import posthog from 'posthog-js';

// AAARRR Event Constants
export const ANALYTICS_EVENTS = {
  // Acquisition
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  
  // Activation
  FIRST_COCKTAIL_LOGGED: 'first_cocktail_logged',
  FEATURE_USED: 'feature_used',
  
  // Revenue
  PREMIUM_UPGRADED: 'premium_upgraded',
  
  // Referral
  INVITE_SENT: 'invite_sent',
  SHARE_CLICKED: 'share_clicked',
} as const;

export function initAnalytics() {
  // PostHog init
  posthog.init(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    api_host: process.env.EXPO_PUBLIC_POSTHOG_API_HOST!,
    autocapture: false, // autocapture noisy, better manual events
  });
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

// Reset user identity on logout
export function resetUser() {
  posthog.reset();
  sessionStartTime = null;
}