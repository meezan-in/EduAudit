import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { t } from "@/lib/i18n";
import { GraduationCap, School, Landmark } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: "student" | "school" | "authority";
  title: string;
  subtitle: string;
}

export default function AuthLayout({ 
  children, 
  activeTab, 
  title, 
  subtitle 
}: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // This is needed to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-neutral-50 to-neutral-100">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero Section */}
          <div className="col-span-1 lg:col-span-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold font-poppins text-neutral-900 mb-2 flex items-center">
                  <span className="text-primary-500">{t("appName").split("Audit")[0]}</span>
                  <span className="text-secondary-500">{"Audit"}</span>
                  <span className="ml-1 p-1 bg-accent-500 text-white text-xs rounded-md">BETA</span>
                </h1>
                <LanguageSwitcher />
              </div>
              <p className="text-lg text-neutral-600 mb-4">{t("tagline")}</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center">
                  <span className="bg-primary-100 text-primary-700 p-1.5 rounded-full mr-2">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>File and track complaints about educational facilities</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-primary-100 text-primary-700 p-1.5 rounded-full mr-2">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Direct access to higher educational authorities</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-primary-100 text-primary-700 p-1.5 rounded-full mr-2">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Connect with alumni for guidance and mentorship</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-primary-100 text-primary-700 p-1.5 rounded-full mr-2">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>AI-powered complaint resolution system</span>
                </div>
              </div>
            </div>

            {/* School Images */}
            <div className="hidden lg:block rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                alt="Karnataka school building" 
                className="w-full h-48 object-cover" 
              />
            </div>
          </div>

          {/* Login/Register Form */}
          <div className="col-span-1 lg:col-span-2">
            <Card className="shadow-xl">
              <div className="flex border-b">
                <Tabs defaultValue={activeTab} className="w-full">
                  <TabsList className="w-full rounded-none bg-transparent border-b">
                    <TabsTrigger 
                      value="student" 
                      className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-accent-500 data-[state=active]:text-accent-500 rounded-none"
                      asChild
                    >
                      <Link href="/login?tab=student">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {t("loginStudent")}
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="school" 
                      className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-accent-500 data-[state=active]:text-accent-500 rounded-none"
                      asChild
                    >
                      <Link href="/login?tab=school">
                        <School className="mr-2 h-4 w-4" />
                        {t("loginSchool")}
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="authority" 
                      className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-accent-500 data-[state=active]:text-accent-500 rounded-none"
                      asChild
                    >
                      <Link href="/login?tab=authority">
                        <Landmark className="mr-2 h-4 w-4" />
                        {t("loginAuthority")}
                      </Link>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <CardContent className="p-6 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-2">{title}</h2>
                  <p className="text-neutral-600">{subtitle}</p>
                </div>
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
