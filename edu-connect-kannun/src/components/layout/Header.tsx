import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap,
    Menu,
    X,
    Moon,
    Sun,
    User,
    Building2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
    isAuthenticated?: boolean;
    userType?: 'student' | 'university' | null;
    onToggleTheme?: () => void;
    isDark?: boolean;
}

export function Header({ isAuthenticated = false, userType, onToggleTheme, isDark }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleAuthClick = (type: 'student' | 'university') => {
        navigate(`/login?type=${type}`);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-header">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 transition-smooth hover:scale-105">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-semibold text-foreground">EduConnect Global</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link
                        to="/universities"
                        className="text-muted-foreground hover:text-foreground transition-smooth"
                    >
                        Browse Universities
                    </Link>
                    <Link
                        to="/resources"
