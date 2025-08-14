import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, User, Building2, Globe, Mail, Phone, MapPin } from "lucide-react";

interface ProfileDialogProps {
  trigger: React.ReactNode;
  userType: 'student' | 'university';
  onProfileUpdate?: () => void; // Callback to refresh parent component
}

export function ProfileDialog({ trigger, userType, onProfileUpdate }: ProfileDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    bio: "",
    institution: "",
    position: "",
    website: "",
    specialization: "",
    yearOfStudy: "",
    gpa: ""
  });

  const loadProfileData = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading profile data for dialog...');
      if (userType === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Profile data loaded:', data);
        
        if (error) {
          console.error('Error loading profile data:', error);
          return;
        }

        if (data) {
          const newFormData = {
            fullName: data.full_name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            country: data.country || "",
            bio: data.bio || "",
            institution: "",
            position: "",
            website: "",
            specialization: data.specialization || "",
            yearOfStudy: data.year_of_study || "",
            gpa: data.gpa || ""
          };
          console.log('Setting form data:', newFormData);
          setFormData(newFormData);
        } else {
          // Set defaults for new profile
          console.log('No profile found, setting defaults');
          setFormData(prev => ({
            ...prev,
            fullName: "",
            phone: "",
            country: "",
            bio: "",
            specialization: "",
            yearOfStudy: "",
            gpa: "",
            email: user.email || ""
          }));
        }
      } else {
        const { data } = await supabase
          .from('university_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setFormData({
            fullName: data.name || "",
            email: data.contact_email || user.email || "",
            phone: data.phone || "",
            country: "",
            bio: data.description || "",
            institution: data.name || "",
            position: "",
            website: data.website || "",
            specialization: "",
            yearOfStudy: "",
            gpa: ""
          });
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || ""
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user, userType]);

  // Load existing profile data when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      console.log('Dialog opened, loading fresh profile data...');
      loadProfileData();
    }
  }, [isOpen, user, loadProfileData, refreshKey]);

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      console.log('Dialog opened, forcing fresh data load...');
      setRefreshKey(prev => prev + 1);
    } else {
      console.log('Dialog closed, resetting loading state');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      console.log('Submitting profile data:', formData);
      
      // Check authentication
      if (!user || !user.id) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Validate required fields
      if (!formData.fullName?.trim()) {
        throw new Error('Full name is required');
      }
      
      if (!formData.email?.trim()) {
        throw new Error('Email is required');
      }
      
      if (userType === 'student') {
        const profileData = {
          user_id: user.id,
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || null,
          country: formData.country?.trim() || null,
          bio: formData.bio?.trim() || null,
          specialization: formData.specialization?.trim() || null,
          year_of_study: formData.yearOfStudy || null,
          gpa: formData.gpa?.trim() || null
        };
        
        console.log('Upserting student profile with data:', profileData);
        
        // First, let's try to see if there's an existing profile
        const { data: existingProfile, error: checkError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        console.log('Existing profile check:', { existingProfile, checkError });
        
        const { data, error } = await supabase
          .from('student_profiles')
          .upsert(profileData, {
            onConflict: 'user_id'
          })
          .select();
        
        if (error) {
          console.error('=== DETAILED DATABASE ERROR ===');
          console.error('Error message:', error.message);
          console.error('Error code:', error.code);
          console.error('Error details:', error.details);
          console.error('Error hint:', error.hint);
          console.error('Full error object:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Profile updated successfully:', data);
      } else {
        const universityData = {
          id: user.id,
          name: formData.fullName?.trim() || formData.institution?.trim(),
          contact_email: formData.email.trim(),
          phone: formData.phone?.trim() || null,
          description: formData.bio?.trim() || null,
          website: formData.website?.trim() || null
        };
        
        console.log('Upserting university profile:', universityData);
        
        const { data, error } = await supabase
          .from('university_profiles')
          .upsert(universityData, {
            onConflict: 'id'
          })
          .select();
        
        if (error) {
          console.error('Database error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('University profile updated successfully:', data);
      }

      setIsLoading(false);
      setIsOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Call the callback to refresh the parent component
      if (onProfileUpdate) {
        console.log('Calling onProfileUpdate callback...');
        onProfileUpdate();
      }
    } catch (error) {
      console.error('=== PROFILE UPDATE ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error:', error);
      
      setIsLoading(false);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error?.message) {
        if (error.message.includes('not authenticated')) {
          errorMessage = "Please log in again to update your profile.";
        } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorMessage = "Profile already exists. Please try refreshing the page.";
        } else if (error.message.includes('not null constraint') || error.message.includes('required')) {
          errorMessage = error.message;
        } else if (error.message.includes('permission denied') || error.message.includes('unauthorized')) {
          errorMessage = "You don't have permission to update this profile.";
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.startsWith('Database error:')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Profile</span>
          </DialogTitle>
          <DialogDescription>
            Update your profile information to help others connect with you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your country"
                />
              </div>
            </div>
          </div>

          {userType === 'university' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Institution name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Your position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Institution website"
                  />
                </div>
              </div>
            </div>
          )}

          {userType === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Field of Study</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select value={formData.yearOfStudy} onValueChange={(value) => setFormData(prev => ({ ...prev, yearOfStudy: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="freshman">Freshman</SelectItem>
                    <SelectItem value="sophomore">Sophomore</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="e.g., 3.8"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {/* Debug button - remove in production */}
            <Button type="button" variant="secondary" size="sm" onClick={() => {
              console.log('=== FORM DATA DEBUG ===');
              console.log('Current form data:', formData);
              console.log('User:', user);
              console.log('User ID:', user?.id);
            }}>
              Debug
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}