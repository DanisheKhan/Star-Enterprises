import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { signIn as apiSignIn, signOut as apiSignOut, getUserProfile } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [storeAccess, setStoreAccess] = useState([]);
  const [_loading, setLoading] = useState(true);
  
  // Default demo role to 'owner' so user can immediately test both workspaces in dev
  const [demoRole, setDemoRole] = useState('owner');

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

  // Effective profile: real auth session if present, otherwise demo profile
  const effectiveProfile = user
    ? profile
    : {
        id: 'demo-user',
        full_name: demoRole === 'owner' ? 'Store Owner (Admin)' : 'Staff Cashier',
        role: demoRole,
      };

  const isOwner = effectiveProfile?.role === 'owner';

  function canAccessStore(storeId) {
    if (isOwner) return true;
    if (!user) {
      // In demo mode without session, allow all access unless set to locked
      return demoRole !== 'locked';
    }
    return storeAccess.some((sa) => sa.store_id === storeId);
  }

  const value = {
    user,
    profile: effectiveProfile,
    storeAccess,
    isOwner,
    canAccessStore,
    demoRole,
    setDemoRole,
    loading: _loading,
    signIn: apiSignIn,
    signOut: async () => {
      if (user) {
        await apiSignOut();
      }
      setUser(null);
      setProfile(null);
    },
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
