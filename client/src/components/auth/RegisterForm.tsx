import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../../hooks/useAuth";
import { t } from "@/lib/i18n";
import { KARNATAKA_DISTRICTS, USER_TYPES } from "@/lib/constants";

interface RegisterFormProps {
  userType: "student" | "school" | "authority";
}

export default function RegisterForm({ userType }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Base schema fields for all user types
  const baseSchema = {
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Full name is required"),
    district: z.string().min(1, "District is required"),
    phoneNumber: z.string().optional(),
  };
  
  // Student-specific schema fields
  const studentSchema = {
    ...baseSchema,
    schoolName: z.string().min(1, "School name is required"),
    classInfo: z.string().optional(),
  };
  
  // School-specific schema fields
  const schoolSchema = {
    ...baseSchema,
    schoolName: z.string().min(1, "School name is required"),
    address: z.string().optional(),
    pincode: z.string().optional(),
    category: z.string().optional(),
  };
  
  // Authority-specific schema fields
  const authoritySchema = {
    ...baseSchema,
    designation: z.string().min(1, "Designation is required"),
  };
  
  // Select schema based on user type
  const getFormSchema = () => {
    switch (userType) {
      case "student":
        return z.object(studentSchema).refine(data => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      case "school":
        return z.object(schoolSchema).refine(data => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      case "authority":
        return z.object(authoritySchema).refine(data => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      default:
        return z.object(studentSchema).refine(data => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
    }
  };
  
  const formSchema = getFormSchema();

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      district: "",
      phoneNumber: "",
      ...(userType === "student" ? {
        schoolName: "",
        classInfo: "",
      } : {}),
      ...(userType === "school" ? {
        schoolName: "",
        address: "",
        pincode: "",
        category: "",
      } : {}),
      ...(userType === "authority" ? {
        designation: "",
      } : {}),
    },
  });
  
  // Reset form when user type changes
  useEffect(() => {
    form.reset();
  }, [userType, form]);

  // Form submission handler
  const onSubmit = async (values: any) => {
    const { confirmPassword, ...userData } = values;
    
    const registrationData = {
      ...userData,
      userType,
    };
    
    const success = await register(registrationData);
    
    if (success) {
      if (userType === USER_TYPES.STUDENT) {
        setLocation("/dashboard");
      } else if (userType === USER_TYPES.SCHOOL) {
        setLocation("/school-dashboard");
      } else if (userType === USER_TYPES.AUTHORITY) {
        setLocation("/authority-dashboard");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number {userType !== "student" ? "" : "(Optional)"}</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("district")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {KARNATAKA_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {userType === "authority" ? (
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Your official designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("school")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Your school name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        {userType === "student" && (
          <FormField
            control={form.control}
            name="classInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("classInfo")}</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Class 10A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {userType === "school" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Address</FormLabel>
                    <FormControl>
                      <Input placeholder="School's full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="School's pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Government Aided">Government Aided</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Special Education">Special Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button
          type="submit"
          className="w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-medium text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Registering..." : "Register"}
        </Button>
        
        <div className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <a href="/login" className="text-accent-500 hover:underline">
            Login here
          </a>
        </div>
      </form>
    </Form>
  );
}
