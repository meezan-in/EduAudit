import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "../../hooks/useAuth";
import { t } from "@/lib/i18n";

interface LoginFormProps {
  userType: "student" | "school" | "authority";
}

export default function LoginForm({ userType }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Form schema based on user type
  const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().default(false).optional(),
  });

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await login(values.username, values.password);
    
    if (success) {
      // Redirect based on user type
      if (userType === "student") {
        setLocation("/dashboard");
      } else if (userType === "school") {
        setLocation("/school-dashboard");
      } else if (userType === "authority") {
        setLocation("/authority-dashboard");
      }
    }
  };

  // Get label text based on user type
  const getUsernameLabel = () => {
    switch (userType) {
      case "student":
        return t("email");
      case "school":
        return "School ID";
      case "authority":
        return "Official ID";
      default:
        return "Username";
    }
  };

  // Login button color based on user type
  const getLoginButtonClass = () => {
    switch (userType) {
      case "student":
        return "bg-accent-500 hover:bg-accent-600 focus:ring-accent-500";
      case "school":
        return "bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-500";
      case "authority":
        return "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500";
      default:
        return "bg-accent-500 hover:bg-accent-600 focus:ring-accent-500";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getUsernameLabel()}</FormLabel>
              <FormControl>
                <Input
                  placeholder={userType === "student" ? "Enter your email or student ID" : `Enter ${userType} ID`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm text-neutral-600">
                  {t("rememberMe")}
                </FormLabel>
              </FormItem>
            )}
          />
          <a href="#" className="text-sm text-accent-500 hover:underline">
            {t("forgotPassword")}
          </a>
        </div>

        {/* Show OTP field for authority users */}
        {userType === "authority" && (
          <div>
            <FormLabel>OTP</FormLabel>
            <div className="flex space-x-2">
              <Input 
                type="text" 
                placeholder="Enter OTP sent to your phone" 
                className="w-3/4" 
              />
              <Button 
                type="button" 
                className="w-1/4 bg-primary-500 text-white font-medium"
              >
                Send OTP
              </Button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getLoginButtonClass()}`}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : t("login")}
        </Button>

        {userType === "student" && (
          <div className="text-center text-sm text-neutral-600">
            {t("noAccount")}{" "}
            <a href="/register" className="text-accent-500 hover:underline">
              {t("register")} {t("here")}
            </a>
          </div>
        )}
      </form>
    </Form>
  );
}
