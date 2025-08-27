import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, createDefaultAdmin } from "./localAuth";
import { openaiService } from "./openai";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { 
  insertChallengeSchema, 
  insertSolutionSchema, 
  insertReviewSchema,
  insertApplicationSchema,
  insertChatMessageSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow videos, documents, and images
    const allowedTypes = /\.(mp4|mov|avi|pdf|doc|docx|txt|jpg|jpeg|png|gif)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Create default admin user
  await createDefaultAdmin();

  // Challenge routes
  app.get('/api/challenges', async (req, res) => {
    try {
      const { status, type } = req.query;
      const challenges = await storage.getChallenges({ 
        status: status as string, 
        type: type as string 
      });
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/challenges/:id', async (req, res) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  app.post('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  // Solution routes
  app.get('/api/solutions', async (req, res) => {
    try {
      const { vendorId, status, trl, natoCompatible, securityCleared, capabilityArea, search } = req.query;
      
      let solutions;
      if (search) {
        solutions = await storage.searchSolutions(search as string);
      } else {
        solutions = await storage.getSolutions({
          vendorId: vendorId as string,
          status: status as string,
          trl: trl ? parseInt(trl as string) : undefined,
          natoCompatible: natoCompatible === 'true' ? true : natoCompatible === 'false' ? false : undefined,
          securityCleared: securityCleared === 'true' ? true : securityCleared === 'false' ? false : undefined,
          capabilityArea: capabilityArea as string,
        });
      }
      
      res.json(solutions);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      res.status(500).json({ message: "Failed to fetch solutions" });
    }
  });

  app.get('/api/solutions/:id', async (req, res) => {
    try {
      const solution = await storage.getSolution(req.params.id);
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }
      res.json(solution);
    } catch (error) {
      console.error("Error fetching solution:", error);
      res.status(500).json({ message: "Failed to fetch solution" });
    }
  });

  app.post('/api/solutions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'vendor') {
        return res.status(403).json({ message: "Vendor access required" });
      }

      const solutionData = insertSolutionSchema.parse({
        ...req.body,
        vendorId: userId
      });
      const solution = await storage.createSolution(solutionData);
      res.status(201).json(solution);
    } catch (error) {
      console.error("Error creating solution:", error);
      res.status(500).json({ message: "Failed to create solution" });
    }
  });

  app.patch('/api/solutions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const solution = await storage.getSolution(req.params.id);
      
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }

      if (solution.vendorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      const updatedSolution = await storage.updateSolution(req.params.id, updates);
      res.json(updatedSolution);
    } catch (error) {
      console.error("Error updating solution:", error);
      res.status(500).json({ message: "Failed to update solution" });
    }
  });

  // Review routes (government users only)
  app.get('/api/solutions/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsBySolution(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/solutions/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['government', 'contracting_officer'].includes(user.role)) {
        return res.status(403).json({ message: "Government access required" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        solutionId: req.params.id,
        reviewerId: userId
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { challengeId, status } = req.query;
      
      const applications = await storage.getApplications({
        challengeId: challengeId as string,
        vendorId: userId,
        status: status as string
      });
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'vendor') {
        return res.status(403).json({ message: "Vendor access required" });
      }

      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        vendorId: userId
      });
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // File upload routes
  app.post('/api/upload/video', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In a real implementation, you would upload to a cloud service
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.post('/api/upload/document', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Object Storage Routes
  
  // Serve public assets from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for object entity
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Update solution with uploaded files and set ACL policies
  app.put("/api/solutions/:id/files", isAuthenticated, async (req, res) => {
    if (!req.body.pitchVideoURL && !req.body.documentURLs) {
      return res.status(400).json({ error: "At least one file URL is required" });
    }

    const userId = (req.user as any)?.id;
    const solutionId = req.params.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const updates: any = {};

      // Handle pitch video upload
      if (req.body.pitchVideoURL) {
        const videoPath = await objectStorageService.trySetObjectEntityAclPolicy(
          req.body.pitchVideoURL,
          {
            owner: userId,
            visibility: "public", // Pitch videos can be viewed by government users
          },
        );
        updates.pitchVideoUrl = videoPath;
      }

      // Handle document uploads
      if (req.body.documentURLs && Array.isArray(req.body.documentURLs)) {
        const documentPaths = [];
        for (const docURL of req.body.documentURLs) {
          const docPath = await objectStorageService.trySetObjectEntityAclPolicy(
            docURL,
            {
              owner: userId,
              visibility: "private", // Documents are private to vendor and government
            },
          );
          documentPaths.push(docPath);
        }
        updates.documentUrls = documentPaths;
      }

      // Update solution in database
      await storage.updateSolution(solutionId, updates);

      res.status(200).json({
        message: "Files uploaded successfully",
        updates: updates,
      });
    } catch (error) {
      console.error("Error updating solution files:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await openaiService.chatAssistant(
        message, 
        user?.role || 'vendor',
        context
      );

      // Store chat message
      await storage.createChatMessage({
        userId,
        message,
        response: response.message,
        context: response.context
      });

      res.json(response);
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await storage.getChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // AI Matching routes
  app.post('/api/match', isAuthenticated, async (req: any, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const solutions = await storage.getSolutions();
      const challenges = await storage.getChallenges();

      const matches = await openaiService.semanticMatching(query, solutions, challenges);
      res.json(matches);
    } catch (error) {
      console.error("Error in matching:", error);
      res.status(500).json({ message: "Failed to process matching request" });
    }
  });

  // Commander's Capability Search endpoint
  app.post('/api/capability-search', async (req, res) => {
    try {
      const { requirement } = req.body;
      
      if (!requirement || requirement.trim().length === 0) {
        return res.status(400).json({ message: "Requirement description is required" });
      }

      // Get all available solutions
      const solutions = await storage.getSolutions();
      console.log(`Found ${solutions.length} solutions for capability search`);
      
      if (solutions.length === 0) {
        return res.json({
          matches: [],
          totalMatches: 0,
          message: "No solutions available in the database"
        });
      }

      // Use OpenAI to analyze and match solutions
      const searchResults = await openaiService.commanderCapabilitySearch(requirement, solutions);
      console.log(`OpenAI returned ${searchResults.totalMatches} matches`);
      
      // Fetch reviews for each matched solution
      const searchResultsWithReviews = {
        ...searchResults,
        matches: await Promise.all(
          searchResults.matches.map(async (match) => {
            try {
              const reviews = await storage.getSolutionReviews(match.id);
              return { ...match, reviews };
            } catch (error) {
              console.error(`Error fetching reviews for solution ${match.id}:`, error);
              return { ...match, reviews: [] };
            }
          })
        )
      };
      
      res.json(searchResultsWithReviews);
    } catch (error) {
      console.error("Error performing capability search:", error);
      res.status(500).json({ message: "Failed to perform capability search" });
    }
  });

  // Stats endpoint for dashboard
  app.get('/api/stats', async (req, res) => {
    try {
      const solutions = await storage.getSolutions();
      const challenges = await storage.getChallenges();
      const applications = await storage.getApplications();
      
      const stats = {
        vendors: new Set(solutions.map(s => s.vendorId)).size,
        solutions: solutions.length,
        challenges: challenges.filter(c => c.status === 'open').length,
        contracts: "$284M" // Mock value
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updates,
        updatedAt: new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
