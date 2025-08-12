import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
