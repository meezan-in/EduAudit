import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import AlumniConnectForm from "@/components/alumni/AlumniConnectForm";
import { EXPERTISE_ICONS } from "@/lib/constants";

// TypeScript type for alumni
interface Alumni {
  id: number;
  userId: number;
  schoolId: number;
  graduationYear: number;
  currentOccupation: string;
  organization: string;
  expertiseAreas: string[];
  bio: string;
  isAvailableForMentoring: boolean;
  createdAt: string;
  user?: {
    name: string;
    profilePicture: string;
  };
}

export default function AlumniList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch alumni
  const { data: alumni, isLoading, error } = useQuery<Alumni[]>({
    queryKey: ['/api/alumni'],
  });

  // Filter alumni based on search query
  const filteredAlumni = alumni?.filter((alum) => {
    return (
      alum.currentOccupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.expertiseAreas.some(area => 
        area.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      alum.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle mentorship request
  const handleRequestMentorship = (alumniId: number) => {
    setSelectedAlumniId(alumniId);
    setIsFormOpen(true);
  };

  // Get icon for expertise area
  const getExpertiseIcon = (area: string) => {
    // @ts-ignore - We're dynamically importing icons
    const iconName = EXPERTISE_ICONS[area as keyof typeof EXPERTISE_ICONS] || "tag";
    
    try {
      // @ts-ignore - Dynamically importing Lucide icons
      const LucideIcon = require("lucide-react")[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
      return LucideIcon ? <LucideIcon className="h-3 w-3" /> : null;
    } catch (e) {
      return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Failed to load alumni</h3>
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative rounded-md shadow-sm flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, occupation, organization or expertise..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {filteredAlumni?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No alumni found</h3>
              <p className="text-neutral-600">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "There are no alumni registered yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlumni?.map((alum) => (
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
                    <p className="text-xs text-neutral-400">
                      {alum.organization || "Independent"} · Class of {alum.graduationYear}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {alum.expertiseAreas.slice(0, 3).map((area, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                            {getExpertiseIcon(area)} {area}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expertise: {area}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {alum.expertiseAreas.length > 3 && (
                    <Badge variant="outline" className="text-neutral-500">
                      +{alum.expertiseAreas.length - 3} more
                    </Badge>
                  )}
                </div>
                
                {alum.bio && (
                  <p className="mt-3 text-xs text-neutral-600 line-clamp-3">
                    {alum.bio}
                  </p>
                )}
              </CardContent>
              
              <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-3">
                <Button 
                  onClick={() => handleRequestMentorship(alum.id)}
                  variant="ghost"
                  className="w-full text-center text-sm font-medium text-accent-500 hover:text-accent-600 hover:bg-accent-50"
                  disabled={!alum.isAvailableForMentoring}
                >
                  {t("requestMentorship")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Alumni Connect Form Dialog */}
      {isFormOpen && (
        <AlumniConnectForm 
          isOpen={isFormOpen} 
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAlumniId(null);
          }}
          alumniId={selectedAlumniId || undefined}
        />
      )}
    </div>
  );
}
