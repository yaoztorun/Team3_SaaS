import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { identifyUser, resetUser, startSession } from '@/src/analytics';

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
        identifyUser(data.session.user.id, {
          email: data.session.user.email,
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
        identifyUser(session.user.id, {
          email: session.user.email,
        });
        startSession();
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