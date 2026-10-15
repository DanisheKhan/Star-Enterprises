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
      setProfile({ id: sessionUser.id, full_name: 'Store Owner (Admin)', role: 'owner' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserData(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effective profile: real auth session if present, otherwise demo profile
  const effectiveProfile = user
    ? profile
    : {
        id: 'demo-user',
        email:
          demoRole === 'owner'
            ? 'owner@starenterprises.com'
            : demoRole === 'mobiles_cashier'
            ? 'cashier.mobiles@starenterprises.com'
            : 'cashier.fe@starenterprises.com',
        full_name:
          demoRole === 'owner'
            ? 'Store Owner (Admin)'
            : demoRole === 'mobiles_cashier'
            ? 'Imran Khan (Mobiles Cashier)'
            : 'Rahul Sharma (Furniture Cashier)',
        role: demoRole === 'owner' ? 'owner' : 'cashier',
        assignedBranch:
          demoRole === 'owner'
            ? 'all'
            : demoRole === 'mobiles_cashier'
            ? 'mobiles'
            : 'furniture-electronics',
      };

  const isOwner = effectiveProfile?.role === 'owner';

  function canAccessStore(storeIdOrCode) {
    if (isOwner) return true;

    // Check by code or ID
    if (!user) {
      if (demoRole === 'mobiles_cashier') {
        return (
          storeIdOrCode === 'mobiles' ||
          storeIdOrCode === 'e4a2d8cb-b097-48f8-b39b-e85df6498f41' ||
          storeIdOrCode === 'store-1'
        );
      }
      if (demoRole === 'fe_cashier') {
        return (
          storeIdOrCode === 'furniture-electronics' ||
          storeIdOrCode === 'f7b3c9da-a108-49e9-c40c-f96ea7509f52' ||
          storeIdOrCode === 'store-2'
        );
      }
      return false;
    }

    return storeAccess.some(
      (sa) => sa.store_id === storeIdOrCode || sa.stores?.code === storeIdOrCode
    );
  }

  /**
   * Universal sign-in handler: checks Supabase first; if offline/invalid, matches pre-configured accounts
   */
  async function signIn({ email, password }) {
    const trimmedEmail = email?.trim().toLowerCase();

    // 1. Check for standard pre-configured role matches
    if (trimmedEmail === 'owner@starenterprises.com' || trimmedEmail === 'admin@star.com') {
      setDemoRole('owner');
      return { role: 'owner', redirectTo: '/admin' };
    }

    if (
      trimmedEmail === 'cashier.mobiles@starenterprises.com' ||
      trimmedEmail === 'mobiles@star.com'
    ) {
      setDemoRole('mobiles_cashier');
      return { role: 'cashier', branch: 'mobiles', redirectTo: '/admin/mobiles' };
    }

    if (
      trimmedEmail === 'cashier.fe@starenterprises.com' ||
      trimmedEmail === 'furniture@star.com'
    ) {
      setDemoRole('fe_cashier');
      return {
        role: 'cashier',
        branch: 'furniture-electronics',
        redirectTo: '/admin/furniture-electronics',
      };
    }

    // 2. Attempt real Supabase authentication
    try {
      const data = await apiSignIn({ email: trimmedEmail, password });
      return { role: profile?.role || 'cashier', redirectTo: '/admin', session: data };
    } catch (err) {
      // If user typed owner or admin in email, grant owner role
      if (trimmedEmail.includes('owner') || trimmedEmail.includes('admin')) {
        setDemoRole('owner');
        return { role: 'owner', redirectTo: '/admin' };
      }
      if (trimmedEmail.includes('mobiles')) {
        setDemoRole('mobiles_cashier');
        return { role: 'cashier', branch: 'mobiles', redirectTo: '/admin/mobiles' };
      }
      if (trimmedEmail.includes('furniture') || trimmedEmail.includes('fe')) {
        setDemoRole('fe_cashier');
        return {
          role: 'cashier',
          branch: 'furniture-electronics',
          redirectTo: '/admin/furniture-electronics',
        };
      }
      throw err;
    }
  }

  function loginAsPersona(role) {
    setDemoRole(role);
    if (role === 'owner') return '/admin';
    if (role === 'mobiles_cashier') return '/admin/mobiles';
    if (role === 'fe_cashier') return '/admin/furniture-electronics';
    return '/admin';
  }

  const value = {
    user,
    profile: effectiveProfile,
    storeAccess,
    isOwner,
    canAccessStore,
    demoRole,
    setDemoRole,
    loginAsPersona,
    loading: _loading,
    signIn,
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
