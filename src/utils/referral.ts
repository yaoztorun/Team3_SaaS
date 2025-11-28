// src/utils/referral.ts
import { posthogCapture, ANALYTICS_EVENTS } from '@/src/analytics';

export interface ReferralInfo {
  referredBy?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Extract referral information from URL query parameters
 * Call this on app initialization or landing page load
 */
export function extractReferralInfo(): ReferralInfo | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const referredBy = params.get('ref');
  
  // Only return if we have UTM params (indicates a tracked link)
  if (utmSource || referredBy) {
    return {
      referredBy: referredBy || undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    };
  }
  
  return null;
}

/**
 * Track when a user opens the app from a shared link
 * Call this in App.tsx or your main landing component
 */
export function trackShareLinkOpen() {
  const referralInfo = extractReferralInfo();
  
  if (referralInfo && referralInfo.utmSource === 'share') {
    posthogCapture(ANALYTICS_EVENTS.SHARE_LINK_OPENED, {
      referred_by: referralInfo.referredBy,
      utm_medium: referralInfo.utmMedium,
      utm_campaign: referralInfo.utmCampaign,
      landing_url: window.location.href,
    });
    
    // Store referral info in session storage for later use during signup
    sessionStorage.setItem('referral_info', JSON.stringify(referralInfo));
  }
}

/**
 * Get stored referral info (e.g., during signup to track conversion)
 */
export function getStoredReferralInfo(): ReferralInfo | null {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('referral_info');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Clear referral info after it's been used
 */
export function clearReferralInfo() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('referral_info');
}
