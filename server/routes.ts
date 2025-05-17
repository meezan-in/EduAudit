import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertComplaintSchema, 
  insertComplaintResponseSchema,
  insertAlumniSchema,
  insertAlumniConnectionSchema,
  insertAlumniResponseSchema,
  USER_TYPES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS,
  KARNATAKA_DISTRICTS,
  ALUMNI_EXPERTISE_AREAS
} from "@shared/schema";
import { nanoid } from "nanoid";
import { analyzeComplaint } from "./ai-services";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  app.use(session({
    secret: process.env.SESSION_SECRET || "eduaudit-karnataka-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) { // In production, use proper password hashing
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isUserType = (type: string) => (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && (req.user as any).userType === type) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Set defaults for null or undefined fields based on user type
      const userData = {
        ...validatedData,
        district: validatedData.district || null,
        schoolId: validatedData.schoolId || null,
        schoolName: validatedData.schoolName || null,
        classInfo: validatedData.classInfo || null,
        designation: validatedData.designation || null,
        phoneNumber: validatedData.phoneNumber || null,
        profilePicture: validatedData.profilePicture || null
      };
      
      // Specific validation based on user type
      if (userData.userType === USER_TYPES.SCHOOL && !userData.schoolName) {
        return res.status(400).json({ message: "School name is required for school admin accounts" });
      }
      
      if (userData.userType === USER_TYPES.AUTHORITY && !userData.district) {
        return res.status(400).json({ message: "District is required for authority accounts" });
      }
      
      // Create user with proper defaults
      const user = await storage.createUser(userData);
      
      // If this is a school admin, also create a school record if it doesn't exist
      if (userData.userType === USER_TYPES.SCHOOL && userData.schoolName) {
        try {
          const schoolData = {
            name: userData.schoolName,
            district: userData.district || "Unknown",
            category: "Government", // Default value, can be updated later
            address: "",
            pincode: "",
            adminId: user.id,
            contactPhone: userData.phoneNumber,
            contactEmail: userData.email
          };
          
          const school = await storage.createSchool(schoolData);
          
          // Update the user with the new schoolId
          await storage.updateUser(user.id, { schoolId: school.id });
        } catch (schoolError) {
          console.error("Error creating school:", schoolError);
          // Continue with registration even if school creation fails
        }
      }
      
      // Automatically log the user in after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  });

  app.get('/api/auth/session', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get('/api/user/:id', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUserById(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/user/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if the user is updating their own profile
      if (req.user && (req.user as any).id !== userId) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      const user = await storage.updateUser(userId, req.body);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complaint routes
  app.get('/api/complaints', isAuthenticated, async (req, res) => {
    try {
      let complaints = [];
      const user = req.user as any;
      
      switch (user.userType) {
        case USER_TYPES.STUDENT:
          // Students can see their own complaints
          complaints = await storage.getComplaintsByUserId(user.id);
          break;
        case USER_TYPES.SCHOOL:
          // School admins can see complaints for their school
          complaints = await storage.getComplaintsBySchoolId(user.schoolId);
          break;
        case USER_TYPES.AUTHORITY:
          // Authority can see complaints by district (if specified) or all
          if (req.query.district) {
            complaints = await storage.getComplaintsByDistrict(req.query.district as string);
          } else {
            // Get complaints from multiple districts
            const districtStats = await storage.getAllDistrictStats();
            for (const stats of districtStats) {
              const districtComplaints = await storage.getComplaintsByDistrict(stats.district);
              complaints.push(...districtComplaints);
            }
          }
          break;
      }
      
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/complaints/:id', isAuthenticated, async (req, res) => {
    try {
      const complaint = await storage.getComplaintById(parseInt(req.params.id));
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (
        user.userType === USER_TYPES.STUDENT && complaint.userId !== user.id ||
        user.userType === USER_TYPES.SCHOOL && complaint.schoolId !== user.schoolId
      ) {
        return res.status(403).json({ message: "You don't have permission to view this complaint" });
      }
      
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/complaints', isAuthenticated, isUserType(USER_TYPES.STUDENT), async (req, res) => {
    try {
      const user = req.user as any;
      
      // Find the user's school ID - if not in user record, this needs to be resolved
      if (!user.schoolId) {
        return res.status(400).json({ message: "School ID is required. Please update your profile with your school information." });
      }
      
      const complaintData = {
        ...req.body,
        userId: user.id,
        district: user.district,
        schoolId: user.schoolId, // Ensure schoolId is included
        status: "pending", // Set initial status
        tokenId: `KA${new Date().getFullYear()}-${nanoid(4).toUpperCase()}`
      };
      
      const validatedData = insertComplaintSchema.parse(complaintData);
      
      // Use AI to analyze the complaint
      let aiAnalysis = null;
      try {
        aiAnalysis = await analyzeComplaint(validatedData.title, validatedData.description, validatedData.category);
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        // Continue even if AI analysis fails
      }
      
      const complaint = await storage.createComplaint({
        ...validatedData,
        aiAnalysis
      });
      
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  });

  app.put('/api/complaints/:id/status', isAuthenticated, async (req, res) => {
    try {
      const complaintId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!Object.values(COMPLAINT_STATUS).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const user = req.user as any;
      const complaint = await storage.getComplaintById(complaintId);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check authorization
      if (
        user.userType === USER_TYPES.STUDENT && complaint.userId !== user.id ||
        user.userType === USER_TYPES.SCHOOL && complaint.schoolId !== user.schoolId
      ) {
        return res.status(403).json({ message: "You don't have permission to update this complaint" });
      }
      
      const updatedComplaint = await storage.updateComplaintStatus(complaintId, status);
      res.json(updatedComplaint);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complaint responses routes
  app.get('/api/complaints/:id/responses', isAuthenticated, async (req, res) => {
    try {
      const complaintId = parseInt(req.params.id);
      const complaint = await storage.getComplaintById(complaintId);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (
        user.userType === USER_TYPES.STUDENT && complaint.userId !== user.id ||
        user.userType === USER_TYPES.SCHOOL && complaint.schoolId !== user.schoolId
      ) {
        return res.status(403).json({ message: "You don't have permission to view these responses" });
      }
      
      const responses = await storage.getResponsesByComplaintId(complaintId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/complaints/:id/responses', isAuthenticated, async (req, res) => {
    try {
      const complaintId = parseInt(req.params.id);
      const user = req.user as any;
      
      const complaint = await storage.getComplaintById(complaintId);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check authorization
      if (
        user.userType === USER_TYPES.STUDENT && complaint.userId !== user.id ||
        user.userType === USER_TYPES.SCHOOL && complaint.schoolId !== user.schoolId
      ) {
        return res.status(403).json({ message: "You don't have permission to respond to this complaint" });
      }
      
      const responseData = {
        ...req.body,
        complaintId,
        userId: user.id,
        userType: user.userType
      };
      
      const validatedData = insertComplaintResponseSchema.parse(responseData);
      const response = await storage.addComplaintResponse(validatedData);
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Alumni routes
  app.get('/api/alumni', isAuthenticated, async (req, res) => {
    try {
      let alumni = [];
      if (req.query.schoolId) {
        const schoolId = parseInt(req.query.schoolId as string);
        alumni = await storage.getAlumniBySchoolId(schoolId);
      }
      
      res.json(alumni);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/alumni/:id', isAuthenticated, async (req, res) => {
    try {
      const alumniId = parseInt(req.params.id);
      const alumni = await storage.getAlumniById(alumniId);
      
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      
      res.json(alumni);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/alumni', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const alumniData = {
        ...req.body,
        userId: user.id
      };
      
      const validatedData = insertAlumniSchema.parse(alumniData);
      const alumni = await storage.createAlumni(validatedData);
      
      res.status(201).json(alumni);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Alumni connection routes
  app.get('/api/connections', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let connections = [];
      
      if (user.userType === USER_TYPES.STUDENT) {
        connections = await storage.getConnectionsByStudentId(user.id);
      } else {
        // For alumni, get their connections based on alumni profile
        const alumni = await storage.getAlumniByUserId(user.id);
        if (alumni) {
          connections = await storage.getConnectionsByAlumniId(alumni.id);
        }
      }
      
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getConnectionById(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      const alumni = await storage.getAlumniByUserId(user.id);
      
      if (
        user.userType === USER_TYPES.STUDENT && connection.studentId !== user.id ||
        alumni && connection.alumniId !== alumni.id
      ) {
        return res.status(403).json({ message: "You don't have permission to view this connection" });
      }
      
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/connections', isAuthenticated, isUserType(USER_TYPES.STUDENT), async (req, res) => {
    try {
      const user = req.user as any;
      const connectionData = {
        ...req.body,
        studentId: user.id
      };
      
      const validatedData = insertAlumniConnectionSchema.parse(connectionData);
      const connection = await storage.createConnection(validatedData);
      
      res.status(201).json(connection);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Connection responses routes
  app.get('/api/connections/:id/responses', isAuthenticated, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getConnectionById(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      const alumni = await storage.getAlumniByUserId(user.id);
      
      if (
        user.userType === USER_TYPES.STUDENT && connection.studentId !== user.id ||
        alumni && connection.alumniId !== alumni.id
      ) {
        return res.status(403).json({ message: "You don't have permission to view these responses" });
      }
      
      const responses = await storage.getResponsesByConnectionId(connectionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/connections/:id/responses', isAuthenticated, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getConnectionById(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Check authorization - only alumni can respond
      const user = req.user as any;
      const alumni = await storage.getAlumniByUserId(user.id);
      
      if (!alumni || connection.alumniId !== alumni.id) {
        return res.status(403).json({ message: "You don't have permission to respond to this connection" });
      }
      
      const responseData = {
        ...req.body,
        connectionId
      };
      
      const validatedData = insertAlumniResponseSchema.parse(responseData);
      const response = await storage.addAlumniResponse(validatedData);
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // District statistics routes
  app.get('/api/districts/stats', async (req, res) => {
    try {
      const stats = await storage.getAllDistrictStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/districts/:district/stats', async (req, res) => {
    try {
      const district = req.params.district;
      const stats = await storage.getDistrictStats(district);
      
      if (!stats) {
        return res.status(404).json({ message: "District stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Metadata routes
  app.get('/api/metadata', (req, res) => {
    res.json({
      districts: KARNATAKA_DISTRICTS,
      complaintCategories: COMPLAINT_CATEGORIES,
      expertiseAreas: ALUMNI_EXPERTISE_AREAS,
      complaintStatus: Object.values(COMPLAINT_STATUS)
    });
  });

  return httpServer;
}

// Mock AI analysis function (will be imported from a proper AI service file in production)
async function analyzeComplaint(title: string, description: string, category: string) {
  // In a real implementation, this would call the OpenAI API
  return {
    priority: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
    suggestedCategory: category,
    sentiment: Math.random() > 0.5 ? "negative" : "neutral",
    keyIssues: [
      "Infrastructure deficiency",
      "Resource unavailability",
      "Maintenance issues"
    ],
    recommendedActions: [
      "Forward to district education officer",
      "Request school inspection",
      "Allocate emergency funds"
    ]
  };
}
