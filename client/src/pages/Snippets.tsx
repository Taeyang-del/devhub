import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Code2, Star, Eye, Copy } from "lucide-react";

export default function Snippets() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"stars" | "recent">("recent");

  // Fetch all snippets
  const { data: allSnippets = [], isLoading } = trpc.snippets.list.useQuery({
    limit: 50,
  });

  const POPULAR_LANGUAGES = ["JavaScript", "Python", "TypeScript", "React", "Go", "Rust", "SQL"];

  // Filter and sort snippets
  const filteredSnippets = allSnippets
    .filter((snippet) => {
      const matchesSearch =
        !searchQuery ||
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        !selectedLanguage ||
        snippet.language?.toLowerCase().includes(selectedLanguage.toLowerCase());

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
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold">Code Snippets</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Discover useful code snippets shared by the developer community
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6 max-w-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3">Filter by Language</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLanguage === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(null)}
                >
                  All Languages
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
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                >
                  Recent
                </Button>
                <Button
                  variant={sortBy === "stars" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("stars")}
                >
                  Most Starred
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-96 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No snippets found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSnippets.map((snippet) => (
              <Card
                key={snippet.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/snippets/${snippet.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{snippet.title}</CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{snippet.language}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{snippet.stars || 0} stars</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{snippet.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Code2 className="h-4 w-4" />
                      <span>{snippet.code?.length || 0} characters</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
