import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Twitter, Globe, Save, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile data
  const { data: profileData } = trpc.profile.getProfile.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const [formData, setFormData] = useState({
    bio: profileData?.profile?.bio || "",
    location: profileData?.profile?.location || "",
    website: profileData?.profile?.website || "",
    github: profileData?.profile?.github || "",
    linkedin: profileData?.profile?.linkedin || "",
    twitter: profileData?.profile?.twitter || "",
  });

  const updateProfileMutation = trpc.profile.updateProfile.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profile updated successfully!");
      setLocation(`/profile/${user?.id}`);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Skeleton className="h-32 w-32 rounded-full mb-6" />
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  const { profile, user: profileUser } = profileData;
  const initials = profileUser?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-8">
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/profile/${user?.id}`)} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your profile information and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-accent/20">
                  <AvatarImage src={profile?.avatarUrl || ""} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New Picture
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your name and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Name</label>
                <Input
                  value={profileUser?.name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Email</label>
                <Input
                  value={profileUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Bio</label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Website</label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </label>
                <Input
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </label>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </label>
                <Input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setLocation(`/profile/${user?.id}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
