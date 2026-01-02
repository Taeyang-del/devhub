import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Twitter, Globe, Users, Star, Code2, MapPin } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [isFollowing, setIsFollowing] = useState(false);

  const userIdNum = parseInt(userId || "0");
  const isOwnProfile = currentUser?.id === userIdNum;

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = trpc.profile.getProfile.useQuery(
    { userId: userIdNum },
    { enabled: !!userIdNum }
  );

  // Fetch user projects
  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.list.useQuery(
    { userId: userIdNum },
    { enabled: !!userIdNum }
  );

  // Fetch follow status
  const { data: followStatus } = trpc.social.isFollowing.useQuery(
    { userId: userIdNum },
    { enabled: !!currentUser && !isOwnProfile }
  );

  const followMutation = trpc.social.follow.useMutation();
  const unfollowMutation = trpc.social.unfollow.useMutation();

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync({ userId: userIdNum });
    } else {
      await followMutation.mutateAsync({ userId: userIdNum });
    }
    setIsFollowing(!isFollowing);
  };

  if (profileLoading) {
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

  const { profile, user } = profileData || {};

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Developer Not Found</CardTitle>
            <CardDescription>The profile you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skills = profile?.skills ? JSON.parse(profile.skills) : [];
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-12">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mb-4">
            ← Back
          </Button>          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <Avatar className="h-32 w-32 border-4 border-accent/20">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              {profile?.bio && <p className="text-lg text-muted-foreground mb-4">{profile.bio}</p>}

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {profile?.followers || 0} followers
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {projects.reduce((sum, p) => sum + (p.stars || 0), 0)} stars
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {profile?.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                )}
                {profile?.twitter && (
                  <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                )}
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Button>
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={() => setLocation("/dashboard/settings")}>Edit Profile</Button>
                ) : (
                  <Button onClick={handleFollowToggle} variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold mb-6">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Projects</h2>
              {isOwnProfile && (
                <Button size="sm" className="gap-2" onClick={() => setLocation("/dashboard/projects/new")}>
                  <Code2 className="h-4 w-4" />
                  New Project
                </Button>
              )}
        </div>

        {projectsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No projects yet</p>
                  {isOwnProfile && (
                    <Button onClick={() => setLocation("/dashboard/projects/new")}>Create Your First Project</Button>
                  )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const techStack = project.techStack ? JSON.parse(project.techStack) : [];
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="card-hover h-full cursor-pointer overflow-hidden">
                    {project.thumbnailUrl && (
                      <div className="h-40 bg-gradient-to-br from-accent/10 to-accent/5 overflow-hidden">
                        <img
                          src={project.thumbnailUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {techStack.slice(0, 3).map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {techStack.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{techStack.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {project.stars || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Code2 className="h-4 w-4" />
                            {project.views || 0} views
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
