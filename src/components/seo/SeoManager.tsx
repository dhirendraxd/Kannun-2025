import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageType = "website" | "article";

interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  pageType: PageType;
  noIndex?: boolean;
}

const SITE_NAME = "EduConnect";
const DEFAULT_IMAGE = "/og-image.png";

const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://kannun-2025.vercel.app";
};

const buildConfig = (pathname: string): SEOConfig => {
  if (pathname === "/") {
    return {
      title: "AI-Powered University Application Platform",
      description:
        "Discover universities, compare programs, and get AI-powered recommendations tailored to your profile and goals.",
      keywords:
        "study abroad, university applications, AI recommendations, scholarships, international education, student platform",
      pageType: "website",
    };
  }

  if (pathname === "/about") {
    return {
      title: "About EduConnect",
      description:
        "Learn how EduConnect helps students and universities connect through AI-assisted discovery, application support, and verified data.",
      keywords:
        "about EduConnect, education platform, university matching, student success",
      pageType: "article",
    };
  }

  if (pathname === "/universities") {
    return {
      title: "Browse Universities",
      description:
        "Explore verified university profiles, compare locations and programs, and find the right institution for your academic journey.",
      keywords:
        "browse universities, university programs, study destinations, higher education",
      pageType: "website",
    };
  }

  if (pathname.startsWith("/university/")) {
    return {
      title: "University Details",
      description:
        "View university profile details, available programs, requirements, and scholarships to make informed application decisions.",
      keywords:
        "university details, admission requirements, scholarships, program information",
      pageType: "article",
    };
  }

  if (pathname === "/resources") {
    return {
      title: "Educational Resources",
      description:
        "Access guides, webinars, tools, and destination insights to plan your study abroad path with confidence.",
      keywords:
        "study guides, webinars, visa resources, scholarship tips, student tools",
      pageType: "article",
    };
  }

  if (pathname === "/login") {
    return {
      title: "Login",
      description:
        "Log in to your EduConnect account to manage applications, documents, and personalized recommendations.",
      keywords: "login, student account, university account, EduConnect sign in",
      pageType: "website",
    };
  }

  if (pathname === "/signup") {
    return {
      title: "Create Account",
      description:
        "Sign up on EduConnect as a student or university to start matching, applying, and collaborating in one platform.",
      keywords: "signup, create account, student registration, university onboarding",
      pageType: "website",
    };
  }

  if (pathname === "/student-dashboard") {
    return {
      title: "Student Dashboard",
      description:
        "Manage your profile, documents, and recommendations in your student dashboard.",
      keywords: "student dashboard, application tracking, profile management",
      pageType: "website",
      noIndex: true,
    };
  }

  if (pathname === "/university-dashboard") {
    return {
      title: "University Dashboard",
      description:
        "Manage university profile, programs, and applications from the university dashboard.",
      keywords: "university dashboard, program management, admissions",
      pageType: "website",
      noIndex: true,
    };
  }

  if (pathname === "/analytics") {
    return {
      title: "University Analytics",
      description:
        "Track university performance, student engagement, and admissions analytics.",
      keywords: "analytics dashboard, admissions analytics, education insights",
      pageType: "website",
      noIndex: true,
    };
  }

  return {
    title: "Page Not Found",
    description:
      "The page you are looking for could not be found. Explore EduConnect resources and universities instead.",
    keywords: "404, page not found, EduConnect",
    pageType: "website",
    noIndex: true,
  };
};

const upsertMetaTag = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
};

export const SeoManager = () => {
  const location = useLocation();

  useEffect(() => {
    const config = buildConfig(location.pathname);
    const siteUrl = getSiteUrl();
    const fullTitle = `${config.title} | ${SITE_NAME}`;
    const canonicalUrl = `${siteUrl}${location.pathname}`;
    const imageUrl = `${siteUrl}${DEFAULT_IMAGE}`;

    document.title = fullTitle;

    upsertMetaTag('meta[name="description"]', "name", "description", config.description);
    upsertMetaTag('meta[name="keywords"]', "name", "keywords", config.keywords);
    upsertMetaTag('meta[name="robots"]', "name", "robots", config.noIndex ? "noindex, nofollow" : "index, follow");
    upsertMetaTag('meta[name="author"]', "name", "author", "EduConnect");
    upsertMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMetaTag('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMetaTag('meta[name="twitter:description"]', "name", "twitter:description", config.description);
    upsertMetaTag('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    upsertMetaTag('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMetaTag('meta[property="og:description"]', "property", "og:description", config.description);
    upsertMetaTag('meta[property="og:type"]', "property", "og:type", config.pageType);
    upsertMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMetaTag('meta[property="og:image"]', "property", "og:image", imageUrl);
    upsertMetaTag('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    let jsonLdScript = document.head.querySelector<HTMLScriptElement>("#seo-json-ld");
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "seo-json-ld";
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: fullTitle,
      description: config.description,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: siteUrl,
      },
    };

    jsonLdScript.textContent = JSON.stringify(structuredData);
  }, [location.pathname]);

  return null;
};
