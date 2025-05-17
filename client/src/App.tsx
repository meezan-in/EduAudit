import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Complaints from "@/pages/complaints";
import ComplaintDetails from "@/pages/complaint-details";
import AlumniConnect from "@/pages/alumni-connect";
import Profile from "@/pages/profile";
import SchoolDashboard from "@/pages/school-dashboard";
import AuthorityDashboard from "@/pages/authority-dashboard";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { USER_TYPES } from "@/lib/constants";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  return <>{children}</>;
};

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // Redirect based on user type
  const getDashboardRoute = () => {
    if (!isAuthenticated) return "/login";
    
    switch (user?.userType) {
      case USER_TYPES.STUDENT:
        return "/dashboard";
      case USER_TYPES.SCHOOL:
        return "/school-dashboard";
      case USER_TYPES.AUTHORITY:
        return "/authority-dashboard";
      default:
        return "/login";
    }
  };

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Route to appropriate dashboard */}
      <Route path="/">
        {() => {
          window.location.href = getDashboardRoute();
          return null;
        }}
      </Route>
      
      {/* Student Routes */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/complaints">
        {() => (
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/complaints/:id">
        {({ id }) => (
          <ProtectedRoute>
            <ComplaintDetails id={id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/alumni-connect">
        {() => (
          <ProtectedRoute>
            <AlumniConnect />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* School Admin Route */}
      <Route path="/school-dashboard">
        {() => (
          <ProtectedRoute>
            <SchoolDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Higher Authority Route */}
      <Route path="/authority-dashboard">
        {() => (
          <ProtectedRoute>
            <AuthorityDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
