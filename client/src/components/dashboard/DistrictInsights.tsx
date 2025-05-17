import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t } from "@/lib/i18n";
import { generateDistrictInsights } from "@/lib/openai";

interface DistrictStatsType {
  id: number;
  district: string;
  totalSchools: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTime: number;
  topCategories: { category: string; count: number }[];
  updatedAt: string;
}

// Chart colors
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function DistrictInsights() {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Fetch district statistics
  const { data: districtStats, isLoading } = useQuery<DistrictStatsType[]>({
    queryKey: ['/api/districts/stats'],
  });

  // Generate AI insights when district is selected
  useEffect(() => {
    if (selectedDistrict && districtStats) {
      const districtData = districtStats.find(
        (stats) => stats.district === selectedDistrict
      );
      
      if (districtData) {
        generateDistrictInsights(selectedDistrict, districtData)
          .then((insights) => {
            setAiInsights(insights);
          })
          .catch((error) => {
            console.error("Error generating AI insights:", error);
            setAiInsights("Unable to generate insights at this time.");
          });
      }
    }
  }, [selectedDistrict, districtStats]);

  // Handle district selection
  const handleDistrictClick = (district: string) => {
    setSelectedDistrict(district);
  };

  // Prepare data for the bar chart
  const getBarChartData = () => {
    if (!districtStats) return [];
    
    return districtStats.slice(0, 10).map((stats) => ({
      name: stats.district,
      total: stats.totalComplaints,
      resolved: stats.resolvedComplaints,
      pending: stats.pendingComplaints,
    }));
  };

  // Prepare data for the pie chart
  const getPieChartData = () => {
    if (!districtStats || !selectedDistrict) return [];
    
    const districtData = districtStats.find(
      (stats) => stats.district === selectedDistrict
    );
    
    if (!districtData || !districtData.topCategories) return [];
    
    return districtData.topCategories.map((cat) => ({
      name: cat.category,
      value: cat.count,
    }));
  };

  // Get district-specific data
  const getSelectedDistrictData = () => {
    if (!districtStats || !selectedDistrict) return null;
    
    return districtStats.find(
      (stats) => stats.district === selectedDistrict
    );
  };

  const selectedData = getSelectedDistrictData();
  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{t("districtInsights")}</CardTitle>
        <CardDescription>
          View complaint statistics across Karnataka districts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Bar chart */}
          <div className="col-span-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  barGap={0}
                  barCategoryGap={8}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      handleDistrictClick(data.activePayload[0].payload.name);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'total' ? 'Total Complaints' : name === 'resolved' ? 'Resolved' : 'Pending']}
                    labelFormatter={(label) => `District: ${label}`}
                  />
                  <Bar dataKey="resolved" stackId="a" fill={CHART_COLORS[2]} name="Resolved" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill={CHART_COLORS[1]} name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-neutral-500 mt-2">
              Click on any district to view detailed insights
            </p>
          </div>
          
          {/* Right side - District details */}
          <div className="col-span-1">
            {selectedData ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedData.district}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-100 p-3 rounded-lg">
                    <h4 className="text-xs text-neutral-500">{t("schoolsCount")}</h4>
                    <p className="text-2xl font-bold">{selectedData.totalSchools}</p>
                  </div>
                  <div className="bg-neutral-100 p-3 rounded-lg">
                    <h4 className="text-xs text-neutral-500">{t("complaintsCount")}</h4>
                    <p className="text-2xl font-bold">{selectedData.totalComplaints}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <h4 className="text-xs text-green-700">{t("resolvedCount")}</h4>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedData.resolvedComplaints}
                    </p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <h4 className="text-xs text-primary-700">{t("avgResolutionTime")}</h4>
                    <p className="text-2xl font-bold text-primary-700">
                      {selectedData.avgResolutionTime} {t("days")}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">{t("topCategories")}</h4>
                  <div className="h-[200px]">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend layout="vertical" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-500">No category data available</p>
                      </div>
                    )}
                  </div>
                </div>

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
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-neutral-500">Select a district to view detailed insights</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
