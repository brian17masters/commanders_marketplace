import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  context?: any;
}

export interface MatchingResponse {
  matches: {
    id: string;
    title: string;
    score: number;
    explanation: string;
  }[];
  totalMatches: number;
}

export class OpenAIService {
  
  async chatAssistant(
    message: string, 
    userRole: string, 
    context?: any
  ): Promise<ChatResponse> {
    try {
      let systemPrompt = "You are an AI assistant for the G-TEAD Marketplace, helping with military technology procurement and submissions.";
      
      if (userRole === "vendor") {
        systemPrompt += " Provide guidance on submission requirements, challenge applications, and improving solution presentations. Focus on helping vendors navigate the procurement process.";
      } else if (userRole === "government" || userRole === "contracting_officer") {
        systemPrompt += " Provide guidance on procurement processes, technology evaluation, acquisition pathways, and regulatory compliance. Help with FAR, OT agreements, and TSM processes.";
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_completion_tokens: 500,
      });

      return {
        message: response.choices[0].message.content || "I apologize, but I couldn't generate a response.",
        context: { userRole, timestamp: new Date().toISOString() }
      };
    } catch (error) {
      console.error("OpenAI chat error:", error);
      return {
        message: "I'm experiencing technical difficulties. Please try again later or contact support.",
        context: { error: true }
      };
    }
  }

  async semanticMatching(
    query: string,
    solutions: any[],
    challenges: any[]
  ): Promise<MatchingResponse> {
    try {
      const prompt = `
        As an AI assistant for military technology procurement, analyze the following query and match it with relevant solutions and challenges.
        
        Query: "${query}"
        
        Solutions available: ${JSON.stringify(solutions.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          capabilityAreas: s.capabilityAreas,
          trl: s.trl
        })))}
        
        Challenges available: ${JSON.stringify(challenges.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          focusAreas: c.focusAreas
        })))}
        
        Provide matches with relevance scores and explanations. Return JSON format with matches array containing id, title, score (0-1), and explanation for each match.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        matches: result.matches || [],
        totalMatches: result.matches?.length || 0
      };
    } catch (error) {
      console.error("OpenAI matching error:", error);
      return {
        matches: [],
        totalMatches: 0
      };
    }
  }

  async generateSubmissionTips(challengeType: string, userProfile: any): Promise<string> {
    try {
      const prompt = `
        Generate specific submission tips for a ${challengeType} challenge application.
        User profile: ${JSON.stringify(userProfile)}
        
        Provide actionable advice for creating a competitive submission, focusing on:
        - Key requirements and evaluation criteria
        - Common mistakes to avoid
        - Ways to strengthen the proposal
        - Timeline and preparation recommendations
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 600,
      });

      return response.choices[0].message.content || "Unable to generate submission tips at this time.";
    } catch (error) {
      console.error("OpenAI submission tips error:", error);
      return "Unable to generate submission tips at this time. Please refer to the challenge documentation.";
    }
  }

  async analyzeFeedback(reviews: any[]): Promise<{
    summary: string;
    trends: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Analyze the following government reviews and feedback to provide insights:
        
        Reviews: ${JSON.stringify(reviews)}
        
        Provide analysis in JSON format with:
        - summary: Brief overview of overall feedback
        - trends: Array of key trends observed
        - recommendations: Array of actionable recommendations for improvement
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        summary: result.summary || "No analysis available",
        trends: result.trends || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error("OpenAI feedback analysis error:", error);
      return {
        summary: "Unable to analyze feedback at this time",
        trends: [],
        recommendations: []
      };
    }
  }
}

export const openaiService = new OpenAIService();
