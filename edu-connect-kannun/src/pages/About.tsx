import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Trophy, 
  Code, 
  Database, 
  Palette, 
  Cloud,
  Users,
  Target,
  Lightbulb,
  Github,
  ExternalLink
} from "lucide-react";

const techStack = [
  { name: "React", description: "Frontend Framework", icon: "⚛️" },
  { name: "TypeScript", description: "Type-safe JavaScript", icon: "🟦" },
  { name: "Tailwind CSS", description: "Utility-first CSS Framework", icon: "💨" },
  { name: "Gemini API", description: "AI in use ", icon: "⚡" },
  { name: "Supabase", description: "Backend as a Service", icon: "🟢" },
  { name: "PostgreSQL", description: "Database", icon: "🐘" },
  { name: "Shadcn/UI", description: "Component Library", icon: "🎨" },
  { name: "React Router", description: "Client-side Routing", icon: "🛤️" }
];

const teamMembers = [
  {
    name: "Dhirendra Singh Dhami",
    role: "React & TypeScript Specialist",
    image: "/api/placeholder/300/300",
    description: "Focused on creating intuitive user interfaces and seamless user experiences"
  },
  {
    name: "Aashish Singh Rathour", 
    role: "Supabase & Database ",
    image: "/api/placeholder/300/300",
    description: "Built robust backend infrastructure and data management systems"
  },
  {
    name: "Shishir Joshi",
    role: "Design & User Experience",
    image: "/api/placeholder/300/300", 
    description: "Crafted beautiful and functional designs for optimal user engagement"
  },
  {
    name: " Ritendra Tamang",
    role: "Researcher",
    image: "/api/placeholder/300/300",
    description: "Ensured seamless integration between frontend and backend systems"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Trophy className="w-4 h-4 mr-2" />
            Hackathon Project
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-blue-600">EduConnect Global</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A revolutionary platform connecting students with universities worldwide, 
            built during a hackathon to transform the global education landscape.
          </p>
        </div>

        {/* Project Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl text-blue-600">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                To democratize access to global higher education by connecting 
                students with the perfect university matches worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl text-green-600">Innovation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered matching algorithms, document analysis, and 
                personalized recommendations for optimal university selection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl text-purple-600">Impact</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Empowering thousands of students to find their ideal academic 
                path and helping universities discover talented candidates globally.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hackathon Story */}
        <Card className="mb-16 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-orange-800 dark:text-orange-200">
              <Trophy className="w-6 h-6 mr-3" />
              Hackathon Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-orange-800 dark:text-orange-200">
                  From Idea to Reality in 48 Hours
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  EduConnect Global was born during an intense hackathon where our team 
                  identified the critical gap in global education accessibility. Within just 
                  48 hours, we conceptualized, designed, and built this comprehensive platform.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our solution combines cutting-edge technology with user-centric design 
                  to create a seamless experience for both students and universities.
                </p>
                <div className="flex space-x-4">
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    🏆 Innovation Award
                  </Badge>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    🎯 Best UX Design
                  </Badge>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-orange-200">
                <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Hackathon Highlights:
                </h4>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    48 hours of non-stop development
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    4 passionate developers
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    AI-powered matching system
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Real-time document analysis
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Code className="w-6 h-6 mr-3" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <div 
                  key={index}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{tech.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="w-6 h-6 mr-3" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-2xl">${member.name.charAt(0)}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <Card className="mb-16 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-blue-800 dark:text-blue-200">
              <GraduationCap className="w-6 h-6 mr-3" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2">Smart Matching</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  AI-powered algorithms match students with ideal universities based on profiles and preferences.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Document Analysis</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Intelligent document processing and analysis for application requirements.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Global Network</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Connect with universities worldwide and access international opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Education Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students already using EduConnect Global
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Users className="w-5 h-5 mr-2" />
              Get Started as Student
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Github className="w-5 h-5 mr-2" />
              View Source Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
