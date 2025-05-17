import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { STATUS_COLORS, COMPLAINT_CATEGORIES } from "@/lib/constants";
import { formatTimeAgo, formatDate } from "@/lib/i18n";
import { 
  Building,
  Clock,
  FileText,
  Users,
  CheckCircle,
  Loader2,
  Search,
  School as SchoolIcon
} from "lucide-react";
import { Link } from "wouter";

// Chart colors
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function SchoolDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch school's complaints
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });

  // Fetch alumni for the school
  const { data: alumni, isLoading: alumniLoading } = useQuery({
    queryKey: ['/api/alumni'],
  });

  const isLoading = complaintsLoading || alumniLoading;

  // Get complaint statistics
  const getComplaintStats = () => {
    if (!complaints) return { total: 0, resolved: 0, pending: 0, inProgress: 0, underReview: 0 };
    
    const total = complaints.length;
    const resolved = complaints.filter((c: any) => c.status === "resolved").length;
    const pending = complaints.filter((c: any) => c.status === "pending").length;
    const inProgress = complaints.filter((c: any) => c.status === "in_progress").length;
    const underReview = complaints.filter((c: any) => c.status === "under_review").length;
    
    return { total, resolved, pending, inProgress, underReview };
  };

  // Get category distribution data for charts
  const getCategoryData = () => {
    if (!complaints) return [];
    
    const categories: Record<string, number> = {};
    
    complaints.forEach((complaint: any) => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Get monthly data for trend chart
  const getMonthlyData = () => {
    if (!complaints) return [];
    
    const months: Record<string, { total: number, resolved: number }> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      months[monthName] = { total: 0, resolved: 0 };
    }
    
    complaints.forEach((complaint: any) => {
      const date = new Date(complaint.createdAt);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (months[monthName]) {
        months[monthName].total += 1;
        if (complaint.status === "resolved") {
          months[monthName].resolved += 1;
        }
      }
    });
    
    return Object.entries(months).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
    }));
  };

  const stats = getComplaintStats();
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase() || "A";
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-6" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array(4).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-24 sm:mb-0">
        <div className="px-4 sm:px-0">
          {/* Dashboard header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900">School Administrator Dashboard</h1>
            <p className="text-neutral-600">
              Manage complaints, alumni connections and monitor school performance
            </p>
          </div>

          {/* School Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-full bg-primary-100">
                  <SchoolIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">{user?.schoolName}</h2>
                  <p className="text-neutral-500">{user?.district} District</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-secondary-100 text-secondary-800">Administrator</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Total Complaints</p>
                    <h3 className="text-3xl font-bold">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-full">
                    <FileText className="h-6 w-6 text-neutral-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Pending</p>
                    <h3 className="text-3xl font-bold">{stats.pending}</h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">In Progress</p>
                    <h3 className="text-3xl font-bold">{stats.inProgress}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Loader2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Resolved</p>
                    <h3 className="text-3xl font-bold">{stats.resolved}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Trends</CardTitle>
                    <CardDescription>Monthly complaints and resolution rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                          barGap={0}
                          barCategoryGap={8}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip 
                            formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : 'Resolved']}
                          />
                          <Bar dataKey="total" fill={CHART_COLORS[0]} name="Total" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="resolved" fill={CHART_COLORS[3]} name="Resolved" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Categories</CardTitle>
                    <CardDescription>Distribution by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend layout="vertical" verticalAlign="bottom" align="center" />
                          <Tooltip formatter={(value) => [value, 'Complaints']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Resolution Progress */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Resolution Progress</CardTitle>
                  <CardDescription>Status breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {COMPLAINT_CATEGORIES.map((category) => {
                    const categoryComplaints = complaints?.filter((c: any) => c.category === category) || [];
                    const resolvedCount = categoryComplaints.filter((c: any) => c.status === "resolved").length;
                    const totalCount = categoryComplaints.length;
                    const percentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
                    
                    return totalCount > 0 ? (
                      <div key={category} className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium">{category}</h4>
                          <span className="text-sm text-neutral-500">{resolvedCount}/{totalCount}</span>
                        </div>
                        <div className="flex items-center">
                          <Progress value={percentage} className="h-2.5 flex-1 mr-4" />
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest complaints and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {complaints && complaints.length > 0 ? (
                    <div className="space-y-4">
                      {complaints.slice(0, 5).map((complaint: any) => (
                        <div key={complaint.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-md">
                          <div className={`p-2 rounded-full ${STATUS_COLORS[complaint.status].bg}`}>
                            {complaint.status === "resolved" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : complaint.status === "in_progress" ? (
                              <Loader2 className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <Link href={`/complaints/${complaint.id}`}>
                                <a className="text-sm font-medium text-accent-500 hover:underline">
                                  {complaint.title}
                                </a>
                              </Link>
                              <span className="text-xs text-neutral-500">
                                {formatTimeAgo(complaint.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {complaint.category} - Token: {complaint.tokenId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-neutral-500">
                      No recent activity
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Complaints Tab */}
            <TabsContent value="complaints" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>All Complaints</CardTitle>
                      <CardDescription>Manage and respond to student complaints</CardDescription>
                    </div>
                    <Link href="/complaints">
                      <Button>View All Complaints</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {complaints && complaints.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Token ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaints.map((complaint: any) => (
                            <TableRow key={complaint.id}>
                              <TableCell className="font-medium">
                                <Link href={`/complaints/${complaint.id}`}>
                                  <a className="text-accent-500 hover:underline">
                                    {complaint.title}
                                  </a>
                                </Link>
                              </TableCell>
                              <TableCell>{complaint.category}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  className={`${STATUS_COLORS[complaint.status].bg} ${STATUS_COLORS[complaint.status].text}`}
                                >
                                  {complaint.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                              <TableCell className="text-right">{complaint.tokenId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-500">
                      No complaints to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Alumni Tab */}
            <TabsContent value="alumni" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>School Alumni</CardTitle>
                      <CardDescription>Former students available for mentorship</CardDescription>
                    </div>
                    <Button>Add Alumni</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {alumni && alumni.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {alumni.map((alum: any) => (
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
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-500">
                      <Users className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">No alumni registered</h3>
                      <p className="mb-4">Invite former students to register as alumni mentors</p>
                      <Button>Invite Alumni</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
