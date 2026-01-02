import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Github, Globe, Code2, Eye, User } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [isStarred, setIsStarred] = useState(false);

  const projectIdNum = parseInt(projectId || "0");

  // Fetch project data
  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery(
    { id: projectIdNum },
    { enabled: !!projectIdNum }
  );

  // Fetch author profile
  const { data: authorProfile } = trpc.profile.getProfile.useQuery(
    { userId: project?.userId || 0 },
    { enabled: !!project?.userId }
  );

  // Fetch star status
  const { data: starStatus } = trpc.projects.isStarred.useQuery(
    { projectId: projectIdNum },
    { enabled: !!currentUser && !!projectIdNum }
  );

  const starMutation = trpc.projects.star.useMutation();
  const unstarMutation = trpc.projects.unstar.useMutation();

  const handleStarToggle = async () => {
    if (isStarred) {
      await unstarMutation.mutateAsync({ projectId: projectIdNum });
    } else {
      await starMutation.mutateAsync({ projectId: projectIdNum });
    }
    setIsStarred(!isStarred);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <Skeleton className="h-8 w-96 mb-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The project you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const techStack = project.techStack ? JSON.parse(project.techStack) : [];
  const tags = project.tags ? JSON.parse(project.tags) : [];
  const authorInitials = authorProfile?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-12">
          {project.thumbnailUrl && (
            <div className="mb-8 rounded-lg overflow-hidden h-80 bg-gradient-to-br from-accent/10 to-accent/5">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{project.description}</p>

          <div className="flex flex-wrap gap-4 mb-8">
            {project.repositoryUrl && (
              <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  Repository
                </Button>
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Live Demo
                </Button>
              </a>
            )}
            {currentUser && (
              <Button
                onClick={handleStarToggle}
                variant={isStarred ? "default" : "outline"}
                className="gap-2"
              >
                <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
                {project.stars || 0}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {techStack.map((tech: string) => (
              <Badge key={tech} className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-border/40">
            <Link href={`/profile/${project.userId}`}>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={authorProfile?.profile?.avatarUrl || ""} />
                  <AvatarFallback>{authorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{authorProfile?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">Project Author</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="readme" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="readme">README</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="readme" className="mt-6">
                {project.readmeContent ? (
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <Streamdown>{project.readmeContent}</Streamdown>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No README provided</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-6 space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Stars</p>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-accent" />
                          <span className="text-lg font-semibold">{project.stars || 0}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Views</p>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <span className="text-lg font-semibold">{project.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {tags.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50 sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Technology Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {techStack.slice(0, 5).map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mb-2">Visibility</p>
                  <Badge variant="outline" className="capitalize">
                    {project.visibility}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {currentUser?.id === project.userId && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => setLocation(`/dashboard/projects/${project.id}/edit`)}>
                    Edit Project
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
