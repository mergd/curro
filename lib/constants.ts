// Helper functions to create validators from constants
import { v } from "convex/values";

export const POSTS_DIRECTORY = "blog";
export const SITE_NAME = "Template Blog";

// Scraping Configuration
export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

// Company-related constants
export const COMPANY_STAGES = [
  "pre-seed",
  "seed",
  "series-a",
  "series-b",
  "series-c",
  "series-d",
  "series-e",
  "growth",
  "pre-ipo",
  "public",
  "acquired",
] as const;

export const SOURCE_TYPES = ["ashby", "greenhouse", "other"] as const;

export const EMPLOYEE_COUNT_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
] as const;

// Company Categories and Subcategories
export const COMPANY_CATEGORIES = [
  "technology",
  "finance",
  "healthcare",
  "retail",
  "manufacturing",
  "education",
  "media",
  "real-estate",
  "transportation",
  "energy",
  "consulting",
  "government",
  "non-profit",
  "other",
] as const;

export const COMPANY_SUBCATEGORIES = {
  technology: [
    "saas",
    "fintech",
    "healthtech",
    "edtech",
    "proptech",
    "ai-ml",
    "blockchain",
    "cybersecurity",
    "devtools",
    "enterprise-software",
    "consumer-apps",
    "gaming",
    "hardware",
    "semiconductor",
    "cloud-infrastructure",
    "data-analytics",
    "social-media",
    "marketplace",
    "e-commerce-platform",
  ],
  finance: [
    "banking",
    "investment",
    "insurance",
    "payments",
    "lending",
    "wealth-management",
    "trading",
    "accounting",
    "financial-services",
  ],
  healthcare: [
    "pharmaceuticals",
    "medical-devices",
    "biotechnology",
    "hospitals",
    "telemedicine",
    "mental-health",
    "healthcare-services",
    "diagnostics",
  ],
  retail: [
    "e-commerce",
    "fashion",
    "grocery",
    "luxury",
    "home-goods",
    "electronics",
    "automotive",
    "beauty",
    "sports",
  ],
  manufacturing: [
    "automotive",
    "aerospace",
    "chemicals",
    "food-beverage",
    "textiles",
    "machinery",
    "electronics",
    "pharmaceuticals",
  ],
  education: [
    "k12",
    "higher-education",
    "online-learning",
    "corporate-training",
    "language-learning",
    "test-prep",
  ],
  media: [
    "entertainment",
    "news",
    "advertising",
    "publishing",
    "streaming",
    "podcasting",
    "social-media",
  ],
  "real-estate": [
    "residential",
    "commercial",
    "property-management",
    "construction",
    "architecture",
    "real-estate-tech",
  ],
  transportation: [
    "logistics",
    "shipping",
    "rideshare",
    "public-transit",
    "aviation",
    "automotive",
    "delivery",
  ],
  energy: [
    "renewable",
    "oil-gas",
    "utilities",
    "solar",
    "wind",
    "nuclear",
    "battery",
  ],
  consulting: [
    "management",
    "technology",
    "strategy",
    "operations",
    "hr",
    "financial",
  ],
  government: ["federal", "state", "local", "defense", "public-services"],
  "non-profit": [
    "charity",
    "foundation",
    "advocacy",
    "research",
    "social-services",
  ],
  other: ["misc"],
} as const;

// Refined company tags (more specific attributes)
export const COMPANY_TAGS = [
  "b2b",
  "b2c",
  "b2b2c",
  "enterprise",
  "sme",
  "consumer",
  "marketplace",
  "platform",
  "api-first",
  "mobile-first",
  "remote-first",
  "international",
  "venture-backed",
  "bootstrapped",
  "public-company",
  "unicorn",
  "fast-growing",
  "established",
  "startup",
  "scale-up",
] as const;

export const EDUCATION_LEVELS = [
  "high-school",
  "associates",
  "bachelors",
  "masters",
  "phd",
  "bootcamp",
  "self-taught",
  "no-requirement",
] as const;

export const ROLE_TYPES = [
  "software-engineering",
  "data-science",
  "product-management",
  "design",
  "marketing",
  "sales",
  "operations",
  "finance",
  "hr",
  "legal",
  "customer-success",
  "business-development",
  "general-apply",
] as const;

export const EMPLOYMENT_TYPES = [
  "permanent",
  "contract",
  "part-time",
  "temporary",
  "freelance",
  "internship",
] as const;

export const COMPENSATION_TYPES = [
  "annual",
  "hourly",
  "weekly",
  "monthly",
] as const;

export const REMOTE_OPTIONS = ["on-site", "remote", "hybrid"] as const;

export const APPLICATION_STATUSES = [
  "interested",
  "applied",
  "phone-screen",
  "technical-interview",
  "onsite-interview",
  "final-round",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export const APPLICATION_METHODS = [
  "company-website",
  "linkedin",
  "referral",
  "recruiter",
  "job-board",
  "other",
] as const;

export const INTERVIEW_TYPES = [
  "phone-screen",
  "technical",
  "behavioral",
  "system-design",
  "cultural-fit",
  "onsite",
  "final",
  "other",
] as const;

export const createUnionValidator = <T extends readonly string[]>(
  values: T,
) => {
  return v.union(...values.map(v.literal));
};

// Type helpers for frontend use
export type CompanyStage = (typeof COMPANY_STAGES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];
export type EmployeeCountRange = (typeof EMPLOYEE_COUNT_RANGES)[number];
export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];
export type CompanySubcategory =
  (typeof COMPANY_SUBCATEGORIES)[keyof typeof COMPANY_SUBCATEGORIES][number];
export type CompanyTag = (typeof COMPANY_TAGS)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type RoleType = (typeof ROLE_TYPES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type CompensationType = (typeof COMPENSATION_TYPES)[number];
export type RemoteOption = (typeof REMOTE_OPTIONS)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type ApplicationMethod = (typeof APPLICATION_METHODS)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];
