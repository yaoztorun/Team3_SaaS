import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { identifyUser, resetUser, startSession, posthogCapture, trackWithTTFA, ANALYTICS_EVENTS } from '@/src/analytics';
import { getStoredReferralInfo, clearReferralInfo } from '@/src/utils/referral';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check for password recovery BEFORE calling getSession
    const checkForRecovery = () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = params.get('type') || hashParams.get('type');
      return type === 'recovery';
    };

    const isRecovery = checkForRecovery();

    //Initial Session Check
    supabase.auth.getSession().then(({ data }) => {
      if (isRecovery) {
        setIsPasswordRecovery(true);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data.session?.user ?? null);
      setLoading(false);

      // Identify user if logged in
      if (data.session?.user) {
        const referralInfo = getStoredReferralInfo();
        
        identifyUser(data.session.user.id, {
          email: data.session.user.email,
          referred_by: referralInfo?.referredBy,
          utm_source: referralInfo?.utmSource,
          utm_medium: referralInfo?.utmMedium,
        });
        startSession();
      }

      if (data.session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });
    
    //Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle password recovery separately
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setUser(null);
        setLoading(false);
        return;
      }

      // Don't override password recovery state if we're already in recovery mode
      if (isRecovery) {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
      setIsPasswordRecovery(false);

      // Handle user login/logout
      if (session?.user) {
        const isNewUser = new Date(session.user.created_at).getTime() > Date.now() - 10000; // Created in last 10 seconds
        const referralInfo = getStoredReferralInfo();
        
        identifyUser(session.user.id, {
          email: session.user.email,
          referred_by: referralInfo?.referredBy,
          utm_source: referralInfo?.utmSource,
          utm_medium: referralInfo?.utmMedium,
        });
        startSession();
        
        // Track Google OAuth signup/login completion
        // SIGNED_IN event fires after OAuth redirect
        if (event === 'SIGNED_IN') {
          if (isNewUser) {
            // New user - track signup completion
            trackWithTTFA(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
              method: 'google',
              has_name: !!session.user.user_metadata?.full_name,
              referred_by: referralInfo?.referredBy,
              utm_source: referralInfo?.utmSource,
            });
            
            // Track share conversion if from referral
            if (referralInfo?.utmSource === 'share') {
              posthogCapture(ANALYTICS_EVENTS.SHARE_CONVERTED, {
                referred_by: referralInfo.referredBy,
                utm_medium: referralInfo.utmMedium,
              });
            }
            
            clearReferralInfo();
          } else {
            // Existing user - track login
            trackWithTTFA(ANALYTICS_EVENTS.LOGIN_COMPLETED, {
              method: 'google',
            });
          }
        }
      } else {
        resetUser();
      }

      if (session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });

    return () => listener.subscription.unsubscribe();

    
  }, []);

  return { user, loading, isPasswordRecovery };
}