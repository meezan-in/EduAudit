import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
});

/**
 * Analyzes a complaint using AI to determine priority, category, and recommended actions
 */
export async function analyzeComplaint(
  title: string,
  description: string,
  category: string
): Promise<any> {
  try {
    const prompt = `
    You are an AI assistant for Karnataka's education department. Analyze this educational complaint:
    
    Title: ${title}
    Description: ${description}
    Category: ${category}
    
    Provide the following analysis in JSON format:
    1. priority: Determine the priority level (high, medium, or low) based on urgency and impact
    2. suggestedCategory: Suggest the most appropriate category based on content (use the original if correct)
    3. sentiment: Analyze the sentiment (negative, neutral, positive)
    4. keyIssues: List up to 3 key issues identified
    5. recommendedActions: Suggest up to 3 recommended actions for Karnataka education officials
    6. summary: A brief one-sentence summary
    
    Format the response as valid JSON.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Return a default response if API call fails
    return {
      priority: "medium",
      suggestedCategory: category,
      sentiment: "neutral",
      keyIssues: ["Could not analyze with AI"],
      recommendedActions: ["Manual review required"],
      summary: "AI analysis unavailable"
    };
  }
}

/**
 * Find the best alumni matches for a student's question
 */
export async function findAlumniMatches(
  questionTitle: string,
  questionDetails: string,
  category: string,
  availableAlumni: any[]
): Promise<any> {
  try {
    // Create a string representation of available alumni
    const alumniText = availableAlumni.map(alumni => 
      `Alumni ID: ${alumni.id}, Expertise: ${alumni.expertiseAreas.join(", ")}, Occupation: ${alumni.currentOccupation}`
    ).join("\n");

    const prompt = `
    You are an AI assistant for Karnataka's education system. Match this student question with appropriate alumni:
    
    Question Title: ${questionTitle}
    Question Details: ${questionDetails}
    Category: ${category}
    
    Available Alumni:
    ${alumniText}
    
    Based on the question content and alumni expertise, provide the following in JSON format:
    1. suggestedAlumni: An array of alumni IDs who would be best suited to answer this question (up to 3)
    2. relevanceScores: A JSON object mapping alumni IDs to relevance scores (0-100)
    3. recommendedExpertiseAreas: Most relevant expertise areas for this question
    4. queryClassification: A classification of what this question is about
    
    Format the response as valid JSON.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Return a default response if API call fails
    return {
      suggestedAlumni: [],
      relevanceScores: {},
      recommendedExpertiseAreas: [category],
      queryClassification: category
    };
  }
}

/**
 * Generate insights for district-level education data
 */
export async function generateDistrictInsights(
  districtName: string,
  statsData: any
): Promise<string> {
  try {
    const prompt = `
    You are an AI education advisor for Karnataka state in India. Generate insights for this district's education data:
    
    District Name: ${districtName}
    
    Statistics:
    - Total Schools: ${statsData.totalSchools}
    - Total Complaints: ${statsData.totalComplaints}
    - Resolved Complaints: ${statsData.resolvedComplaints}
    - Pending Complaints: ${statsData.pendingComplaints}
    - Average Resolution Time: ${statsData.avgResolutionTime} days
    - Top Categories: ${JSON.stringify(statsData.topCategories)}
    
    Provide a concise paragraph (3-5 sentences) with actionable insights about:
    1. The district's performance compared to typical Karnataka standards
    2. Areas of concern based on complaint categories
    3. Specific recommendations for improvement
    
    Keep your response focused on actionable insights relevant to Karnataka's education system.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

/**
 * Translate text between English and Kannada
 */
export async function translateText(
  text: string,
  targetLanguage: "en" | "kn"
): Promise<string> {
  try {
    const prompt = `
    Translate the following text from ${targetLanguage === "en" ? "Kannada to English" : "English to Kannada"}:
    
    Text: ${text}
    
    Provide only the translated text, with no additional commentary.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return text; // Return original text if translation fails
  }
}
