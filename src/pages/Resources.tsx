import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Video, 
  Download, 
  Globe, 
  Calculator,
  CheckCircle,
  FileText,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar
} from "lucide-react";

const studyGuides = [
  {
    title: "Study in Canada Guide",
    description: "Complete guide to studying in Canada including visa requirements, top universities, and living costs.",
    category: "Country Guide",
    downloadUrl: "#",
    isPopular: true
  },
  {
    title: "UK Universities Handbook",
    description: "Everything you need to know about studying in the UK, from UCAS applications to student life.",
    category: "Country Guide",
    downloadUrl: "#"
  },
  {
    title: "Scholarship Application Tips",
    description: "Expert tips on how to write winning scholarship applications and essays.",
    category: "Application Guide",
    downloadUrl: "#",
    isPopular: true
  },
  {
    title: "IELTS Preparation Guide",
    description: "Comprehensive preparation guide for IELTS with practice tests and strategies.",
    category: "Test Prep",
    downloadUrl: "#"
  }
];

const webinars = [
  {
    title: "How to Choose the Right University",
    date: "Dec 15, 2024",
    time: "3:00 PM EST",
    speaker: "Dr. Sarah Johnson",
    registered: 1250,
    upcoming: true
  },
  {
    title: "Scholarship Opportunities for International Students",
    date: "Dec 22, 2024", 
    time: "2:00 PM EST",
    speaker: "Prof. Michael Chen",
    registered: 890,
    upcoming: true
  },
  {
    title: "Student Visa Application Process",
    date: "Nov 28, 2024",
    time: "4:00 PM EST",
    speaker: "Immigration Expert Lisa Brown",
    registered: 2100,
    upcoming: false
  }
];

const tools = [
  {
    title: "University Comparison Tool",
    description: "Compare universities side by side based on rankings, fees, location, and programs.",
    icon: <Globe className="h-6 w-6" />,
    url: "#"
  },
  {
    title: "Cost Calculator",
    description: "Calculate your total study abroad costs including tuition, living expenses, and travel.",
    icon: <Calculator className="h-6 w-6" />,
    url: "#"
  },
  {
    title: "Application Tracker",
    description: "Track your application deadlines and required documents across multiple universities.",
    icon: <CheckCircle className="h-6 w-6" />,
    url: "#"
  },
  {
    title: "Document Checklist",
    description: "Comprehensive checklist of documents needed for international study applications.",
    icon: <FileText className="h-6 w-6" />,
    url: "#"
  }
];

const countryInfo = [
  {
    country: "Canada",
    description: "Known for high-quality education, multicultural environment, and post-study work opportunities.",
    avgCost: "$15,000 - $35,000",
    popularCities: ["Toronto", "Vancouver", "Montreal"],
    visaType: "Study Permit"
  },
  {
    country: "United Kingdom",
    description: "Home to world-renowned universities with rich academic traditions and excellent research facilities.",
    avgCost: "$20,000 - $45,000",
    popularCities: ["London", "Edinburgh", "Manchester"],
    visaType: "Student Visa"
  },
  {
    country: "Australia",
    description: "Offers excellent education quality, beautiful landscapes, and strong job prospects for graduates.",
    avgCost: "$18,000 - $40,000",
    popularCities: ["Sydney", "Melbourne", "Brisbane"],
    visaType: "Student Visa (500)"
  },
  {
    country: "Germany",
    description: "Known for affordable education, strong engineering programs, and excellent research opportunities.",
    avgCost: "$500 - $15,000",
    popularCities: ["Berlin", "Munich", "Hamburg"],
    visaType: "Student Visa"
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Educational Resources</h1>
          <p className="text-muted-foreground">Everything you need to succeed in your study abroad journey</p>
        </div>

        {/* Study Guides */}
        <Card className="shadow-medium border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Study Guides & Downloads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {studyGuides.map((guide, index) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={guide.isPopular ? "default" : "secondary"}>
                        {guide.category}
                      </Badge>
                      {guide.isPopular && (
                        <Badge variant="destructive" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Guide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webinars */}
        <Card className="shadow-medium border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Upcoming Webinars</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webinars.map((webinar, index) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{webinar.title}</h3>
                          {webinar.upcoming && (
                            <Badge variant="default" className="text-xs">Upcoming</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {webinar.date} at {webinar.time}
                          </span>
                          <span>Speaker: {webinar.speaker}</span>
                          <span>{webinar.registered.toLocaleString()} registered</span>
                        </div>
                      </div>
                      <Button variant={webinar.upcoming ? "default" : "outline"}>
                        {webinar.upcoming ? "Register Now" : "Watch Recording"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Helpful Tools */}
          <Card className="shadow-medium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Helpful Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.map((tool, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{tool.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Use Tool
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Country Information */}
          <Card className="shadow-medium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Study Destinations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {countryInfo.map((country, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{country.country}</h4>
                      <Badge variant="outline">{country.visaType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{country.description}</p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Annual Cost: {country.avgCost}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Popular Cities: {country.popularCities.join(", ")}</span>
                      </div>
                    </div>
                    {index < countryInfo.length - 1 && (
                      <div className="border-b border-border/50 pt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}