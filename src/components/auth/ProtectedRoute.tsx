import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'student' | 'university';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute check:', { user: !!user, userType, requiredUserType });
      
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      if (requiredUserType && userType !== requiredUserType) {
        console.log(`User type mismatch. Required: ${requiredUserType}, Got: ${userType}`);
        navigate(`/login?type=${requiredUserType}`);
        return;
      }

      console.log('ProtectedRoute: Access granted');
    }
  }, [user, userType, loading, navigate, requiredUserType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
}