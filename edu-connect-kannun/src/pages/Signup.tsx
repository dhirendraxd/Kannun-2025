import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
    GraduationCap,
    ArrowLeft,
    Mail,
    Lock,
    UserIcon,
    Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        country: "",
        institution: "",
        position: ""
    });

    const userType = searchParams.get('type') || 'student';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Please make sure your passwords match.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(
                formData.email,
                formData.password,
                userType as 'student' | 'university',
                formData
            );

            if (error) {
                toast({
                    title: "Signup Failed",
                    description: error.message || "Failed to create account. Please try again.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Account Created Successfully!",
                    description: "Please check your email to verify your account.",
                });

                navigate('/login?type=' + userType);
            }
        } catch (error) {
            toast({
                title: "Signup Failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const countries = [
        "United States", "United Kingdom", "Canada", "Australia", "Germany",
        "France", "Netherlands", "Switzerland", "Sweden", "Denmark", "Norway",
        "Singapore", "Japan", "South Korea", "China", "India", "Brazil", "Mexico"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                </Button>

                <Card className="shadow-large border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Join EduConnect Global</CardTitle>
  