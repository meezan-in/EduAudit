import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  Calendar, 
  MessageSquare, 
  Tag, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatTimeAgo, formatDate, t } from "@/lib/i18n";
import { STATUS_COLORS, COMPLAINT_STATUS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ComplaintDetailsProps {
  id: string;
}

export default function ComplaintDetails({ id }: ComplaintDetailsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch complaint details
  const { data: complaint, isLoading: complaintLoading } = useQuery({
    queryKey: [`/api/complaints/${id}`],
  });

  // Fetch complaint responses
  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: [`/api/complaints/${id}/responses`],
  });

  const isLoading = complaintLoading || responsesLoading;

  // Mutation for updating complaint status
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/complaints/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "The complaint status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/complaints/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message || "Please try again later",
      });
    }
  });

  // Function to handle response submission
  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast({
        variant: "destructive",
        title: "Empty response",
        description: "Please enter a response",
      });
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("POST", `/api/complaints/${id}/responses`, {
        response: response.trim(),
        complaintId: parseInt(id)
      });

      toast({
        title: "Response Submitted",
        description: "Your response has been submitted successfully",
      });

      setResponse("");
      queryClient.invalidateQueries({ queryKey: [`/api/complaints/${id}/responses`] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit response",
        description: "Please try again later",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get status icon based on complaint status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case COMPLAINT_STATUS.RESOLVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case COMPLAINT_STATUS.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case COMPLAINT_STATUS.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case COMPLAINT_STATUS.IN_PROGRESS:
        return <Loader2 className="h-5 w-5 text-blue-500" />;
      case COMPLAINT_STATUS.UNDER_REVIEW:
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => setLocation("/complaints")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to complaints
            </Button>
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-32 mb-8" />
            <Skeleton className="h-40 w-full mb-8" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => setLocation("/complaints")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to complaints
            </Button>
            <Card>
              <CardContent className="pt-6 pb-10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Complaint Not Found</h2>
                <p className="text-neutral-600 mb-6">
                  The complaint you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button 
                  onClick={() => setLocation("/complaints")}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  View All Complaints
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-24 sm:mb-0">
        <div className="px-4 sm:px-0">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setLocation("/complaints")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to complaints
          </Button>

          {/* Complaint header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-neutral-900">{complaint.title}</h1>
              <Badge 
                className={`${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].bg} ${STATUS_COLORS[complaint.status as keyof typeof STATUS_COLORS].text} flex items-center`}
              >
                {getStatusIcon(complaint.status)}
                <span className="ml-1">{t(complaint.status as any)}</span>
              </Badge>
            </div>
            <div className="flex items-center text-sm text-neutral-500 mt-2">
              <div className="flex items-center mr-4">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDate(complaint.createdAt)}
              </div>
              <div className="flex items-center mr-4">
                <Tag className="mr-1 h-4 w-4" />
                {complaint.category}
              </div>
              <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                Token: <span className="font-medium ml-1">{complaint.tokenId}</span>
              </div>
            </div>
          </div>

          {/* Complaint details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{complaint.description}</p>
              
              {complaint.evidence && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium mb-2">Evidence Attachments:</h4>
                  <div className="flex items-center p-2 bg-neutral-50 rounded border border-neutral-200">
                    <FileText className="h-5 w-5 text-neutral-400 mr-2" />
                    <span className="text-sm">{complaint.evidence}</span>
                  </div>
                </div>
              )}
              
              {complaint.aiAnalysis && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium mb-2">AI Analysis:</h4>
                  <div className="bg-accent-50 p-3 rounded-md text-sm">
                    <p><strong>Priority:</strong> {complaint.aiAnalysis.priority}</p>
                    {complaint.aiAnalysis.suggestedCategory && (
                      <p><strong>Suggested Category:</strong> {complaint.aiAnalysis.suggestedCategory}</p>
                    )}
                    {complaint.aiAnalysis.summary && (
                      <p><strong>Summary:</strong> {complaint.aiAnalysis.summary}</p>
                    )}
                    {complaint.aiAnalysis.keyIssues && complaint.aiAnalysis.keyIssues.length > 0 && (
                      <div>
                        <strong>Key Issues:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {complaint.aiAnalysis.keyIssues.map((issue: string, index: number) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status update buttons (for school admin and authority) */}
          {(user?.userType === "school" || user?.userType === "authority") && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.values(COMPLAINT_STATUS).map((status) => (
                    <Button
                      key={status}
                      onClick={() => updateStatus.mutate(status)}
                      disabled={complaint.status === status || updateStatus.isPending}
                      variant={complaint.status === status ? "default" : "outline"}
                      className={complaint.status === status ? "bg-primary-500 hover:bg-primary-500" : ""}
                    >
                      {getStatusIcon(status)}
                      <span className="ml-1">{t(status as any)}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responses/comments section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {responses && responses.length > 0 ? (
                <div className="space-y-6">
                  {responses.map((resp: any) => (
                    <div key={resp.id} className="flex space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {resp.userType.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {resp.userType === "student" ? "Student/Parent" : 
                             resp.userType === "school" ? "School Admin" : 
                             "Education Authority"}
                          </h4>
                          <span className="text-xs text-neutral-500">
                            {formatTimeAgo(resp.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">
                          {resp.response}
                        </p>
                        {resp.attachments && (
                          <div className="mt-2 flex items-center p-2 bg-neutral-50 rounded text-xs">
                            <FileText className="h-3 w-3 text-neutral-400 mr-1" />
                            {resp.attachments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-500">
                  No responses yet
                </div>
              )}

              {/* Add response form */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h4 className="text-sm font-medium mb-2">Add a response</h4>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[100px] mb-4"
                />
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={submitting || !response.trim()}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  {submitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
