import { HeroSection } from "@/components/home/HeroSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CTASection } from "@/components/home/CTASection";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user && userType) {
      navigate(userType === 'student' ? '/student-dashboard' : '/university-dashboard');
    }
  }, [user, userType, navigate]);

  // Only show homepage for non-authenticated users
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
}