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

// Complaint status colors
export const STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: "clock"
  },
  in_progress: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: "loader-2"
  },
  resolved: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: "check-circle"
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: "x-circle"
  },
  under_review: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: "search"
  },
} as const;

// Complaint categories
export const COMPLAINT_CATEGORIES = [
  "Infrastructure", 
  "Teaching Staff", 
  "Basic Amenities", 
  "Educational Materials", 
  "Administrative Issues",
  "Transportation",
  "Mid-day Meal",
  "Others"
] as const;

// Complaint category icons
export const CATEGORY_ICONS = {
  Infrastructure: "building",
  "Teaching Staff": "users",
  "Basic Amenities": "droplet",
  "Educational Materials": "book-open",
  "Administrative Issues": "clipboard",
  Transportation: "bus",
  "Mid-day Meal": "utensils",
  Others: "more-horizontal",
} as const;

// Districts in Karnataka
export const KARNATAKA_DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
  "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
  "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
] as const;

// Alumni expertise areas
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
] as const;

// Expertise area icons
export const EXPERTISE_ICONS = {
  "Career Guidance": "briefcase",
  "Higher Education": "graduation-cap",
  "Technology": "laptop",
  "Medicine": "stethoscope",
  "Engineering": "tool",
  "Arts & Humanities": "palette",
  "Government Services": "landmark",
  "Entrepreneurship": "lightbulb",
  "Science": "flask",
  "Sports": "dumbbell"
} as const;

// Karnataka themed colors
export const KARNATAKA_COLORS = {
  primary: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Karnataka yellow
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  secondary: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#DC2626", // Karnataka red
    600: "#B91C1C",
    700: "#991B1B",
    800: "#7F1D1D",
    900: "#713F3F",
  },
  accent: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#4F46E5", // Indigo
    600: "#4338CA",
    700: "#3730A3",
    800: "#312E81",
    900: "#1E1B4B",
  },
} as const;
