import {
  users,
  challenges,
  solutions,
  reviews,
  applications,
  chatMessages,
  type User,
  type UpsertUser,
  type Challenge,
  type InsertChallenge,
  type Solution,
  type InsertSolution,
  type Review,
  type InsertReview,
  type Application,
  type InsertApplication,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(filters?: { status?: string; type?: string }): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  updateChallenge(id: string, updates: Partial<InsertChallenge>): Promise<Challenge>;
  
  // Solution operations
  createSolution(solution: InsertSolution): Promise<Solution>;
  getSolutions(filters?: { 
    vendorId?: string; 
    status?: string; 
    trl?: number;
    natoCompatible?: boolean;
  }): Promise<Solution[]>;
  getSolution(id: string): Promise<Solution | undefined>;
  updateSolution(id: string, updates: Partial<InsertSolution>): Promise<Solution>;
  searchSolutions(query: string): Promise<Solution[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsBySolution(solutionId: string): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(filters?: { 
    challengeId?: string; 
    vendorId?: string; 
    status?: string;
  }): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private challenges = new Map<string, Challenge>();
  private solutions = new Map<string, Solution>();
  private reviews = new Map<string, Review>();
  private applications = new Map<string, Application>();
  private chatMessages = new Map<string, ChatMessage>();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed xTech challenges
    const xTechHumanoid: Challenge = {
      id: "xtech-humanoid-2025",
      title: "xTechHumanoid",
      description: "The U.S. Army seeks transformative humanoid technologies to enhance warfighter survivability, sustain combat power, and operate in complex environments. Focus: Prototype militarized humanoids and subsystems like AI, sensors, power systems.",
      type: "xtech",
      status: "open",
      phases: [
        {
          name: "Phase 1",
          description: "Concept White Paper",
          requirements: "5-page paper + optional 3-5 min video",
          prize: "$25,000 each (up to 10 winners)"
        },
        {
          name: "Phase 2", 
          description: "Final Experimentation Event",
          requirements: "Live demonstration",
          prize: "Up to 2 baseline winners at $75,000 each and up to 3 subsystem winners at $30,000 each"
        }
      ],
      prizePool: "490000.00",
      applicationDeadline: new Date("2025-10-01"),
      finalsDate: new Date("2026-08-01"),
      eligibilityRequirements: {
        organizations: ["Nonprofit/for-profit organizations", "Large/small", "Domestic/foreign"],
        requirements: ["Must have CAGE/NCAGE code", "Not federal/government entities"]
      },
      focusAreas: ["AI", "Sensors", "Power Systems", "Humanoid Robotics"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const xTechSearch9: Challenge = {
      id: "xtech-search-9-2025",
      title: "xTechSearch 9", 
      description: "Open-topic competition for groundbreaking technologies with commercial traction. Focus areas include sensors, immersive/wearables, AI/ML, energy resiliency, and contested logistics. Excludes medical research areas.",
      type: "xtech",
      status: "active",
      phases: [
        {
          name: "Phase 1",
          description: "Concept White Paper",
          requirements: "White paper on technology, Army application, team",
          prize: "$5,000 each (up to 60 semi-finalists)"
        },
        {
          name: "Phase 2",
          description: "Final Pitch Event", 
          requirements: "Live pitch presentation",
          prize: "$25,000 each (up to 24 finalists)"
        },
        {
          name: "Phase 3",
          description: "Phase I Army SBIR Proposal",
          requirements: "SBIR proposal submission",
          prize: "Phase I SBIR up to $250,000 each"
        }
      ],
      prizePool: "900000.00",
      applicationDeadline: new Date("2025-12-15"),
      finalsDate: new Date("2025-09-19"),
      eligibilityRequirements: {
        organizations: ["U.S. small businesses"],
        requirements: ["<500 employees", ">50% U.S. owned/controlled by citizens/residents", "No duplicates with other federal funding"]
      },
      focusAreas: ["Sensors", "Immersive/Wearables", "AI/ML", "Energy Resiliency", "Contested Logistics"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.challenges.set(xTechHumanoid.id, xTechHumanoid);
    this.challenges.set(xTechSearch9.id, xTechSearch9);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    } as User;
    
    this.users.set(user.id, user);
    return user;
  }

  // Challenge operations
  async createChallenge(challengeData: InsertChallenge): Promise<Challenge> {
    const id = `challenge-${Date.now()}`;
    const challenge: Challenge = {
      ...challengeData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallenges(filters?: { status?: string; type?: string }): Promise<Challenge[]> {
    let challengesList = Array.from(this.challenges.values());
    
    if (filters?.status) {
      challengesList = challengesList.filter(c => c.status === filters.status);
    }
    if (filters?.type) {
      challengesList = challengesList.filter(c => c.type === filters.type);
    }
    
    return challengesList;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async updateChallenge(id: string, updates: Partial<InsertChallenge>): Promise<Challenge> {
    const existing = this.challenges.get(id);
    if (!existing) throw new Error("Challenge not found");
    
    const updated: Challenge = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.challenges.set(id, updated);
    return updated;
  }

  // Solution operations
  async createSolution(solutionData: InsertSolution): Promise<Solution> {
    const id = `solution-${Date.now()}`;
    const solution: Solution = {
      ...solutionData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.solutions.set(id, solution);
    return solution;
  }

  async getSolutions(filters?: { 
    vendorId?: string; 
    status?: string; 
    trl?: number;
    natoCompatible?: boolean;
  }): Promise<Solution[]> {
    let solutionsList = Array.from(this.solutions.values());
    
    if (filters?.vendorId) {
      solutionsList = solutionsList.filter(s => s.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      solutionsList = solutionsList.filter(s => s.status === filters.status);
    }
    if (filters?.trl) {
      solutionsList = solutionsList.filter(s => s.trl === filters.trl);
    }
    if (filters?.natoCompatible !== undefined) {
      solutionsList = solutionsList.filter(s => s.natoCompatible === filters.natoCompatible);
    }
    
    return solutionsList;
  }

  async getSolution(id: string): Promise<Solution | undefined> {
    return this.solutions.get(id);
  }

  async updateSolution(id: string, updates: Partial<InsertSolution>): Promise<Solution> {
    const existing = this.solutions.get(id);
    if (!existing) throw new Error("Solution not found");
    
    const updated: Solution = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.solutions.set(id, updated);
    return updated;
  }

  async searchSolutions(query: string): Promise<Solution[]> {
    const solutions = Array.from(this.solutions.values());
    const lowerQuery = query.toLowerCase();
    
    return solutions.filter(solution => 
      solution.title.toLowerCase().includes(lowerQuery) ||
      solution.description.toLowerCase().includes(lowerQuery) ||
      (solution.capabilityAreas as string[])?.some(area => 
        area.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = `review-${Date.now()}`;
    const review: Review = {
      ...reviewData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsBySolution(solutionId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.solutionId === solutionId);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  // Application operations
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const id = `application-${Date.now()}`;
    const application: Application = {
      ...applicationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplications(filters?: { 
    challengeId?: string; 
    vendorId?: string; 
    status?: string;
  }): Promise<Application[]> {
    let applicationsList = Array.from(this.applications.values());
    
    if (filters?.challengeId) {
      applicationsList = applicationsList.filter(a => a.challengeId === filters.challengeId);
    }
    if (filters?.vendorId) {
      applicationsList = applicationsList.filter(a => a.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      applicationsList = applicationsList.filter(a => a.status === filters.status);
    }
    
    return applicationsList;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    const existing = this.applications.get(id);
    if (!existing) throw new Error("Application not found");
    
    const updated: Application = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.applications.set(id, updated);
    return updated;
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = `message-${Date.now()}`;
    const message: ChatMessage = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
