import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search,
  Filter,
  Tag,
  MessageSquare,
  Calendar
} from "lucide-react";
import { formatTimeAgo, t } from "@/lib/i18n";
import { STATUS_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

// TypeScript type for complaints
interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  tokenId: string;
  createdAt: string;
  updatedAt?: string;
  userId: number;
  schoolId: number;
  district: string;
}

export default function ComplaintList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch complaints
  const { data: complaints, isLoading, error } = useQuery<Complaint[]>({
    queryKey: ['/api/complaints'],
  });

  // Filter complaints based on search query and active tab
  const filteredComplaints = complaints?.filter((complaint) => {
    // Filter by search query
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          complaint.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          complaint.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && complaint.status !== "resolved") ||
                      (activeTab === "resolved" && complaint.status === "resolved");
    
    return matchesSearch && matchesTab;
  });

  // Get icon component for category
  const getCategoryIcon = (category: string): LucideIcon => {
    const iconName = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "help-circle";
    
    // @ts-ignore - Dynamically importing Lucide icons
    const LucideIconComponent = require("lucide-react")[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    return LucideIconComponent || Search;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Failed to load complaints</h3>
            <p className="text-neutral-600">Please try again later</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative rounded-md shadow-sm flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, token ID or category..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredComplaints?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No complaints found</h3>
              <p className="text-neutral-600">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "You don't have any complaints yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints?.map((complaint) => (
            <Card 
              key={complaint.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setLocation(`/complaints/${complaint.id}`)}
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-accent-500 truncate">
                        {complaint.title}
                      </h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        <Badge 
                          variant="secondary"
                          className={`${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].bg} ${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].text}`}
                        >
                          {t(complaint.status as any)}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-neutral-400" />
                      <span className="text-sm text-neutral-500">
                        {formatTimeAgo(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="flex space-x-4">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex items-center">
                                {getCategoryIcon(complaint.category) && 
                                  React.createElement(getCategoryIcon(complaint.category), {
                                    className: "h-4 w-4 mr-1 text-neutral-400"
                                  })
                                }
                                {complaint.category}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Category: {complaint.category}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center text-sm text-neutral-500">
                        <MessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                        {/* This would come from API responses count */}
                        {Math.floor(Math.random() * 5)} responses
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Token: <span className="font-medium">{complaint.tokenId}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
