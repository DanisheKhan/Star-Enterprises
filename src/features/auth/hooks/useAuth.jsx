import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { signIn as apiSignIn, signOut as apiSignOut, getUserProfile } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [storeAccess, setStoreAccess] = useState([]);
  const [_loading, setLoading] = useState(true);

  async function loadUserData(sessionUser) {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setStoreAccess([]);
      setLoading(false);
      return;
    }

    setUser(sessionUser);
    try {
      const data = await getUserProfile(sessionUser.id);
      if (data) {
        setProfile(data.profile);
        setStoreAccess(data.storeAccess);
      }
    } catch (err) {
      console.warn('Could not load user profile, using fallback:', err);
      setProfile({ id: sessionUser.id, full_name: 'Administrator', role: 'owner' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUserData(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isOwner = profile?.role === 'owner';

  function canAccessStore(storeId) {
    if (isOwner) return true;
    return storeAccess.some((sa) => sa.store_id === storeId);
  }

  const value = {
    user,
    profile,
    storeAccess,
    isOwner,
    canAccessStore,
    loading: _loading,
    signIn: apiSignIn,
    signOut: apiSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
