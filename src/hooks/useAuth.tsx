import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Initial Session Check
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (data.session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });
    
    //Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    });

    return () => listener.subscription.unsubscribe();

    
  }, []);

  return { user, loading };
}