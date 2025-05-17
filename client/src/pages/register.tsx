import { useEffect } from "react";
import { useLocation } from "wouter";
import AuthLayout from "@/components/layouts/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect user if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.userType === "student") {
        setLocation("/dashboard");
      } else if (user?.userType === "school") {
        setLocation("/school-dashboard");
      } else if (user?.userType === "authority") {
        setLocation("/authority-dashboard");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <AuthLayout
      activeTab="student"
      title="Student/Parent Registration"
      subtitle="Create an account to submit complaints or connect with alumni"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
