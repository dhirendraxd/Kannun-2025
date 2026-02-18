import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'var(--gradient-blue)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
      
      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Badge className="mb-6 glass-badge text-white rounded-full">
            <Sparkles className="mr-1 h-3 w-3" />
            Start Your Journey Today
          </Badge>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Future?
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join students and universities already using EduConnect to simplify study abroad planning,
            university applications, scholarships, and global higher education decisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="glass-card-light p-6 rounded-2xl">
              <div className="text-2xl font-bold mb-1 text-white">Free to Start</div>
              <div className="text-white/80 text-sm">No hidden costs or setup fees</div>
            </div>
            <div className="glass-card-light p-6 rounded-2xl">
              <div className="text-2xl font-bold mb-1 text-white">24/7 Support</div>
              <div className="text-white/80 text-sm">Get help whenever you need it</div>
            </div>
            <div className="glass-card-light p-6 rounded-2xl">
              <div className="text-2xl font-bold mb-1 text-white">Global Network</div>
              <div className="text-white/80 text-sm">Connect across 150+ countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}