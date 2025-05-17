import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types
export const USER_TYPES = {
  STUDENT: "student",
  SCHOOL: "school",
  AUTHORITY: "authority",
} as const;

// Complaint status
export const COMPLAINT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
} as const;

// Districts in Karnataka
export const KARNATAKA_DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
  "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
  "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
];

// Categories for complaints
export const COMPLAINT_CATEGORIES = [
  "Infrastructure", 
  "Teaching Staff", 
  "Basic Amenities", 
  "Educational Materials", 
  "Administrative Issues",
  "Transportation",
  "Mid-day Meal",
  "Others"
];

// Areas for alumni expertise
export const ALUMNI_EXPERTISE_AREAS = [
  "Career Guidance",
  "Higher Education",
  "Technology",
  "Medicine",
  "Engineering",
  "Arts & Humanities",
  "Government Services",
  "Entrepreneurship",
  "Science",
  "Sports"
];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(),
  district: text("district"),
  schoolId: integer("school_id"),
  schoolName: text("school_name"),
  classInfo: text("class_info"),
  designation: text("designation"),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schools table
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  category: text("category").notNull(), // Govt, Aided, Private
  adminId: integer("admin_id"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Complaints table
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default(COMPLAINT_STATUS.PENDING),
  userId: integer("user_id").notNull(),
  schoolId: integer("school_id").notNull(),
  tokenId: text("token_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  aiAnalysis: jsonb("ai_analysis"),
  district: text("district").notNull(),
  evidence: text("evidence"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Complaint updates/responses
export const complaintResponses = pgTable("complaint_responses", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").notNull(),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(),
  response: text("response").notNull(),
  attachments: text("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alumni profiles
export const alumni = pgTable("alumni", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  schoolId: integer("school_id").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  currentOccupation: text("current_occupation").notNull(),
  organization: text("organization"),
  expertiseAreas: text("expertise_areas").array().notNull(),
  bio: text("bio"),
  isAvailableForMentoring: boolean("is_available_for_mentoring").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alumni connection requests
export const alumniConnections = pgTable("alumni_connections", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  alumniId: integer("alumni_id").notNull(),
  questionTitle: text("question_title").notNull(),
  questionDetails: text("question_details").notNull(),
  category: text("category").notNull(),
  isPublic: boolean("is_public").default(false),
  status: text("status").notNull().default("pending"),
  aiRecommendation: jsonb("ai_recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alumni responses to connection requests
export const alumniResponses = pgTable("alumni_responses", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// District-wise statistics
export const districtStats = pgTable("district_stats", {
  id: serial("id").primaryKey(),
  district: text("district").notNull().unique(),
  totalSchools: integer("total_schools").notNull(),
  totalComplaints: integer("total_complaints").notNull(),
  resolvedComplaints: integer("resolved_complaints").notNull(),
  pendingComplaints: integer("pending_complaints").notNull(),
  avgResolutionTime: integer("avg_resolution_time"),
  topCategories: jsonb("top_categories"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true });
export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComplaintResponseSchema = createInsertSchema(complaintResponses).omit({ id: true, createdAt: true });
export const insertAlumniSchema = createInsertSchema(alumni).omit({ id: true, createdAt: true });
export const insertAlumniConnectionSchema = createInsertSchema(alumniConnections).omit({ id: true, createdAt: true });
export const insertAlumniResponseSchema = createInsertSchema(alumniResponses).omit({ id: true, createdAt: true });
export const insertDistrictStatsSchema = createInsertSchema(districtStats).omit({ id: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type ComplaintResponse = typeof complaintResponses.$inferSelect;
export type InsertComplaintResponse = z.infer<typeof insertComplaintResponseSchema>;

export type Alumni = typeof alumni.$inferSelect;
export type InsertAlumni = z.infer<typeof insertAlumniSchema>;

export type AlumniConnection = typeof alumniConnections.$inferSelect;
export type InsertAlumniConnection = z.infer<typeof insertAlumniConnectionSchema>;

export type AlumniResponse = typeof alumniResponses.$inferSelect;
export type InsertAlumniResponse = z.infer<typeof insertAlumniResponseSchema>;

export type DistrictStats = typeof districtStats.$inferSelect;
export type InsertDistrictStats = z.infer<typeof insertDistrictStatsSchema>;
