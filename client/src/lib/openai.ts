import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

type ComplaintAnalysisResult = {
  priority: "high" | "medium" | "low";
  suggestedCategory: string;
  sentiment: string;
  keyIssues: string[];
  recommendedActions: string[];
  summary: string;
};

type AlumniMatchResult = {
  suggestedAlumni: number[];
  relevanceScores: Record<number, number>;
  recommendedExpertiseAreas: string[];
  queryClassification: string;
};

/**
 * Analyzes a complaint using AI to determine priority, category, and recommended actions
 */
export async function analyzeComplaintWithAI(
  title: string,
  description: string,
  category: string
): Promise<ComplaintAnalysisResult> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-complaint", {
      title,
      description,
      category,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing complaint with AI:", error);
    // Return a fallback analysis if AI fails
    return {
      priority: "medium",
      suggestedCategory: category,
      sentiment: "neutral",
      keyIssues: ["Unable to analyze with AI"],
      recommendedActions: ["Manual review required"],
      summary: "AI analysis unavailable. Please review manually."
    };
  }
}

/**
 * Finds the best alumni matches for a student's question
 */
export async function findAlumniMatchesWithAI(
  questionTitle: string,
  questionDetails: string,
  category: string
): Promise<AlumniMatchResult> {
  try {
    const response = await apiRequest("POST", "/api/ai/find-alumni-matches", {
      questionTitle,
      questionDetails,
      category,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error finding alumni matches with AI:", error);
    // Return empty results if AI fails
    return {
      suggestedAlumni: [],
      relevanceScores: {},
      recommendedExpertiseAreas: [],
      queryClassification: category
    };
  }
}

/**
 * Generates insights for district-level data
 */
export async function generateDistrictInsights(
  districtName: string, 
  statsData: any
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/district-insights", {
      districtName,
      statsData
    });
    
    const data = await response.json();
    return data.insights;
  } catch (error) {
    console.error("Error generating district insights with AI:", error);
    return "District insights are currently unavailable. Please check back later.";
  }
}

/**
 * Translates text between English and Kannada
 */
export async function translateText(
  text: string, 
  targetLanguage: "en" | "kn"
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/translate", {
      text,
      targetLanguage
    });
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error translating text with AI:", error);
    return text; // Return original text if translation fails
  }
}
