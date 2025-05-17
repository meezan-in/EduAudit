import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import DistrictInsights from "@/components/dashboard/DistrictInsights";
import ComplaintForm from "@/components/complaint/ComplaintForm";
import AlumniConnectForm from "@/components/alumni/AlumniConnectForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user } = useAuth();
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [isAlumniFormOpen, setIsAlumniFormOpen] = useState(false);

  // Fetch recent complaints
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });

  // Fetch alumni connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/connections'],
  });

  // Fetch alumni profiles
  const { data: alumni, isLoading: alumniLoading } = useQuery({
    queryKey: ['/api/alumni'],
  });

  const isLoading = complaintsLoading || connectionsLoading || alumniLoading;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {t("welcome")}, {user?.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                {user?.schoolName}, {user?.classInfo}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button 
                onClick={() => setIsComplaintFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-white bg-accent-500 hover:bg-accent-600"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("newComplaint")}
              </Button>
              <Button 
                onClick={() => setIsAlumniFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-white bg-primary-500 hover:bg-primary-600"
              >
                <Users className="mr-2 h-4 w-4" /> {t("connectAlumni")}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="mt-6 px-4 sm:px-6">
          <h3 className="text-lg font-medium text-neutral-900">{t("overview")}</h3>
          <OverviewCards />
        </div>

        {/* Recent Complaints */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-neutral-900">{t("recentComplaints")}</h3>
            <Link href="/complaints" className="text-sm font-medium text-accent-500 hover:text-accent-600">
              {t("viewAll")}
            </Link>
          </div>
          
          {isLoading ? (
            <div className="mt-2 space-y-4">
              {Array(3).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="mt-2">
              {complaints && complaints.length > 0 ? (
                <ul className="divide-y divide-neutral-200 border rounded-md overflow-hidden">
                  {complaints.slice(0, 3).map((complaint: any) => (
                    <Link key={complaint.id} href={`/complaints/${complaint.id}`} className="block hover:bg-neutral-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-accent-500 truncate">
                              {complaint.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Badge 
                                variant="secondary"
                                className={`${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].bg} ${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].text}`}
                              >
                                {t(complaint.status as any)}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-neutral-500">
                              Token: <span className="font-medium">{complaint.tokenId}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </ul>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center">
                      <p className="text-neutral-600">No complaints submitted yet</p>
                      <Button 
                        onClick={() => setIsComplaintFormOpen(true)}
                        className="mt-4 bg-accent-500 hover:bg-accent-600"
                      >
                        {t("newComplaint")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Alumni Connect Section */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-neutral-900">{t("connectAlumni")}</h3>
            <Link href="/alumni-connect" className="text-sm font-medium text-accent-500 hover:text-accent-600">
              {t("findMoreAlumni")}
            </Link>
          </div>
          
          {isLoading ? (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array(3).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alumni && alumni.length > 0 ? (
                alumni.slice(0, 3).map((alum: any) => (
                  <Card key={alum.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={alum.user?.profilePicture} alt={alum.user?.name || "Alumni"} />
                          <AvatarFallback>
                            {alum.user?.name ? getInitials(alum.user.name) : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-neutral-900">{alum.user?.name || "Alumni Member"}</h4>
                          <p className="text-sm text-neutral-500">{alum.currentOccupation}</p>
                          <p className="text-xs text-neutral-400">Class of {alum.graduationYear}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {alum.expertiseAreas.slice(0, 3).map((area: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-3">
                      <Button 
                        onClick={() => {
                          setIsAlumniFormOpen(true);
                        }}
                        variant="ghost"
                        className="w-full text-center text-sm font-medium text-accent-500 hover:text-accent-600"
                      >
                        {t("requestMentorship")}
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Card>
                    <CardContent className="py-6">
                      <div className="text-center">
                        <p className="text-neutral-600">No alumni available yet</p>
                        <Button 
                          onClick={() => setIsAlumniFormOpen(true)}
                          className="mt-4 bg-primary-500 hover:bg-primary-600"
                        >
                          {t("connectAlumni")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* District Insights */}
        <div className="mt-6 px-4 sm:px-6">
          <DistrictInsights />
        </div>

        {/* Team Information */}
        <div className="mt-8 px-4 sm:px-6 mb-24 sm:mb-16">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-500 to-accent-500">
              <h3 className="text-lg leading-6 font-medium text-white">Developed by EduPulse Innovators</h3>
              <p className="mt-1 max-w-2xl text-sm text-white opacity-90">
                A team dedicated to improving Karnataka's educational ecosystem
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">EduPulse Innovators</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">EduAudit: Karnataka Educational Complaint Management System</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Key Features</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">Complaint Management System</span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">AI-Powered Complaint Analysis</span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">Alumni Connect Platform</span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">Multi-level User Access (Student, School, Authority)</span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">District-level Education Analytics</span>
                        </div>
                      </li>
                    </ul>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Hackathon Entry</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Karnataka Educational Innovation Challenge 2023</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Complaint Form Modal */}
        <ComplaintForm
          isOpen={isComplaintFormOpen}
          onClose={() => setIsComplaintFormOpen(false)}
        />

        {/* Alumni Connect Form Modal */}
        <AlumniConnectForm
          isOpen={isAlumniFormOpen}
          onClose={() => setIsAlumniFormOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
