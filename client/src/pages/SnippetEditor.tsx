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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "bash",
  "yaml",
  "json",
];

export default function SnippetEditor() {
  const { snippetId } = useParams<{ snippetId?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isEditing = !!snippetId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  // Fetch snippet if editing
  const { data: snippet, isLoading } = trpc.snippets.getById.useQuery(
    { id: parseInt(snippetId || "0") },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (snippet) {
      setFormData({
        title: snippet.title,
        description: snippet.description || "",
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags ? JSON.parse(snippet.tags) : [],
      });
    }
  }, [snippet]);

  const createMutation = trpc.snippets.create.useMutation();
  const updateMutation = trpc.snippets.update.useMutation();

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
      toast.error("Snippet title is required");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Code content is required");
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: parseInt(snippetId!),
          ...formData,
        });
        toast.success("Snippet updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Snippet created successfully");
      }
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Failed to save snippet");
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
            {isEditing ? "Edit Snippet" : "Create New Snippet"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isEditing
              ? "Update your code snippet"
              : "Share a useful code snippet with the community"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Snippet Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., React Custom Hook for API Calls"
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
                <CardDescription>Brief description of what this snippet does</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the purpose and usage of this snippet..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader>
                <CardTitle>Programming Language</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Code */}
            <Card>
              <CardHeader>
                <CardTitle>Code</CardTitle>
                <CardDescription>Paste your code here</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="// Your code here..."
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
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
                    placeholder="e.g., react, hooks, api"
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
                {isEditing ? "Update Snippet" : "Create Snippet"}
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
