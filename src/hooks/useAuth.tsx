import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    // Check if there’s a current session
    supabase.auth.getSession().then(({ data }) => {
      console.log('Current session data:', data);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (data.session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });

    // Subscribe to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      setUser(session?.user ?? null);

      if (session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });

    return () => listener.subscription.unsubscribe();

    
  }, []);

  return { user, loading };
}