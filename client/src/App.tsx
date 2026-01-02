import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";

import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import ProjectEditor from "./pages/ProjectEditor";
import SnippetEditor from "./pages/SnippetEditor";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/projects/new"} component={ProjectEditor} />
      <Route path={"/dashboard/projects/:projectId/edit"} component={ProjectEditor} />
      <Route path={"/dashboard/snippets/new"} component={SnippetEditor} />
      <Route path={"/dashboard/snippets/:snippetId/edit"} component={SnippetEditor} />
      <Route path={"/profile/:userId"} component={Profile} />
      <Route path={"/projects/:projectId"} component={ProjectDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
