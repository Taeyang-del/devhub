import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Code2, Zap, Users, Star, Share2, Search, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold gradient-text">DevHub</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href={`/profile/${user?.id}`}>
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Showcase Your Code,
              <span className="gradient-text"> Connect with Developers</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              DevHub is the elegant platform for developers to build portfolios, share code snippets,
              and discover amazing projects from the global developer community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline">
                    Explore Projects
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <Link href="/explore">
                  <Button size="lg" variant="outline">
                    Browse Projects
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to build and share your developer portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-hover border-border/50">
              <CardHeader>
                <Code2 className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Code Snippets</CardTitle>
                <CardDescription>Share and discover code snippets with syntax highlighting</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Easily create, organize, and share your favorite code snippets with the community.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/50">
              <CardHeader>
                <Zap className="h-8 w-8 text-accent mb-2" />
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Get code explanations and documentation instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leverage AI to understand code better and generate professional documentation.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/50">
              <CardHeader>
                <Users className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Connect with developers and follow their work</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build your network by following developers and discovering their latest projects.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/50">
              <CardHeader>
                <Star className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Social Features</CardTitle>
                <CardDescription>Star projects and get notified of interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Appreciate great work by starring projects and stay updated with notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/50">
              <CardHeader>
                <Share2 className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>Generate beautiful code screenshots for social media</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create stunning code visuals and share them directly to your social networks.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/50">
              <CardHeader>
                <Search className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>Find projects by language, tags, and popularity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover exactly what you're looking for with powerful filtering and search.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Showcase Your Work?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of developers building their portfolios on DevHub.
            </p>
          </div>

          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Start Building Today <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-6 w-6 text-accent" />
                <span className="font-bold">DevHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The elegant platform for developers to build portfolios and share code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore"><a className="hover:text-foreground transition">Explore</a></Link></li>
                <li><Link href="/snippets"><a className="hover:text-foreground transition">Snippets</a></Link></li>
                <li><Link href="/developers"><a className="hover:text-foreground transition">Developers</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DevHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
