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
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
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
 