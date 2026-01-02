import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Github, Linkedin, Twitter, Globe } from "lucide-react";

export default function Developers() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all projects to show developers (using projects as proxy for developers)
  const { data: allProjects = [], isLoading } = trpc.projects.list.useQuery({
    limit: 50,
  });

  // Extract unique users from projects
  const allUsers = Array.from(
    new Map(
      allProjects.map((project) => [project.userId, { id: project.userId, name: `Developer ${project.userId}`, email: "" }])
    ).values()
  );

  // For now, show all projects' creators as developers
  // In a real app, you'd have a dedicated users.list endpoint

  // Filter users based on search query
  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const initials = (name?: string | null) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container py-12">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold">Discover Developers</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with talented developers from around the world
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No developers found</h2>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user: any) => (
              <Card
                key={user.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/profile/${user.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Avatar className="h-16 w-16 border-2 border-accent/20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name || "Anonymous"}</h3>
                    <p className="text-sm text-muted-foreground">Developer ID: {user.id}</p>
                  </div>

                  {/* View Profile Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/profile/${user.id}`);
                    }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
