import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AuthLayout from "@/components/layouts/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { t } from "@/lib/i18n";

export default function Login() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"student" | "school" | "authority">("student");
  
  // Get the tab from URL query param if any
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as "student" | "school" | "authority" | null;
    
    if (tabParam && ["student", "school", "authority"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  
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

  // Get title and subtitle based on active tab
  const getTitleAndSubtitle = () => {
    switch (activeTab) {
      case "student":
        return {
          title: t("loginStudent"),
          subtitle: "Access your account to submit complaints or connect with alumni"
        };
      case "school":
        return {
          title: t("schoolAdmin"),
          subtitle: "Access school dashboard to manage complaints and alumni connections"
        };
      case "authority":
        return {
          title: t("authority"),
          subtitle: "Government officials access portal for monitoring and action"
        };
      default:
        return {
          title: t("loginStudent"),
          subtitle: "Access your account to submit complaints or connect with alumni"
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <AuthLayout
      activeTab={activeTab}
      title={title}
      subtitle={subtitle}
    >
      <LoginForm userType={activeTab} />
    </AuthLayout>
  );
}
