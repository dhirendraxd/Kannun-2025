import { 
  BookOpen, 
  Brain, 
  FileText, 
  Globe2, 
  Shield, 
  Zap,
  Building2,
  BarChart3,
  Users2,
  Target,
  TrendingUp,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const studentBenefits = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Get personalized university suggestions based on your academic profile, preferences, and documents.",
    color: "text-secondary"
  },
  {
    icon: Globe2,
    title: "Global University Database",
    description: "Access thousands of universities across 150+ countries with detailed program information.",
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Securely upload and manage all your academic documents in one centralized location.",
    color: "text-accent"
  },
  {
    icon: Shield,
    title: "Application Security",
    description: "Your data is protected with enterprise-grade security and privacy measures.",
    color: "text-success"
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Get matched with universities in real-time as you update your profile and preferences.",
    color: "text-info"
  },
  {
    icon: Award,
    title: "Scholarship Finder",
    description: "Discover scholarship opportunities that match your profile and financial needs.",
    color: "text-destructive"
  }
];

const universityBenefits = [
  {
    icon: Users2,
    title: "Global Student Reach",
    description: "Connect with qualified students from around the world who match your program criteria.",
    color: "text-secondary"
  },
  {
    icon: Target,
    title: "Targeted Visibility",
    description: "Your programs are shown to students whose profiles align with your admission requirements.",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track application metrics, student interest, and optimize your program visibility.",
    color: "text-accent"
  },
  {
    icon: Building2,
    title: "Institution Branding",
    description: "Showcase your university's unique strengths, campus life, and academic excellence.",
    color: "text-success"
  },
  {
    icon: TrendingUp,
    title: "Increased Applications",
    description: "Attract more qualified applicants through our intelligent matching system.",
    color: "text-info"
  },
  {
    icon: FileText,
    title: "Easy Management",
    description: "Simple tools to update program details, deadlines, and requirements in real-time.",
    color: "text-destructive"
  }
];

interface BenefitCardProps {
  benefit: typeof studentBenefits[0];
  index: number;
}

function BenefitCard({ benefit, index }: BenefitCardProps) {
  return (
    <Card 
      className="group h-full glass-card-light hover:glass-card-strong hover:shadow-medium transition-all duration-300 hover:-translate-y-1 rounded-2xl"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fade-in 0.6s ease-out forwards'
      }}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-background ${benefit.color}`}>
            <benefit.icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {benefit.title}
          </h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {benefit.description}
        </p>
      </CardContent>
    </Card>
  );
}

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'var(--gradient-white)' }}>
      <div className="container px-4">
        {/* Students Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 glass-badge rounded-full">
              <BookOpen className="mr-1 h-3 w-3" />
              For Students
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Study Abroad
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From finding the perfect university to managing your applications, 
              we've got every step of your journey covered.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studentBenefits.map((benefit, index) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={index} />
            ))}
          </div>
        </div>

        {/* Universities Section */}
        <div>
          <div className="text-center mb-12">
            <Badge className="mb-4 glass-badge rounded-full">
              <Building2 className="mr-1 h-3 w-3" />
              For Universities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Attract the Right Students Globally
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reach qualified international students and grow your global presence 
              with our intelligent matching platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universityBenefits.map((benefit, index) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}