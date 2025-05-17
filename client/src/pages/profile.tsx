import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "../hooks/useAuth";
import { KARNATAKA_DISTRICTS } from "@/lib/constants";
import { USER_TYPES } from "@/lib/constants";
import { t } from "@/lib/i18n";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile form schema
  const profileFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    district: z.string().min(1, "District is required"),
    schoolName: z.string().min(1, "School name is required"),
    classInfo: z.string().optional(),
  });

  // Password form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  // Profile form definition
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      district: user?.district || "",
      schoolName: user?.schoolName || "",
      classInfo: user?.classInfo || "",
    },
  });

  // Password form definition
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const response = await apiRequest("PUT", `/api/user/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      setIsEditingProfile(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update profile",
      });
    }
  });

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: z.infer<typeof passwordFormSchema>) => {
      const response = await apiRequest("PUT", `/api/user/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset();
      setIsEditingPassword(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error.message || "Could not change password",
      });
    }
  });

  // Profile form submission handler
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfile.mutate(values);
  };

  // Password form submission handler
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    changePassword.mutate(values);
  };

  // Get user type label
  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case USER_TYPES.STUDENT:
        return t("student") + "/" + t("parent");
      case USER_TYPES.SCHOOL:
        return t("schoolAdmin");
      case USER_TYPES.AUTHORITY:
        return t("authority");
      default:
        return "";
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto mt-4" />
                <Skeleton className="h-4 w-32 mx-auto mt-2" />
                <Skeleton className="h-10 w-32 mx-auto mt-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mb-24 sm:mb-0">
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
          <p className="text-neutral-500">{getUserTypeLabel()}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
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
                        
                        <FormField
                          control={profileForm.control}
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
                        
                        <FormField
                          control={profileForm.control}
                          name="classInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("classInfo")}</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. Class 10A" {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditingProfile(false)}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-accent-500 hover:bg-accent-600"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Full Name</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Phone Number</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.phoneNumber || "-"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">{t("district")}</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.district || "-"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">{t("school")}</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.schoolName || "-"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">{t("classInfo")}</h3>
                        <p className="mt-1 text-sm text-neutral-900">{user.classInfo || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                {isEditingPassword ? (
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 6 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditingPassword(false)}
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-accent-500 hover:bg-accent-600"
                          disabled={changePassword.isPending}
                        >
                          {changePassword.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div>
                    <p className="text-neutral-600 mb-4">
                      It's a good idea to use a strong password that you're not using elsewhere
                    </p>
                    <Button 
                      onClick={() => setIsEditingPassword(true)}
                      className="bg-accent-500 hover:bg-accent-600"
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-6 flex flex-col items-start">
                <h3 className="text-lg font-medium mb-4">Account Security</h3>
                <div className="space-y-4 w-full">
                  <div className="flex flex-row items-center justify-between w-full p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">Two-factor authentication</h4>
                      <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  
                  <div className="flex flex-row items-center justify-between w-full p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">Active sessions</h4>
                      <p className="text-sm text-neutral-500">Manage your active sessions</p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
