/**
 * Simple translation utility for English and Kannada languages
 * In a production app, you would use a proper i18n library like i18next
 */

type TranslationKey = 
  | "appName"
  | "tagline"
  | "loginStudent"
  | "loginSchool"
  | "loginAuthority"
  | "email"
  | "password"
  | "rememberMe"
  | "forgotPassword"
  | "login"
  | "register"
  | "noAccount"
  | "dashboard"
  | "complaints"
  | "alumniConnect"
  | "resources"
  | "profile"
  | "welcome"
  | "newComplaint"
  | "connectAlumni"
  | "overview"
  | "activeComplaints"
  | "resolvedIssues"
  | "connections"
  | "viewAll"
  | "viewHistory"
  | "findMoreAlumni"
  | "recentComplaints"
  | "submit"
  | "cancel"
  | "category"
  | "title"
  | "description"
  | "uploadEvidence"
  | "aiAssistant"
  | "analyzeWithAi"
  | "complaintCategories"
  | "infrastructureCategory"
  | "teachingStaffCategory"
  | "basicAmenitiesCategory"
  | "educationalMaterialsCategory"
  | "administrativeIssuesCategory"
  | "transportationCategory"
  | "midDayMealCategory"
  | "othersCategory"
  | "status"
  | "pending"
  | "inProgress"
  | "resolved"
  | "rejected"
  | "underReview"
  | "requestMentorship"
  | "alumniProfile"
  | "logout"
  | "schoolAdmin"
  | "authority"
  | "student"
  | "parent"
  | "school"
  | "district"
  | "classInfo"
  | "fieldOfInterest"
  | "questionTitle"
  | "questionDetails"
  | "makePublic"
  | "makePublicDescription"
  | "findMatchesWithAi"
  | "districtInsights"
  | "schoolsCount"
  | "complaintsCount"
  | "resolvedCount"
  | "avgResolutionTime"
  | "topCategories"
  | "days";

