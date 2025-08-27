import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("vendor"), // vendor, government, contracting_officer, admin
  organization: varchar("organization"),
  uei: varchar("uei"), // Unique Entity Identifier for vendors
  cage: varchar("cage"), // CAGE code for vendors
  natoEligible: boolean("nato_eligible").default(false),
  securityClearance: varchar("security_clearance"),
  businessSize: varchar("business_size"), // small, large, nontraditional
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // xtech, open_call, aos_call
  status: varchar("status").notNull().default("open"), // open, active, closed
  phases: jsonb("phases"), // Array of phase objects
  prizePool: decimal("prize_pool", { precision: 12, scale: 2 }),
  applicationDeadline: timestamp("application_deadline"),
  finalsDate: timestamp("finals_date"),
  eligibilityRequirements: jsonb("eligibility_requirements"),
  focusAreas: jsonb("focus_areas"), // Array of technology focus areas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const solutions = pgTable("solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  trl: integer("trl"), // Technology Readiness Level 1-9
  natoCompatible: boolean("nato_compatible").default(false),
  securityCleared: boolean("security_cleared").default(false),
  capabilityAreas: jsonb("capability_areas"), // Array of capability areas
  pitchVideoUrl: varchar("pitch_video_url"),
  documentUrls: jsonb("document_urls"), // Array of document URLs
  procurements: jsonb("procurements"), // Array of procurement info: {unit, contactName, contactEmail, contractValue, deploymentDate}
  status: varchar("status").notNull().default("submitted"), // submitted, under_review, awardable, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  solutionId: varchar("solution_id").notNull().references(() => solutions.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  description: text("description"),
  readinessScore: integer("readiness_score"), // 1-10
  interoperabilityScore: integer("interoperability_score"), // 1-10
  supportScore: integer("support_score"), // 1-10
  fieldTested: boolean("field_tested").default(false),
  testDate: timestamp("test_date"),
  helpfulVotes: integer("helpful_votes").default(0),
  totalVotes: integer("total_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  solutionId: varchar("solution_id").references(() => solutions.id),
  phase: integer("phase").notNull().default(1),
  status: varchar("status").notNull().default("submitted"), // submitted, under_review, accepted, rejected
  whitePaperUrl: varchar("white_paper_url"),
  videoUrl: varchar("video_url"),
  submissionData: jsonb("submission_data"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  context: jsonb("context"), // Additional context for AI
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Solution = typeof solutions.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
