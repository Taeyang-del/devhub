import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Eye, Code2, Search, Filter } from "lucide-react";

const POPULAR_LANGUAGES = ["JavaScript", "Python", "TypeScript", "React", "Node.js", "Go", "Rust"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"stars" | "recent">("stars");

  // Fetch all projects (in a real app, this would support pagination and filtering)
  const { data: allProjects = [], isLoading } = trpc.projects.list.useQuery({
    limit: 50,
  });

  // Filter and sort projects
  const filteredProjects = allProjects
    .filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        !selectedLanguage ||
        (project.techStack &&
          JSON.parse(project.techStack).some((tech: string) =>
            tech.toLowerCase().includes(selectedLanguage.toLowerCase())
          ));

      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === "stars") {
        return (b.stars || 0) - (a.stars || 0);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-4">Explore Projects</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover amazing projects from developers around the world
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Language
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLanguage === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(null)}
                >
                  All
                </Button>
                {POPULAR_LANGUAGES.map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Sort by</p>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "stars" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("stars")}
                >
                  Most Stars
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                >
                  Recent
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
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
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                            <Eye className="h-4 w-4" />
                            {project.views || 0}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
