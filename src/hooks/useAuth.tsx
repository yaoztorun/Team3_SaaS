import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { identifyUser, resetUser, startSession } from '@/src/analytics';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Initial Session Check
    supabase.auth.getSession().then(({ data }) => {
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

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

  return { user, loading };
}