import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthLayout from "@/components/layouts/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { USER_TYPES } from "@/lib/constants";

export default function Register() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<"student" | "school" | "authority">("student");
  
  // Get the tab from URL query param if any
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as "student" | "school" | "authority" | null;
    
    if (tabParam && ["student", "school", "authority"].includes(tabParam)) {
      setUserType(tabParam);
    }
  }, []);
  
  // Redirect user if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.userType === USER_TYPES.STUDENT) {
        setLocation("/dashboard");
      } else if (user?.userType === USER_TYPES.SCHOOL) {
        setLocation("/school-dashboard");
      } else if (user?.userType === USER_TYPES.AUTHORITY) {
        setLocation("/authority-dashboard");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  // Get title and subtitle based on user type
  const getTitleAndSubtitle = () => {
    switch(userType) {
      case "student":
        return {
          title: "Student/Parent Registration",
          subtitle: "Create an account to submit complaints or connect with alumni"
        };
      case "school":
        return {
          title: "School Administrator Registration",
          subtitle: "Create an account to manage your school and respond to complaints"
        };
      case "authority":
        return {
          title: "Education Authority Registration",
          subtitle: "Create an account to oversee schools and track complaints in your district"
        };
      default:
        return {
          title: "Registration",
          subtitle: "Create a new account"
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <AuthLayout
      activeTab={userType}
      title={title}
      subtitle={subtitle}
      onTabChange={(tab) => setUserType(tab as "student" | "school" | "authority")}
    >
      <RegisterForm userType={userType} />
    </AuthLayout>
  );
}
