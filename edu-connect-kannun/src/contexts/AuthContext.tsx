import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UniversityData {
  institution: string;
  position: string;
}

interface StudentData {
  // Add specific student fields if needed in the future
  [key: string]: unknown;
}

interface AdditionalData {
  fullName: string;
  phone: string;
  country: string;
}

type SignUpData = AdditionalData & (UniversityData | StudentData);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: 'student' | 'university' | null;
  signIn: (email: string, password: string, type: 'student' | 'university') => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, type: 'student' | 'university', additionalData: SignUpData) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<'student' | 'university' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Function to handle session updates
    const handleSessionUpdate = (session: Session | null) => {
      if (!mounted) return;
      
      console.log('Handling session update:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userMetadata: session?.user?.user_metadata,
        userType: session?.user?.user_metadata?.user_type
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Get user type from metadata
      if (session?.user?.user_metadata?.user_type) {
        setUserType(session.user.user_metadata.user_type);
        console.log('User type set to:', session.user.user_metadata.user_type);
      } else if (session?.user?.app_metadata?.user_type) {
        // Fallback to app_metadata if user_metadata is not available
        setUserType(session.user.app_metadata.user_type);
        console.log('User type set from app_metadata:', session.user.app_metadata.user_type);
      } else if (session?.user?.email) {
        // Additional fallback: try to determine user type from email patterns or other means
        // For now, we'll set it to null and let the user choose
        setUserType(null);
        console.log('User type set to null - no metadata found for:', session.user.email);
      } else {
        setUserType(null);
        console.log('User type set to null - no session user found');
      }
      
      setLoading(false);
    };

    // Check for existing session immediately
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          // Don't sign out on network errors, just set loading to false
          if (!error.message.includes('network') && !error.message.includes('offline')) {
            setLoading(false);
            return;
          }
        }
        handleSessionUpdate(session);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          // Clear all auth state on explicit sign out
          setSession(null);
          setUser(null);
          setUserType(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Update session on sign in or token refresh
          handleSessionUpdate(session);
        } else if (event === 'USER_UPDATED') {
          // Handle user metadata updates
          handleSessionUpdate(session);
        }
      }
    );

    // Handle page visibility changes to refresh session when user returns
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        // Refresh session when user returns to the page
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            handleSessionUpdate(session);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string, expectedUserType: 'student' | 'university') => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Check if the user type matches what's expected
    const actualUserType = data.user?.user_metadata?.user_type;
    
    if (actualUserType && actualUserType !== expectedUserType) {
      // Sign out immediately if user type doesn't match
      await supabase.auth.signOut();
      return { 
        error: { 
          message: `This account is registered as a ${actualUserType}. Please use the correct login portal.` 
        } as AuthError 
      };
    }

    // The auth state change listener will handle setting the user type
    return { error: null };
  };

  const signUp = async (email: string, password: string, type: 'student' | 'university', additionalData: SignUpData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: type,
          full_name: additionalData.fullName,
          phone: additionalData.phone,
          country: additionalData.country,
          ...(type === 'university' && {
            institution: additionalData.institution,
            position: additionalData.position,
          })
        }
      }
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserType(null);
  };

  const value = {
    user,
    session,
    userType,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}