import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";


const queryClient = new QueryClient();

function AppContent() {
  const [isDark, setIsDark] = useState(false);
  const { user, userType } = useAuth();
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onToggleTheme={toggleTheme} 
        isDark={isDark}
        isAuthenticated={!!user}
        userType={userType}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute requiredUserType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/university-dashboard" 
            element={
              <ProtectedRoute requiredUserType="university">
                <UniversityDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredUserType="university">
                <AnalyticsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/universities" element={<BrowseUniversities />} />
          <Route path="/university/:id" element={<UniversityDetails />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

