import { 
  users, User, InsertUser, 
  schools, School, InsertSchool, 
  complaints, Complaint, InsertComplaint, 
  complaintResponses, ComplaintResponse, InsertComplaintResponse,
  alumni, Alumni, InsertAlumni, 
  alumniConnections, AlumniConnection, InsertAlumniConnection,
  alumniResponses, AlumniResponse, InsertAlumniResponse,
  districtStats, DistrictStats, InsertDistrictStats,
  COMPLAINT_STATUS
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // School operations
  getSchoolById(id: number): Promise<School | undefined>;
  getSchoolsByDistrict(district: string): Promise<School[]>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, schoolData: Partial<School>): Promise<School | undefined>;
  
  // Complaint operations
  getComplaintById(id: number): Promise<Complaint | undefined>;
  getComplaintsByUserId(userId: number): Promise<Complaint[]>;
  getComplaintsBySchoolId(schoolId: number): Promise<Complaint[]>;
  getComplaintsByDistrict(district: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined>;
  
  // Complaint responses
  getResponsesByComplaintId(complaintId: number): Promise<ComplaintResponse[]>;
  addComplaintResponse(response: InsertComplaintResponse): Promise<ComplaintResponse>;
  
  // Alumni operations
  getAlumniById(id: number): Promise<Alumni | undefined>;
  getAlumniByUserId(userId: number): Promise<Alumni | undefined>;
  getAlumniBySchoolId(schoolId: number): Promise<Alumni[]>;
  createAlumni(alumni: InsertAlumni): Promise<Alumni>;
  updateAlumni(id: number, alumniData: Partial<Alumni>): Promise<Alumni | undefined>;
  
  // Alumni connections
  getConnectionById(id: number): Promise<AlumniConnection | undefined>;
  getConnectionsByStudentId(studentId: number): Promise<AlumniConnection[]>;
  getConnectionsByAlumniId(alumniId: number): Promise<AlumniConnection[]>;
  createConnection(connection: InsertAlumniConnection): Promise<AlumniConnection>;
  updateConnectionStatus(id: number, status: string): Promise<AlumniConnection | undefined>;
  
  // Alumni responses
  getResponsesByConnectionId(connectionId: number): Promise<AlumniResponse[]>;
  addAlumniResponse(response: InsertAlumniResponse): Promise<AlumniResponse>;
  
  // District statistics
  getDistrictStats(district: string): Promise<DistrictStats | undefined>;
  getAllDistrictStats(): Promise<DistrictStats[]>;
  updateDistrictStats(district: string, stats: Partial<DistrictStats>): Promise<DistrictStats | undefined>;
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private schools: Map<number, School>;
  private complaints: Map<number, Complaint>;
  private complaintResponses: Map<number, ComplaintResponse>;
  private alumni: Map<number, Alumni>;
  private alumniConnections: Map<number, AlumniConnection>;
  private alumniResponses: Map<number, AlumniResponse>;
  private districtStatistics: Map<string, DistrictStats>;
  
  private userId: number = 1;
  private schoolId: number = 1;
  private complaintId: number = 1;
  private responseId: number = 1;
  private alumniId: number = 1;
  private connectionId: number = 1;
  private alumniResponseId: number = 1;
  private districtStatsId: number = 1;

  constructor() {
    this.users = new Map();
    this.schools = new Map();
    this.complaints = new Map();
    this.complaintResponses = new Map();
    this.alumni = new Map();
    this.alumniConnections = new Map();
    this.alumniResponses = new Map();
    this.districtStatistics = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // School operations
  async getSchoolById(id: number): Promise<School | undefined> {
    return this.schools.get(id);
  }

  async getSchoolsByDistrict(district: string): Promise<School[]> {
    return Array.from(this.schools.values()).filter(school => school.district === district);
  }

  async createSchool(schoolData: InsertSchool): Promise<School> {
    const id = this.schoolId++;
    const now = new Date();
    const school: School = { ...schoolData, id, createdAt: now };
    this.schools.set(id, school);
    return school;
  }

  async updateSchool(id: number, schoolData: Partial<School>): Promise<School | undefined> {
    const school = this.schools.get(id);
    if (!school) return undefined;
    
    const updatedSchool: School = { ...school, ...schoolData };
    this.schools.set(id, updatedSchool);
    return updatedSchool;
  }

  // Complaint operations
  async getComplaintById(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.userId === userId);
  }

  async getComplaintsBySchoolId(schoolId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.schoolId === schoolId);
  }

  async getComplaintsByDistrict(district: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.district === district);
  }

  async createComplaint(complaintData: InsertComplaint): Promise<Complaint> {
    const id = this.complaintId++;
    const now = new Date();
    
    // Ensure all required fields have values with proper defaults
    const complaint: Complaint = { 
      ...complaintData, 
      id, 
      status: complaintData.status || "pending", 
      assignedToId: complaintData.assignedToId || null,
      evidence: complaintData.evidence || null,
      aiAnalysis: complaintData.aiAnalysis || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.complaints.set(id, complaint);
    
    // Update district stats
    await this.updateDistrictComplaintStats(complaint.district);
    
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const now = new Date();
    const updatedComplaint: Complaint = { 
      ...complaint, 
      status, 
      updatedAt: now 
    };
    this.complaints.set(id, updatedComplaint);
    
    // Update district stats
    await this.updateDistrictComplaintStats(complaint.district);
    
    return updatedComplaint;
  }

  // Complaint responses
  async getResponsesByComplaintId(complaintId: number): Promise<ComplaintResponse[]> {
    return Array.from(this.complaintResponses.values())
      .filter(response => response.complaintId === complaintId);
  }

  async addComplaintResponse(responseData: InsertComplaintResponse): Promise<ComplaintResponse> {
    const id = this.responseId++;
    const now = new Date();
    const response: ComplaintResponse = { ...responseData, id, createdAt: now };
    this.complaintResponses.set(id, response);
    return response;
  }

  // Alumni operations
  async getAlumniById(id: number): Promise<Alumni | undefined> {
    return this.alumni.get(id);
  }

  async getAlumniByUserId(userId: number): Promise<Alumni | undefined> {
    return Array.from(this.alumni.values()).find(alumni => alumni.userId === userId);
  }

  async getAlumniBySchoolId(schoolId: number): Promise<Alumni[]> {
    return Array.from(this.alumni.values()).filter(alumni => alumni.schoolId === schoolId);
  }

  async createAlumni(alumniData: InsertAlumni): Promise<Alumni> {
    const id = this.alumniId++;
    const now = new Date();
    const alumni: Alumni = { ...alumniData, id, createdAt: now };
    this.alumni.set(id, alumni);
    return alumni;
  }

  async updateAlumni(id: number, alumniData: Partial<Alumni>): Promise<Alumni | undefined> {
    const alumni = this.alumni.get(id);
    if (!alumni) return undefined;
    
    const updatedAlumni: Alumni = { ...alumni, ...alumniData };
    this.alumni.set(id, updatedAlumni);
    return updatedAlumni;
  }

  // Alumni connections
  async getConnectionById(id: number): Promise<AlumniConnection | undefined> {
    return this.alumniConnections.get(id);
  }

  async getConnectionsByStudentId(studentId: number): Promise<AlumniConnection[]> {
    return Array.from(this.alumniConnections.values())
      .filter(connection => connection.studentId === studentId);
  }

  async getConnectionsByAlumniId(alumniId: number): Promise<AlumniConnection[]> {
    return Array.from(this.alumniConnections.values())
      .filter(connection => connection.alumniId === alumniId);
  }

  async createConnection(connectionData: InsertAlumniConnection): Promise<AlumniConnection> {
    const id = this.connectionId++;
    const now = new Date();
    const connection: AlumniConnection = { ...connectionData, id, createdAt: now };
    this.alumniConnections.set(id, connection);
    return connection;
  }

  async updateConnectionStatus(id: number, status: string): Promise<AlumniConnection | undefined> {
    const connection = this.alumniConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection: AlumniConnection = { ...connection, status };
    this.alumniConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Alumni responses
  async getResponsesByConnectionId(connectionId: number): Promise<AlumniResponse[]> {
    return Array.from(this.alumniResponses.values())
      .filter(response => response.connectionId === connectionId);
  }

  async addAlumniResponse(responseData: InsertAlumniResponse): Promise<AlumniResponse> {
    const id = this.alumniResponseId++;
    const now = new Date();
    const response: AlumniResponse = { ...responseData, id, createdAt: now };
    this.alumniResponses.set(id, response);
    return response;
  }

  // District statistics
  async getDistrictStats(district: string): Promise<DistrictStats | undefined> {
    return this.districtStatistics.get(district);
  }

  async getAllDistrictStats(): Promise<DistrictStats[]> {
    return Array.from(this.districtStatistics.values());
  }

  async updateDistrictStats(district: string, statsData: Partial<DistrictStats>): Promise<DistrictStats | undefined> {
    const stats = this.districtStatistics.get(district);
    if (!stats) return undefined;
    
    const now = new Date();
    const updatedStats: DistrictStats = { 
      ...stats, 
      ...statsData,
      updatedAt: now 
    };
    this.districtStatistics.set(district, updatedStats);
    return updatedStats;
  }

  // Helper method to update district stats when complaints are added or status changes
  private async updateDistrictComplaintStats(district: string): Promise<void> {
    const districtComplaints = await this.getComplaintsByDistrict(district);
    const stats = this.districtStatistics.get(district);
    
    if (!stats) return;
    
    const totalComplaints = districtComplaints.length;
    const resolvedComplaints = districtComplaints.filter(c => c.status === COMPLAINT_STATUS.RESOLVED).length;
    const pendingComplaints = totalComplaints - resolvedComplaints;
    
    // Calculate top categories
    const categoryCounts: Record<string, number> = {};
    districtComplaints.forEach(complaint => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
    
    // Calculate average resolution time (in days) for resolved complaints
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    districtComplaints
      .filter(c => c.status === COMPLAINT_STATUS.RESOLVED && c.updatedAt && c.createdAt)
      .forEach(complaint => {
        const createdDate = new Date(complaint.createdAt!);
        const resolvedDate = new Date(complaint.updatedAt!);
        const timeDiff = resolvedDate.getTime() - createdDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        totalResolutionTime += daysDiff;
        resolvedCount++;
      });
    
    const avgResolutionTime = resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0;
    
    const updatedStats: Partial<DistrictStats> = {
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      avgResolutionTime,
      topCategories
    };
    
    await this.updateDistrictStats(district, updatedStats);
  }

  // Initialize sample data
  private initializeSampleData() {
    // Initialize with sample district statistics
    const districts = [
      "Bengaluru Urban", "Mysuru", "Dharwad", "Ballari", "Belagavi",
      "Dakshina Kannada", "Hassan", "Kalaburagi", "Mandya", "Shivamogga"
    ];
    
    districts.forEach((district, i) => {
      const stats: DistrictStats = {
        id: this.districtStatsId++,
        district,
        totalSchools: 50 + Math.floor(Math.random() * 50),
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        avgResolutionTime: 0,
        topCategories: [],
        updatedAt: new Date()
      };
      this.districtStatistics.set(district, stats);
    });
  }
}

// Export a singleton instance
export const storage = new MemStorage();
