import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User,
  Building2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  isAuthenticated?: boolean;
  userType?: 'student' | 'university' | null;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export function Header({ isAuthenticated = false, userType, onToggleTheme, isDark }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleAuthClick = (type: 'student' | 'university') => {
    navigate(`/login?type=${type}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 transition-smooth hover:scale-105">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">EduConnect Global</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/universities" 
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            Browse Universities
          </Link>
          <Link 
            to="/resources" 
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            Resources
          </Link>
          <Link 
            to="/about" 
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          {onToggleTheme && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleTheme}
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => handleAuthClick('student')}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Student Login</span>
              </Button>
              <Button 
                onClick={() => handleAuthClick('university')}
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>University Login</span>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="secondary" className="capitalize">
                {userType}
              </Badge>
              <Button 
                variant="ghost"
                onClick={() => navigate(userType === 'student' ? '/student-dashboard' : '/university-dashboard')}
              >
                Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 px-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/universities" 
                className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Universities
              </Link>
              <Link 
                to="/resources" 
                className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleAuthClick('student');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Student Login
                  </Button>
                  <Button 
                    onClick={() => {
                      handleAuthClick('university');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    University Login
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">
                      {userType}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      navigate(userType === 'student' ? '/student-dashboard' : '/university-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}