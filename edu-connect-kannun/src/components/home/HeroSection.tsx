import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Globe, 
  Users, 
  BookOpen, 
  Star,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const stats = [
    { label: "Universities", value: "2,500+", icon: BookOpen },
    { label: "Countries", value: "150+", icon: Globe },
    { label: "Students Helped", value: "50K+", icon: Users },
    { label: "Success Rate", value: "94%", icon: Star }
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-blue-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.3))] dark:bg-grid-blue-900/25" />
      
      <div className="container relative px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20 transition-smooth">
            <Globe className="mr-1 h-3 w-3" />
            Global Education Platform
          </Badge>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
            Your Gateway to{" "}
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Global Education
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Discover universities worldwide, get AI-powered recommendations, and apply with confidence. 
            Turn your study abroad dreams into reality.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/signup?type=student')}
              onMouseEnter={() => setHoveredButton('student')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className="relative z-10 flex items-center font-semibold">
                Start Your Journey
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                  hoveredButton === 'student' ? 'translate-x-1' : ''
                }`} />
              </span>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary hover:border-white transition-all duration-300"
              onClick={() => navigate('/signup?type=university')}
              onMouseEnter={() => setHoveredButton('university')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className="flex items-center font-semibold">
                For Universities
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                  hoveredButton === 'university' ? 'translate-x-1' : ''
                }`} />
              </span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-auto max-w-3xl">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="group glass-card-light p-6 rounded-2xl hover:glass-card-strong hover:shadow-medium hover:scale-105 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fade-in 0.6s ease-out forwards'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 p-2 rounded-lg bg-white/20 text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* University Trust Logos */}
          <div className="mt-16 relative">
            <p className="text-center text-white/80 mb-8 text-sm font-medium">Trusted by leading universities worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                Harvard
              </div>
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                Oxford
              </div>
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                MIT
              </div>
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                Stanford
              </div>
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                Cambridge
              </div>
              <div className="glass-card-light h-12 w-32 rounded-2xl flex items-center justify-center text-white font-semibold hover:scale-105 transition-all duration-300">
                ETH Zurich
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}