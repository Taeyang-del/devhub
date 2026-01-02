import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Plus, Star, Eye, Trash2, Edit2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("projects");

  // Fetch user projects
  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.list.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fetch user snippets
  const { data: snippets = [], isLoading: snippetsLoading } = trpc.snippets.list.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fetch user notifications
  const { data: notifications = [], isLoading: notificationsLoading } = trpc.notifications.list.useQuery(
    { limit: 20 },
    { enabled: !!user?.id }
  );

  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const deleteSnippetMutation = trpc.snippets.delete.useMutation();

  const handleDeleteProject = async (projectId: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProjectMutation.mutateAsync({ id: projectId });
    }
  };

  const handleDeleteSnippet = async (snippetId: number) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      await deleteSnippetMutation.mutateAsync({ id: snippetId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              ← Back
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your projects, snippets, and profile</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="snippets">Snippets</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <Button className="gap-2" onClick={() => setLocation("/dashboard/projects/new")}>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
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
                  <Button onClick={() => setLocation("/dashboard/projects/new")}>Create Your First Project</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const techStack = project.techStack ? JSON.parse(project.techStack) : [];
                  return (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <CardContent className="space-y-4">
                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {techStack.slice(0, 3).map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {project.stars || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.views || 0}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border/40">
                          <Button variant="outline" size="sm" className="w-full flex-1" onClick={() => setLocation(`/projects/${project.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="w-full flex-1 gap-2" onClick={() => setLocation(`/dashboard/projects/${project.id}/edit`)}>
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Snippets Tab */}
          <TabsContent value="snippets" className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Snippets</h2>
              <Button className="gap-2" onClick={() => setLocation("/dashboard/snippets/new")}>
                <Plus className="h-4 w-4" />
                New Snippet
              </Button>
            </div>

            {snippetsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : snippets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No snippets yet</p>
                  <Button onClick={() => setLocation("/dashboard/snippets/new")}>Create Your First Snippet</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {snippets.map((snippet) => {
                  const tags = snippet.tags ? JSON.parse(snippet.tags) : [];
                  return (
                    <Card key={snippet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-1">{snippet.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{snippet.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{snippet.language}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {snippet.stars || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {snippet.views || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border/40">
                          <Button variant="outline" size="sm" className="w-full flex-1" onClick={() => setLocation(`/snippets/${snippet.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="w-full flex-1 gap-2" onClick={() => setLocation(`/dashboard/snippets/${snippet.id}/edit`)}>
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDeleteSnippet(snippet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            {notificationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold capitalize">
                            {notification.type} on {notification.targetType}
                          </p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge>New</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your profile information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setLocation("/dashboard/settings/profile")}>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
