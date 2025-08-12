import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'student' | 'university';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }

      if (requiredUserType && userType !== requiredUserType) {
        navigate('/login');
        return;
      }
    }
  }, [user, userType, loading, navigate, requiredUserType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (requiredUserType && userType !== requiredUserType)) {
    return null;
  }

  return <>{children}</>;
}