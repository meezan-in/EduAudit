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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { Bot, Upload } from "lucide-react";
import { t } from "@/lib/i18n";
import { analyzeComplaintWithAI } from "@/lib/openai";

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplaintForm({ isOpen, onClose }: ComplaintFormProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Form schema
  const formSchema = z.object({
    category: z.string().min(1, { message: "Please select a category" }),
    title: z.string().min(5, { 
      message: "Title must be at least 5 characters" 
    }).max(100, { 
      message: "Title must not exceed 100 characters" 
    }),
    description: z.string().min(20, { 
      message: "Description must be at least 20 characters" 
    }).max(500, { 
      message: "Description must not exceed 500 characters" 
    }),
    evidence: z.string().optional(),
  });

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      evidence: "",
    },
  });

  // Mutation for submitting complaints
  const submitComplaint = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/complaints", {
        ...data,
        aiAnalysis
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been successfully submitted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] });
      onClose();
      form.reset();
      setAiAnalysis(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit complaint",
        description: error.message || "Please try again later",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    submitComplaint.mutate(values);
  };

  // AI analysis handler
  const handleAIAnalysis = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    const category = form.getValues("category");
    
    if (!title || !description) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter both title and description for AI analysis",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeComplaintWithAI(title, description, category);
      setAiAnalysis(analysis);
      
      // Update category if provided by AI and none selected by user
      if (analysis.suggestedCategory && !category) {
        form.setValue("category", analysis.suggestedCategory);
      }
      
      toast({
        title: "AI Analysis Complete",
        description: `Priority: ${analysis.priority}, Category: ${analysis.suggestedCategory}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not analyze complaint. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("newComplaint")}</DialogTitle>
          <DialogDescription>
            Submit a new complaint about educational facilities or services
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPLAINT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`${category.toLowerCase().replace(/\s+/g, '')}Category` as any)}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of the issue" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide detailed information about your complaint" 
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
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("uploadEvidence")}</FormLabel>
                  <FormControl>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-accent-600 hover:text-accent-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file.name);
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-neutral-50 p-4 rounded-md">
              <div className="text-xs text-neutral-500 mb-2">
                <span className="font-medium">AI Assistant:</span> {t("aiAssistant")}
              </div>
              <Button
                type="button"
                onClick={handleAIAnalysis}
                className="bg-primary-500 hover:bg-primary-600 text-white flex items-center"
                disabled={isAnalyzing}
              >
                <Bot className="mr-2 h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : t("analyzeWithAi")}
              </Button>
              
              {aiAnalysis && (
                <div className="mt-3 text-sm border border-primary-200 bg-primary-50 p-3 rounded">
                  <p><strong>Priority:</strong> {aiAnalysis.priority}</p>
                  <p><strong>Suggested Category:</strong> {aiAnalysis.suggestedCategory}</p>
                  {aiAnalysis.summary && (
                    <p><strong>Summary:</strong> {aiAnalysis.summary}</p>
                  )}
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
                disabled={submitComplaint.isPending}
                className="bg-accent-500 hover:bg-accent-600"
              >
                {submitComplaint.isPending ? "Submitting..." : t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
