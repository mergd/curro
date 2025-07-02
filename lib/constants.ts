import { v } from "convex/values";

export const SITE_NAME = "curro";

// Scraping Configuration
export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

// Company-related constants
export const COMPANY_STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Series E",
  "Growth",
  "Pre-IPO",
  "Public",
  "Acquired",
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
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Education",
  "Media",
  "Real Estate",
  "Transportation",
  "Energy",
  "Consulting",
  "Government",
  "Non-Profit",
  "Other",
] as const;

export const COMPANY_SUBCATEGORIES = {
  Technology: [
    "SaaS",
    "FinTech",
    "HealthTech",
    "EdTech",
    "PropTech",
    "AI/ML",
    "Blockchain",
    "Cybersecurity",
    "DevTools",
    "Enterprise Software",
    "Consumer Apps",
    "Gaming",
    "Hardware",
    "Semiconductor",
    "Cloud Infrastructure",
    "Data Analytics",
    "Social Media",
    "Marketplace",
    "E-commerce Platform",
  ],
  Finance: [
    "Banking",
    "Investment",
    "Insurance",
    "Payments",
    "Lending",
    "Wealth Management",
    "Trading",
    "Accounting",
    "Financial Services",
  ],
  Healthcare: [
    "Pharmaceuticals",
    "Medical Devices",
    "Biotechnology",
    "Hospitals",
    "Telemedicine",
    "Mental Health",
    "Healthcare Services",
    "Diagnostics",
  ],
  Retail: [
    "E-commerce",
    "Fashion",
    "Grocery",
    "Luxury",
    "Home Goods",
    "Electronics",
    "Automotive",
    "Beauty",
    "Sports",
  ],
  Manufacturing: [
    "Automotive",
    "Aerospace",
    "Chemicals",
    "Food & Beverage",
    "Textiles",
    "Machinery",
    "Electronics",
    "Pharmaceuticals",
  ],
  Education: [
    "K-12",
    "Higher Education",
    "Online Learning",
    "Corporate Training",
    "Language Learning",
    "Test Prep",
  ],
  Media: [
    "Entertainment",
    "News",
    "Advertising",
    "Publishing",
    "Streaming",
    "Podcasting",
    "Social Media",
  ],
  "Real Estate": [
    "Residential",
    "Commercial",
    "Property Management",
    "Construction",
    "Architecture",
    "Real Estate Tech",
  ],
  Transportation: [
    "Logistics",
    "Shipping",
    "Rideshare",
    "Public Transit",
    "Aviation",
    "Automotive",
    "Delivery",
  ],
  Energy: [
    "Renewable",
    "Oil & Gas",
    "Utilities",
    "Solar",
    "Wind",
    "Nuclear",
    "Battery",
  ],
  Consulting: [
    "Management",
    "Technology",
    "Strategy",
    "Operations",
    "HR",
    "Financial",
  ],
  Government: ["Federal", "State", "Local", "Defense", "Public Services"],
  "Non-Profit": [
    "Charity",
    "Foundation",
    "Advocacy",
    "Research",
    "Social Services",
  ],
  Other: ["Misc"],
} as const;

// Refined company tags (more specific attributes)
export const COMPANY_TAGS = [
  "B2B",
  "B2C",
  "B2B2C",
  "Enterprise",
  "SME",
  "Consumer",
  "Marketplace",
  "Platform",
  "API First",
  "Mobile First",
  "Remote First",
  "International",
  "Venture Backed",
  "Bootstrapped",
  "Public Company",
  "Unicorn",
  "Fast Growing",
  "Established",
  "Startup",
  "Scale-up",
] as const;

export const EDUCATION_LEVELS = [
  "High School",
  "Associates",
  "Bachelors",
  "Masters",
  "PhD",
  "Bootcamp",
  "Self-Taught",
  "No Requirement",
] as const;

export const ROLE_TYPES = [
  "Software Engineering",
  "Data Science",
  "Product Management",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Legal",
  "Customer Success",
  "Business Development",
  "General Apply",
] as const;

export const EMPLOYMENT_TYPES = [
  "Permanent",
  "Contract",
  "Part-Time",
  "Temporary",
  "Freelance",
  "Internship",
] as const;

// Frontend filter options with display labels and values
export const ROLE_TYPE_OPTIONS = [
  { label: "Software Engineering", value: "software-engineering" },
  { label: "Data Science", value: "data-science" },
  { label: "Product Management", value: "product-management" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Operations", value: "operations" },
  { label: "Finance", value: "finance" },
  { label: "HR", value: "hr" },
  { label: "Legal", value: "legal" },
  { label: "Customer Success", value: "customer-success" },
  { label: "Business Development", value: "business-development" },
  { label: "General Apply", value: "general-apply" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Permanent", value: "permanent" },
  { label: "Contract", value: "contract" },
  { label: "Part-time", value: "part-time" },
  { label: "Temporary", value: "temporary" },
  { label: "Freelance", value: "freelance" },
  { label: "Internship", value: "internship" },
] as const;

export const COMPENSATION_TYPES = [
  "annual",
  "hourly",
  "weekly",
  "monthly",
] as const;

export const REMOTE_OPTIONS = ["On-Site", "Remote", "Hybrid"] as const;

export const APPLICATION_STATUSES = [
  "Interested",
  "Applied",
  "Phone Screen",
  "Technical Interview",
  "Onsite Interview",
  "Final Round",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
] as const;

export const APPLICATION_METHODS = [
  "Company Website",
  "LinkedIn",
  "Referral",
  "Recruiter",
  "Job Board",
  "Other",
] as const;

export const INTERVIEW_TYPES = [
  "Phone Screen",
  "Technical",
  "Behavioral",
  "System Design",
  "Cultural Fit",
  "Onsite",
  "Final",
  "Other",
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

// Filter constants
export const ALL_FILTER_VALUE = "all" as const;
