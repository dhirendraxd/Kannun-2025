import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  students: [
    { label: "Browse Universities", href: "/universities" },
    { label: "Application Guide", href: "/guide" },
    { label: "Scholarships", href: "/scholarships" },
    { label: "Visa Information", href: "/visa" },
    { label: "Student Stories", href: "/stories" }
  ],
  universities: [
    { label: "Join as University", href: "/signup?type=university" },
    { label: "Pricing", href: "/pricing" },
    { label: "Success Stories", href: "/case-studies" },
    { label: "Partner Program", href: "/partners" },
    { label: "Analytics", href: "/analytics" }
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Country Guides", href: "/countries" },
    { label: "Webinars", href: "/webinars" },
    { label: "Downloads", href: "/downloads" },
    { label: "FAQ", href: "/faq" }
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
    { label: "Help Center", href: "/help" }
  ]
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" }
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-12 md:py-16">
       
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
         
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold">EduConnect Global</span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 max-w-sm">
              Your trusted partner in global education. Connecting students with universities 
              worldwide to make international education dreams come true.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@educonnectglobal.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-3">
              {footerLinks.students.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Universities</h3>
            <ul className="space-y-3">
              {footerLinks.universities.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-sm text-primary-foreground/80">
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-foreground transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-primary-foreground transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-primary-foreground/60">
            © 2024 EduConnect Global. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}