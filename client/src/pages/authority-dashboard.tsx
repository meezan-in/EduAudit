import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { STATUS_COLORS, KARNATAKA_DISTRICTS, COMPLAINT_CATEGORIES } from "@/lib/constants";
import { formatDate, t } from "@/lib/i18n";
import { generateDistrictInsights } from "@/lib/openai";
import { 
  Building,
  BarChart2,
  FileText,
  Users,
  CheckCircle,
  Landmark,
  Map,
  School as SchoolIcon,
  Search,
  Filter
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

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Fetch all district stats
  const { data: districtStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/districts/stats'],
  });

  // Fetch complaints (all or filtered by district)
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints', selectedDistrict],
    queryFn: async () => {
      const url = selectedDistrict 
        ? `/api/complaints?district=${encodeURIComponent(selectedDistrict)}`
        : '/api/complaints';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      return response.json();
    }
  });

  // Fetch schools based on selected district
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['/api/schools', selectedDistrict],
    queryFn: async () => {
      const url = selectedDistrict 
        ? `/api/schools?district=${encodeURIComponent(selectedDistrict)}`
        : '/api/schools';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      return response.json();
    }
  });

  const isLoading = statsLoading || complaintsLoading || schoolsLoading;

  // Generate AI insights when a district is selected
  const fetchAiInsights = async (district: string) => {
    if (!districtStats) return;
    
    const stats = districtStats.find((d: any) => d.district === district);
    if (!stats) return;
    
    try {
      const insights = await generateDistrictInsights(district, stats);
      setAiInsights(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setAiInsights("Unable to generate insights at this time.");
    }
  };

  // Handle district change
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    fetchAiInsights(district);
  };

  // Get district performance data for charts
  const getDistrictPerformanceData = () => {
    if (!districtStats) return [];
    
    return districtStats.slice(0, 10).map((stats: any) => ({
      name: stats.district,
      total: stats.totalComplaints,
      resolved: stats.resolvedComplaints,
      pending: stats.pendingComplaints,
      resolution: stats.resolvedComplaints > 0 && stats.totalComplaints > 0
        ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)
        : 0
    }));
  };

  // Get category distribution data
  const getCategoryDistribution = () => {
    if (!complaints) return [];
    
    const categories: Record<string, number> = {};
    
    complaints.forEach((complaint: any) => {
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Get monthly trend data for selected district
  const getMonthlyTrendData = () => {
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

  // Get resolution rate comparison
  const getResolutionRateComparison = () => {
    if (!districtStats) return [];
    
    return districtStats.slice(0, 10).map((stats: any) => ({
      name: stats.district,
      rate: stats.resolvedComplaints > 0 && stats.totalComplaints > 0
        ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)
        : 0,
      avgTime: stats.avgResolutionTime || 0
    }));
  };

  const districtPerformanceData = getDistrictPerformanceData();
  const categoryDistributionData = getCategoryDistribution();
  const monthlyTrendData = getMonthlyTrendData();
  const resolutionRateData = getResolutionRateComparison();

  // Get overall statistics
  const getOverallStats = () => {
    if (!districtStats) return { 
      totalSchools: 0, 
      totalComplaints: 0, 
      resolvedComplaints: 0, 
      avgResolutionDays: 0 
    };
    
    const totalSchools = districtStats.reduce((sum, d: any) => sum + d.totalSchools, 0);
    const totalComplaints = districtStats.reduce((sum, d: any) => sum + d.totalComplaints, 0);
    const resolvedComplaints = districtStats.reduce((sum, d: any) => sum + d.resolvedComplaints, 0);
    
    // Calculate weighted average resolution time
    let weightedSum = 0;
    let totalResolved = 0;
    
    districtStats.forEach((d: any) => {
      if (d.resolvedComplaints > 0 && d.avgResolutionTime) {
        weightedSum += d.avgResolutionTime * d.resolvedComplaints;
        totalResolved += d.resolvedComplaints;
      }
    });
    
    const avgResolutionDays = totalResolved > 0 ? Math.round(weightedSum / totalResolved) : 0;
    
    return { totalSchools, totalComplaints, resolvedComplaints, avgResolutionDays };
  };

  const overallStats = getOverallStats();

  // Get selected district data
  const getSelectedDistrictData = () => {
    if (!districtStats || !selectedDistrict) return null;
    
    return districtStats.find((d: any) => d.district === selectedDistrict);
  };

  const selectedDistrictData = getSelectedDistrictData();

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
            <h1 className="text-2xl font-semibold text-neutral-900">Education Authority Dashboard</h1>
            <p className="text-neutral-600">
              Oversight of Karnataka schools, complaints, and performance metrics
            </p>
          </div>

          {/* District selector */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex-shrink-0 p-3 rounded-full bg-primary-100">
                  <Landmark className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user?.name}</h2>
                  <p className="text-neutral-500">Education Department, Karnataka</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="min-w-[200px]">
                    <Select onValueChange={handleDistrictChange} value={selectedDistrict || undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {KARNATAKA_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" /> 
                    More Filters
                  </Button>
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
                    <p className="text-sm text-neutral-500">Total Schools</p>
                    <h3 className="text-3xl font-bold">{overallStats.totalSchools}</h3>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-full">
                    <SchoolIcon className="h-6 w-6 text-neutral-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Total Complaints</p>
                    <h3 className="text-3xl font-bold">{overallStats.totalComplaints}</h3>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-full">
                    <FileText className="h-6 w-6 text-primary-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Resolved</p>
                    <h3 className="text-3xl font-bold">{overallStats.resolvedComplaints}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Avg. Resolution Time</p>
                    <h3 className="text-3xl font-bold">{overallStats.avgResolutionDays}</h3>
                    <p className="text-xs text-neutral-500">days</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard content */}
          <Tabs defaultValue="districts" className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="districts">District Analysis</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
              <TabsTrigger value="schools">Schools</TabsTrigger>
            </TabsList>
            
            {/* Districts Tab */}
            <TabsContent value="districts" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* District Performance Chart */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>District Performance</CardTitle>
                    <CardDescription>Complaint volume and resolution rates by district</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={districtPerformanceData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                          barGap={0}
                          barCategoryGap={8}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                          <YAxis fontSize={12} />
                          <RechartsTooltip 
                            formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : name === 'resolved' ? 'Resolved' : 'Pending']}
                            labelFormatter={(label) => `District: ${label}`}
                          />
                          <Bar dataKey="resolved" stackId="a" fill={CHART_COLORS[2]} name="Resolved" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" stackId="a" fill={CHART_COLORS[1]} name="Pending" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* District Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>District Details</CardTitle>
                    <CardDescription>
                      {selectedDistrict ? `Statistics for ${selectedDistrict}` : "Select a district to view details"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedDistrictData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-neutral-100 p-3 rounded-lg">
                            <h4 className="text-xs text-neutral-500">{t("schoolsCount")}</h4>
                            <p className="text-2xl font-bold">{selectedDistrictData.totalSchools}</p>
                          </div>
                          <div className="bg-neutral-100 p-3 rounded-lg">
                            <h4 className="text-xs text-neutral-500">{t("complaintsCount")}</h4>
                            <p className="text-2xl font-bold">{selectedDistrictData.totalComplaints}</p>
                          </div>
                          <div className="bg-green-100 p-3 rounded-lg">
                            <h4 className="text-xs text-green-700">{t("resolvedCount")}</h4>
                            <p className="text-2xl font-bold text-green-700">
                              {selectedDistrictData.resolvedComplaints}
                            </p>
                          </div>
                          <div className="bg-primary-100 p-3 rounded-lg">
                            <h4 className="text-xs text-primary-700">{t("avgResolutionTime")}</h4>
                            <p className="text-2xl font-bold text-primary-700">
                              {selectedDistrictData.avgResolutionTime} {t("days")}
                            </p>
                          </div>
                        </div>
                        
                        {/* Top categories */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t("topCategories")}</h4>
                          {selectedDistrictData.topCategories && selectedDistrictData.topCategories.length > 0 ? (
                            <div>
                              {selectedDistrictData.topCategories.map((cat: any, index: number) => (
                                <div key={index} className="mb-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm">{cat.category}</span>
                                    <span className="text-xs text-neutral-500">{cat.count} complaints</span>
                                  </div>
                                  <Progress 
                                    value={Math.round((cat.count / selectedDistrictData.totalComplaints) * 100)} 
                                    className="h-2"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-500">No category data available</p>
                          )}
                        </div>
                        
                        {/* AI insights */}
                        {aiInsights && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">AI Insights</h4>
                            <ScrollArea className="h-24 rounded-md border p-2 bg-accent-50 text-sm">
                              {aiInsights}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-60">
                        <div className="text-center">
                          <Map className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                          <p className="text-neutral-500">Select a district to view detailed statistics</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Resolution Rate Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resolution Rate Comparison</CardTitle>
                    <CardDescription>Performance metrics across districts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={resolutionRateData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                          <YAxis 
                            yAxisId="left" 
                            domain={[0, 100]} 
                            label={{ value: 'Resolution Rate (%)', angle: -90, position: 'insideLeft' }} 
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            label={{ value: 'Avg. Days', angle: 90, position: 'insideRight' }} 
                          />
                          <RechartsTooltip />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="rate" 
                            stroke={CHART_COLORS[0]} 
                            name="Resolution Rate (%)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="avgTime" 
                            stroke={CHART_COLORS[2]} 
                            name="Avg. Resolution Time (days)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Monthly Trend for Selected District */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedDistrict ? `${selectedDistrict} Trend` : "Monthly Trend"}
                    </CardTitle>
                    <CardDescription>
                      {selectedDistrict 
                        ? `Complaint trends for ${selectedDistrict} district` 
                        : "Statewide complaint trends"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyTrendData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                          barGap={0}
                          barCategoryGap={8}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis fontSize={12} />
                          <RechartsTooltip 
                            formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : 'Resolved']}
                          />
                          <Bar dataKey="total" fill={CHART_COLORS[0]} name="Total" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="resolved" fill={CHART_COLORS[3]} name="Resolved" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Complaints Tab */}
            <TabsContent value="complaints" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Complaints List */}
                <Card className="col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Complaint Management</CardTitle>
                        <CardDescription>
                          {selectedDistrict 
                            ? `Showing complaints from ${selectedDistrict} district` 
                            : "All complaints across Karnataka"}
                        </CardDescription>
                      </div>
                      <Link href="/complaints">
                        <Button>View All</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {complaints && complaints.length > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>School</TableHead>
                              <TableHead>District</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Token ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {complaints.slice(0, 10).map((complaint: any) => (
                              <TableRow key={complaint.id}>
                                <TableCell className="font-medium">
                                  <Link href={`/complaints/${complaint.id}`}>
                                    <a className="text-accent-500 hover:underline">
                                      {complaint.title}
                                    </a>
                                  </Link>
                                </TableCell>
                                <TableCell>{complaint.schoolName || "Unknown School"}</TableCell>
                                <TableCell>{complaint.district}</TableCell>
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
                        <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                        <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                        <p className="mb-4">
                          {selectedDistrict 
                            ? `No complaints from ${selectedDistrict} district` 
                            : "No complaints across all districts"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Categories</CardTitle>
                    <CardDescription>
                      {selectedDistrict 
                        ? `Category distribution in ${selectedDistrict}` 
                        : "Statewide category distribution"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryDistributionData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryDistributionData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="45%"
                              outerRadius={80}
                              fill="#8884d8"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {categoryDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend layout="vertical" verticalAlign="bottom" align="center" />
                            <RechartsTooltip formatter={(value) => [value, 'Complaints']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-60">
                        <div className="text-center">
                          <p className="text-neutral-500">No category data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Category-wise Status */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Category-wise Resolution Status</CardTitle>
                  <CardDescription>Performance metrics for each complaint category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COMPLAINT_CATEGORIES.map((category) => {
                      if (!complaints) return null;
                      
                      const categoryComplaints = complaints.filter((c: any) => c.category === category);
                      if (categoryComplaints.length === 0) return null;
                      
                      const totalCount = categoryComplaints.length;
                      const resolvedCount = categoryComplaints.filter((c: any) => c.status === "resolved").length;
                      const pendingCount = categoryComplaints.filter((c: any) => c.status === "pending").length;
                      const inProgressCount = categoryComplaints.filter((c: any) => c.status === "in_progress").length;
                      const underReviewCount = categoryComplaints.filter((c: any) => c.status === "under_review").length;
                      
                      const resolvedPercentage = Math.round((resolvedCount / totalCount) * 100);
                      
                      return (
                        <div key={category} className="bg-neutral-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{category}</h4>
                            <Badge variant="outline" className="ml-2">{totalCount} total</Badge>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-neutral-500 mb-1">
                              <span>Resolution Rate</span>
                              <span>{resolvedPercentage}%</span>
                            </div>
                            <Progress value={resolvedPercentage} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 mr-2">
                                {resolvedCount}
                              </Badge>
                              <span>Resolved</span>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mr-2">
                                {pendingCount}
                              </Badge>
                              <span>Pending</span>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 mr-2">
                                {inProgressCount}
                              </Badge>
                              <span>In Progress</span>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 mr-2">
                                {underReviewCount}
                              </Badge>
                              <span>Under Review</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Schools Tab */}
            <TabsContent value="schools" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>School Management</CardTitle>
                      <CardDescription>
                        {selectedDistrict 
                          ? `Showing schools in ${selectedDistrict} district` 
                          : "Schools across Karnataka"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {schools && schools.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>School Name</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Complaints</TableHead>
                            <TableHead>Resolution Rate</TableHead>
                            <TableHead className="text-right">Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schools.map((school: any) => {
                            // Get complaints for this school
                            const schoolComplaints = complaints?.filter((c: any) => c.schoolId === school.id) || [];
                            const totalComplaints = schoolComplaints.length;
                            const resolvedComplaints = schoolComplaints.filter((c: any) => c.status === "resolved").length;
                            const resolutionRate = totalComplaints > 0 
                              ? Math.round((resolvedComplaints / totalComplaints) * 100) 
                              : 0;
                            
                            return (
                              <TableRow key={school.id}>
                                <TableCell className="font-medium">
                                  {school.name}
                                </TableCell>
                                <TableCell>{school.district}</TableCell>
                                <TableCell>{school.category}</TableCell>
                                <TableCell>{totalComplaints}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Progress value={resolutionRate} className="h-2 w-24 mr-2" />
                                    <span className="text-sm">{resolutionRate}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {school.contactPhone || "N/A"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-500">
                      <Building className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">No schools found</h3>
                      <p className="mb-4">
                        {selectedDistrict 
                          ? `No schools found in ${selectedDistrict} district` 
                          : "No schools found across all districts"}
                      </p>
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