const translations: Record<'en' | 'kn', Record<TranslationKey, string>> = {
  en: {
    appName: "EduAudit",
    tagline: "Empowering Students & Parents across Karnataka",
    loginStudent: "Student/Parent",
    loginSchool: "School Admin",
    loginAuthority: "Authority",
    email: "Email or Student ID",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    login: "Login",
    register: "Register",
    noAccount: "Don't have an account?",
    dashboard: "Dashboard",
    complaints: "Complaints",
    alumniConnect: "Alumni Connect",
    resources: "Resources",
    profile: "Profile",
    welcome: "Welcome back",
    newComplaint: "New Complaint",
    connectAlumni: "Connect with Alumni",
    overview: "Overview",
    activeComplaints: "Active Complaints",
    resolvedIssues: "Resolved Issues",
    connections: "Alumni Connections",
    viewAll: "View all",
    viewHistory: "View history",
    findMoreAlumni: "Find more alumni",
    recentComplaints: "Recent Complaints",
    submit: "Submit",
    cancel: "Cancel",
    category: "Category",
    title: "Title",
    description: "Description",
    uploadEvidence: "Upload Evidence (optional)",
    aiAssistant: "AI Assistant: Based on your description, I can help categorize your complaint for faster resolution. Just describe your issue, and I'll analyze it.",
    analyzeWithAi: "Analyze with AI",
    complaintCategories: "Complaint Categories",
    infrastructureCategory: "Infrastructure",
    teachingStaffCategory: "Teaching Staff",
    basicAmenitiesCategory: "Basic Amenities",
    educationalMaterialsCategory: "Educational Materials",
    administrativeIssuesCategory: "Administrative Issues",
    transportationCategory: "Transportation",
    midDayMealCategory: "Mid-day Meal",
    othersCategory: "Others",
    status: "Status",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    underReview: "Under Review",
    requestMentorship: "Request Mentorship",
    alumniProfile: "Alumni Profile",
    logout: "Logout",
    schoolAdmin: "School Administrator",
    authority: "Education Authority",
    student: "Student",
    parent: "Parent",
    school: "School",
    district: "District",
    classInfo: "Class",
    fieldOfInterest: "Field of Interest",
    questionTitle: "Question Title",
    questionDetails: "Question Details",
    makePublic: "Make my question public",
    makePublicDescription: "Other students can see your question and the answers",
    findMatchesWithAi: "Find Matches with AI",
    districtInsights: "District Insights",
    schoolsCount: "Total Schools",
    complaintsCount: "Total Complaints",
    resolvedCount: "Resolved Complaints",
    avgResolutionTime: "Avg. Resolution Time",
    topCategories: "Top Categories",
    days: "days"
  },
  kn: {
    appName: "ಎಡ್ಯುಆಡಿಟ್",
    tagline: "ಕರ್ನಾಟಕದಾದ್ಯಂತ ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಪೋಷಕರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು",
    loginStudent: "ವಿದ್ಯಾರ್ಥಿ/ಪೋಷಕ",
    loginSchool: "ಶಾಲಾ ಆಡಳಿತಗಾರ",
    loginAuthority: "ಅಧಿಕಾರಿ",
    email: "ಇಮೇಲ್ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿ ಐಡಿ",
    password: "ಪಾಸ್ವರ್ಡ್",
    rememberMe: "ನನ್ನನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ",
    forgotPassword: "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
    dashboard: "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
    complaints: "ದೂರುಗಳು",
    alumniConnect: "ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಪರ್ಕ",
    resources: "ಸಂಪನ್ಮೂಲಗಳು",
    profile: "ಪ್ರೊಫೈಲ್",
    welcome: "ಮರಳಿ ಸ್ವಾಗತ",
    newComplaint: "ಹೊಸ ದೂರು",
    connectAlumni: "ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",
    overview: "ಅವಲೋಕನ",
    activeComplaints: "ಸಕ್ರಿಯ ದೂರುಗಳು",
    resolvedIssues: "ಪರಿಹರಿಸಿದ ಸಮಸ್ಯೆಗಳು",
    connections: "ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿ ಸಂಪರ್ಕಗಳು",
    viewAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    viewHistory: "ಇತಿಹಾಸವನ್ನು ನೋಡಿ",
    findMoreAlumni: "ಹೆಚ್ಚಿನ ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಹುಡುಕಿ",
    recentComplaints: "ಇತ್ತೀಚಿನ ದೂರುಗಳು",
    submit: "ಸಲ್ಲಿಸು",
    cancel: "ರದ್ದುಮಾಡಿ",
    category: "ವರ್ಗ",
    title: "ಶೀರ್ಷಿಕೆ",
    description: "ವಿವರಣೆ",
    uploadEvidence: "ಸಾಕ್ಷ್ಯವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)",
    aiAssistant: "AI ಸಹಾಯಕ: ನಿಮ್ಮ ವಿವರಣೆಯ ಆಧಾರದ ಮೇಲೆ, ವೇಗದ ಪರಿಹಾರಕ್ಕಾಗಿ ನಿಮ್ಮ ದೂರನ್ನು ವರ್ಗೀಕರಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ, ನಾನು ಅದನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತೇನೆ.",
    analyzeWithAi: "AI ನೊಂದಿಗೆ ವಿಶ್ಲೇಷಿಸಿ",
    complaintCategories: "ದೂರು ವರ್ಗಗಳು",
    infrastructureCategory: "ಮೂಲಸೌಕರ್ಯ",
    teachingStaffCategory: "ಬೋಧಕ ಸಿಬ್ಬಂದಿ",
    basicAmenitiesCategory: "ಮೂಲಭೂತ ಸೌಲಭ್ಯಗಳು",
    educationalMaterialsCategory: "ಶೈಕ್ಷಣಿಕ ಸಾಮಗ್ರಿಗಳು",
    administrativeIssuesCategory: "ಆಡಳಿತಾತ್ಮಕ ಸಮಸ್ಯೆಗಳು",
    transportationCategory: "ಸಾರಿಗೆ",
    midDayMealCategory: "ಮಧ್ಯಾಹ್ನದ ಊಟ",
    othersCategory: "ಇತರೆ",
    status: "ಸ್ಥಿತಿ",
    pending: "ಬಾಕಿ ಇದೆ",
    inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    underReview: "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
    requestMentorship: "ಮಾರ್ಗದರ್ಶನ ಕೋರಿ",
    alumniProfile: "ಹಳೆಯ ವಿದ್ಯಾರ್ಥಿ ಪ್ರೊಫೈಲ್",
    logout: "ಲಾಗ್ ಔಟ್",
    schoolAdmin: "ಶಾಲಾ ಆಡಳಿತಗಾರ",
    authority: "ಶಿಕ್ಷಣ ಪ್ರಾಧಿಕಾರ",
    student: "ವಿದ್ಯಾರ್ಥಿ",
    parent: "ಪೋಷಕ",
    school: "ಶಾಲೆ",
    district: "ಜಿಲ್ಲೆ",
    classInfo: "ತರಗತಿ",
    fieldOfInterest: "ಆಸಕ್ತಿಯ ಕ್ಷೇತ್ರ",
    questionTitle: "ಪ್ರಶ್ನೆಯ ಶೀರ್ಷಿಕೆ",
    questionDetails: "ಪ್ರಶ್ನೆಯ ವಿವರಗಳು",
    makePublic: "ನನ್ನ ಪ್ರಶ್ನೆಯನ್ನು ಸಾರ್ವಜನಿಕಗೊಳಿಸಿ",
    makePublicDescription: "ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳು ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಮತ್ತು ಉತ್ತರಗಳನ್ನು ನೋಡಬಹುದು",
    findMatchesWithAi: "AI ನೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ಹುಡುಕಿ",
    districtInsights: "ಜಿಲ್ಲಾ ಒಳನೋಟಗಳು",
    schoolsCount: "ಒಟ್ಟು ಶಾಲೆಗಳು",
    complaintsCount: "ಒಟ್ಟು ದೂರುಗಳು",
    resolvedCount: "ಪರಿಹರಿಸಿದ ದೂರುಗಳು",
    avgResolutionTime: "ಸರಾಸರಿ ಪರಿಹಾರ ಸಮಯ",
    topCategories: "ಪ್ರಮುಖ ವರ್ಗಗಳು",
    days: "ದಿನಗಳು"
  }
};

// Language context
let currentLanguage: 'en' | 'kn' = 'en';

export function setLanguage(lang: 'en' | 'kn'): void {
  currentLanguage = lang;
}

export function getLanguage(): 'en' | 'kn' {
  return currentLanguage;
}

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (currentLanguage === 'kn') {
    // Format date in Kannada style
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return d.toLocaleDateString('kn-IN', options);
  }
  
  // Format date in English style
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return d.toLocaleDateString('en-IN', options);
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (currentLanguage === 'kn') {
    if (diffDays === 0) return "ಇಂದು";
    if (diffDays === 1) return "ನಿನ್ನೆ";
    if (diffDays < 7) return `${diffDays} ದಿನಗಳ ಹಿಂದೆ`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ವಾರಗಳ ಹಿಂದೆ`;
    return `${Math.floor(diffDays / 30)} ತಿಂಗಳುಗಳ ಹಿಂದೆ`;
  }
  
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
