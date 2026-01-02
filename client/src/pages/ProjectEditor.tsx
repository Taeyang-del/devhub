import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProjectEditor() {
  const { projectId } = useParams<{ projectId?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isEditing = !!projectId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    readmeContent: "",
    repositoryUrl: "",
    liveUrl: "",
    techStack: [] as string[],
    tags: [] as string[],
  });

  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Fetch project if editing
  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: parseInt(projectId || "0") },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        readmeContent: project.readmeContent || "",
        repositoryUrl: project.repositoryUrl || "",
        liveUrl: project.liveUrl || "",
        techStack: project.techStack ? JSON.parse(project.techStack) : [],
        tags: project.tags ? JSON.parse(project.tags) : [],
      });
    }
  }, [project]);

  const createMutation = trpc.projects.create.useMutation();
  const updateMutation = trpc.projects.update.useMutation();

  const handleAddTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: parseInt(projectId!),
          ...formData,
        });
        toast.success("Project updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Project created successfully");
      }
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            {isEditing ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isEditing
              ? "Update your project details"
              : "Share your amazing project with the community"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Project Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., DevHub - Developer Portfolio Platform"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Brief description of your project</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe what your project does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* README */}
            <Card>
              <CardHeader>
                <CardTitle>README Content</CardTitle>
                <CardDescription>Markdown content for your project README</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="# My Project\n\nDescription and documentation..."
                  value={formData.readmeContent}
                  onChange={(e) => setFormData({ ...formData, readmeContent: e.target.value })}
                  rows={8}
                />
              </CardContent>
            </Card>

            {/* URLs */}
            <Card>
              <CardHeader>
                <CardTitle>Project Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Repository URL</Label>
                  <Input
                    placeholder="https://github.com/username/project"
                    value={formData.repositoryUrl}
                    onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Live Demo URL</Label>
                  <Input
                    placeholder="https://myproject.com"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTech} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="cursor-pointer">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., web, mobile, ai"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? "Update Project" : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setLocation("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
