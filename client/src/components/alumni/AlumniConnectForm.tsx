import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ALUMNI_EXPERTISE_AREAS } from "@/lib/constants";
import { Bot } from "lucide-react";
import { t } from "@/lib/i18n";
import { findAlumniMatchesWithAI } from "@/lib/openai";

interface AlumniConnectFormProps {
  isOpen: boolean;
  onClose: () => void;
  alumniId?: number;
}

export default function AlumniConnectForm({ isOpen, onClose, alumniId }: AlumniConnectFormProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMatches, setAiMatches] = useState<any>(null);

  // Form schema
  const formSchema = z.object({
    alumniId: z.number().optional(),
    category: z.string().min(1, { message: "Please select a field of interest" }),
    questionTitle: z.string().min(5, { 
      message: "Question title must be at least 5 characters" 
    }).max(100, { 
      message: "Question title must not exceed 100 characters" 
    }),
    questionDetails: z.string().min(20, { 
      message: "Question details must be at least 20 characters" 
    }).max(500, { 
      message: "Question details must not exceed 500 characters" 
    }),
    isPublic: z.boolean().default(false),
  });

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alumniId: alumniId,
      category: "",
      questionTitle: "",
      questionDetails: "",
      isPublic: false,
    },
  });

  // Fetch alumni data for dropdown
  const { data: alumni } = useQuery({
    queryKey: ['/api/alumni'],
    queryFn: async () => {
      const response = await fetch('/api/alumni');
      if (!response.ok) {
        throw new Error('Failed to fetch alumni');
      }
      return response.json();
    },
    enabled: !alumniId, // Only fetch if alumniId is not provided
  });

  // Mutation for submitting connection request
  const submitConnectionRequest = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/connections", {
        ...data,
        aiRecommendation: aiMatches
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection Request Submitted",
        description: "Your connection request has been successfully sent to the alumni",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      onClose();
      form.reset();
      setAiMatches(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit connection request",
        description: error.message || "Please try again later",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    submitConnectionRequest.mutate(values);
  };

  // AI matching handler
  const handleAIMatching = async () => {
    const title = form.getValues("questionTitle");
    const details = form.getValues("questionDetails");
    const category = form.getValues("category");
    
    if (!title || !details) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter both title and details for AI matching",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const matches = await findAlumniMatchesWithAI(title, details, category);
      setAiMatches(matches);
      
      // Update alumniId if AI suggested one and none selected by user
      if (matches.suggestedAlumni?.length > 0 && !form.getValues("alumniId")) {
        form.setValue("alumniId", matches.suggestedAlumni[0]);
      }
      
      // Update category if AI recommended one and none selected by user
      if (matches.recommendedExpertiseAreas?.length > 0 && !category) {
        form.setValue("category", matches.recommendedExpertiseAreas[0]);
      }
      
      toast({
        title: "AI Matching Complete",
        description: `Found ${matches.suggestedAlumni?.length || 0} relevant alumni for your question`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Matching Failed",
        description: "Could not find matches. Please try again or select manually.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("connectAlumni")}</DialogTitle>
          <DialogDescription>
            Connect with alumni for guidance and mentorship
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!alumniId && (
              <FormField
                control={form.control}
                name="alumniId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Alumni</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an alumni to connect with" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alumni?.map((alum: any) => (
                          <SelectItem key={alum.id} value={alum.id.toString()}>
                            {alum.userId} - {alum.currentOccupation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fieldOfInterest")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field of interest" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALUMNI_EXPERTISE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="questionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("questionTitle")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of your question" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="questionDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("questionDetails")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide detailed information about your question or guidance you're seeking" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("makePublic")}
                    </FormLabel>
                    <FormDescription>
                      {t("makePublicDescription")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="bg-neutral-50 p-4 rounded-md">
              <div className="text-xs text-neutral-500 mb-2">
                <span className="font-medium">AI Assistant:</span> I can help connect you with the most relevant alumni based on your question. I'll analyze your query and suggest the best matches.
              </div>
              <Button
                type="button"
                onClick={handleAIMatching}
                className="bg-primary-500 hover:bg-primary-600 text-white flex items-center"
                disabled={isAnalyzing}
              >
                <Bot className="mr-2 h-4 w-4" />
                {isAnalyzing ? "Finding matches..." : t("findMatchesWithAi")}
              </Button>
              
              {aiMatches && (
                <div className="mt-3 text-sm border border-primary-200 bg-primary-50 p-3 rounded">
                  <p><strong>Suggested Alumni:</strong> {aiMatches.suggestedAlumni?.length || 0} matches found</p>
                  <p><strong>Recommended Areas:</strong> {aiMatches.recommendedExpertiseAreas?.join(", ")}</p>
                  <p><strong>Query Classification:</strong> {aiMatches.queryClassification}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-3 sm:mt-0"
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={submitConnectionRequest.isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {submitConnectionRequest.isPending ? "Submitting..." : t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
