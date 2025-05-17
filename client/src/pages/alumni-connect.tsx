import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AlumniList from "@/components/alumni/AlumniList";
import AlumniConnectForm from "@/components/alumni/AlumniConnectForm";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Users } from "lucide-react";
import { formatTimeAgo, t } from "@/lib/i18n";

export default function AlumniConnect() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['/api/connections'],
  });

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase() || "U";
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-24 sm:mb-0">
        {/* Header section */}
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">{t("alumniConnect")}</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Connect with alumni for guidance and mentorship
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Users className="mr-2 h-4 w-4" /> {t("connectAlumni")}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-8 px-4 sm:px-0">
          <Tabs defaultValue="alumni">
            <TabsList className="mb-4">
              <TabsTrigger value="alumni">Browse Alumni</TabsTrigger>
              <TabsTrigger value="connections">My Connections</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alumni">
              <AlumniList />
            </TabsContent>
            
            <TabsContent value="connections">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(null).map((_, i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : (
                <>
                  {connections && connections.length > 0 ? (
                    <div className="space-y-4">
                      {connections.map((connection: any) => (
                        <Card key={connection.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{connection.questionTitle}</CardTitle>
                              <Badge 
                                variant={connection.status === "pending" ? "secondary" : 
                                         connection.status === "accepted" ? "default" : "outline"}
                                className={connection.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                           connection.status === "accepted" ? "bg-green-100 text-green-800" : ""}
                              >
                                {connection.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-neutral-500 mt-1">
                              <Badge variant="outline" className="mr-2">
                                {connection.category}
                              </Badge>
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatTimeAgo(connection.createdAt)}
                              {connection.isPublic && (
                                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-neutral-700 mb-4">
                              {connection.questionDetails}
                            </p>
                            
                            {/* Responses section */}
                            <div className="mt-4 pt-4 border-t border-neutral-200">
                              <div className="flex items-center mb-2">
                                <MessageSquare className="h-4 w-4 mr-2 text-neutral-500" />
                                <h4 className="text-sm font-medium">Responses</h4>
                              </div>
                              
                              {connection.responses && connection.responses.length > 0 ? (
                                <div className="space-y-3">
                                  {connection.responses.map((resp: any) => (
                                    <div key={resp.id} className="flex space-x-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {getInitials(resp.alumniName || "Alumni")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-xs text-neutral-500">
                                          {formatTimeAgo(resp.createdAt)}
                                        </p>
                                        <p className="text-sm">{resp.response}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-neutral-500">No responses yet</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No connections yet</h3>
                        <p className="text-neutral-600 mb-6">
                          Connect with alumni to get guidance and mentorship
                        </p>
                        <Button 
                          onClick={() => setIsFormOpen(true)}
                          className="bg-primary-500 hover:bg-primary-600"
                        >
                          {t("connectAlumni")}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Alumni connect form modal */}
        <AlumniConnectForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
