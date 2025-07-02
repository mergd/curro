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
  { label: "Software Engineering", value: "Software Engineering" },
  { label: "Data Science", value: "Data Science" },
  { label: "Product Management", value: "Product Management" },
  { label: "Design", value: "Design" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "Operations", value: "Operations" },
  { label: "Finance", value: "Finance" },
  { label: "HR", value: "HR" },
  { label: "Legal", value: "Legal" },
  { label: "Customer Success", value: "Customer Success" },
  { label: "Business Development", value: "Business Development" },
  { label: "General Apply", value: "General Apply" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Permanent", value: "Permanent" },
  { label: "Contract", value: "Contract" },
  { label: "Part-Time", value: "Part-Time" },
  { label: "Temporary", value: "Temporary" },
  { label: "Freelance", value: "Freelance" },
  { label: "Internship", value: "Internship" },
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

// Location types
export type Country = (typeof COUNTRIES)[number];
export type CountryCode = Country["code"];
export type MajorCity = (typeof MAJOR_CITIES)[number];
export type LocationHierarchy = typeof LOCATION_HIERARCHY;
export type Timezone = (typeof TIMEZONES)[number];

// Location hierarchy with starred popular tech hubs
export const LOCATION_HIERARCHY = {
  USA: {
    name: "United States",
    cities: [
      { name: "San Francisco", starred: true },
      { name: "San Jose", starred: true },
      { name: "Seattle", starred: true },
      { name: "New York City", starred: true },
      { name: "Boston", starred: true },
      { name: "Austin", starred: true },
      { name: "Los Angeles", starred: false },
      { name: "Chicago", starred: false },
      { name: "Denver", starred: false },
      { name: "Washington", starred: false },
      { name: "Atlanta", starred: false },
      { name: "Raleigh", starred: false },
      { name: "Portland", starred: false },
      { name: "Miami", starred: false },
      { name: "Dallas", starred: false },
      { name: "Phoenix", starred: false },
      { name: "Philadelphia", starred: false },
      { name: "Detroit", starred: false },
    ],
  },
  GBR: {
    name: "United Kingdom",
    cities: [
      { name: "London", starred: true },
      { name: "Edinburgh", starred: false },
      { name: "Manchester", starred: false },
      { name: "Birmingham", starred: false },
      { name: "Cambridge", starred: true },
      { name: "Oxford", starred: false },
    ],
  },
  CAN: {
    name: "Canada",
    cities: [
      { name: "Toronto", starred: true },
      { name: "Vancouver", starred: true },
      { name: "Montreal", starred: false },
      { name: "Calgary", starred: false },
      { name: "Ottawa", starred: false },
      { name: "Waterloo", starred: true },
    ],
  },
  DEU: {
    name: "Germany",
    cities: [
      { name: "Berlin", starred: true },
      { name: "Munich", starred: true },
      { name: "Frankfurt", starred: false },
      { name: "Hamburg", starred: false },
      { name: "Stuttgart", starred: false },
      { name: "Cologne", starred: false },
    ],
  },
  FRA: {
    name: "France",
    cities: [
      { name: "Paris", starred: true },
      { name: "Lyon", starred: false },
      { name: "Toulouse", starred: false },
      { name: "Nice", starred: false },
      { name: "Bordeaux", starred: false },
    ],
  },
  NLD: {
    name: "Netherlands",
    cities: [
      { name: "Amsterdam", starred: true },
      { name: "Rotterdam", starred: false },
      { name: "The Hague", starred: false },
      { name: "Eindhoven", starred: true },
    ],
  },
  CHE: {
    name: "Switzerland",
    cities: [
      { name: "Zurich", starred: true },
      { name: "Geneva", starred: false },
      { name: "Basel", starred: false },
    ],
  },
  SWE: {
    name: "Sweden",
    cities: [{ name: "Stockholm", starred: true }],
  },
  DNK: {
    name: "Denmark",
    cities: [{ name: "Copenhagen", starred: true }],
  },
  FIN: {
    name: "Finland",
    cities: [{ name: "Helsinki", starred: true }],
  },
  IRL: {
    name: "Ireland",
    cities: [{ name: "Dublin", starred: true }],
  },
  NOR: {
    name: "Norway",
    cities: [{ name: "Oslo", starred: true }],
  },
  BEL: {
    name: "Belgium",
    cities: [{ name: "Brussels", starred: true }],
  },
  ESP: {
    name: "Spain",
    cities: [
      { name: "Barcelona", starred: true },
      { name: "Madrid", starred: true },
    ],
  },
  ITA: {
    name: "Italy",
    cities: [
      { name: "Milan", starred: true },
      { name: "Rome", starred: false },
    ],
  },
  PRT: {
    name: "Portugal",
    cities: [{ name: "Lisbon", starred: true }],
  },
  POL: {
    name: "Poland",
    cities: [{ name: "Warsaw", starred: true }],
  },
  CZE: {
    name: "Czech Republic",
    cities: [{ name: "Prague", starred: true }],
  },
  EST: {
    name: "Estonia",
    cities: [{ name: "Tallinn", starred: true }],
  },
  ISR: {
    name: "Israel",
    cities: [
      { name: "Tel Aviv", starred: true },
      { name: "Jerusalem", starred: false },
      { name: "Haifa", starred: false },
    ],
  },
  SGP: {
    name: "Singapore",
    cities: [{ name: "Singapore", starred: true }],
  },
  JPN: {
    name: "Japan",
    cities: [{ name: "Tokyo", starred: true }],
  },
  KOR: {
    name: "South Korea",
    cities: [{ name: "Seoul", starred: true }],
  },
  HKG: {
    name: "Hong Kong",
    cities: [{ name: "Hong Kong", starred: true }],
  },
  TWN: {
    name: "Taiwan",
    cities: [{ name: "Taipei", starred: true }],
  },
  AUS: {
    name: "Australia",
    cities: [
      { name: "Sydney", starred: true },
      { name: "Melbourne", starred: true },
    ],
  },
  NZL: {
    name: "New Zealand",
    cities: [{ name: "Auckland", starred: true }],
  },
  IND: {
    name: "India",
    cities: [
      { name: "Bangalore", starred: true },
      { name: "Mumbai", starred: true },
      { name: "Delhi", starred: true },
      { name: "Hyderabad", starred: true },
      { name: "Chennai", starred: false },
      { name: "Pune", starred: false },
    ],
  },
  CHN: {
    name: "China",
    cities: [
      { name: "Shanghai", starred: true },
      { name: "Beijing", starred: true },
      { name: "Shenzhen", starred: true },
      { name: "Hangzhou", starred: true },
    ],
  },
  ARE: {
    name: "United Arab Emirates",
    cities: [
      { name: "Dubai", starred: true },
      { name: "Abu Dhabi", starred: false },
    ],
  },
  BRA: {
    name: "Brazil",
    cities: [{ name: "São Paulo", starred: true }],
  },
  MEX: {
    name: "Mexico",
    cities: [{ name: "Mexico City", starred: true }],
  },
  ARG: {
    name: "Argentina",
    cities: [{ name: "Buenos Aires", starred: true }],
  },
  CHL: {
    name: "Chile",
    cities: [{ name: "Santiago", starred: true }],
  },
  COL: {
    name: "Colombia",
    cities: [{ name: "Bogotá", starred: true }],
  },
  ZAF: {
    name: "South Africa",
    cities: [
      { name: "Cape Town", starred: true },
      { name: "Johannesburg", starred: false },
    ],
  },
  TUR: {
    name: "Turkey",
    cities: [{ name: "Istanbul", starred: true }],
  },
  RUS: {
    name: "Russia",
    cities: [{ name: "Moscow", starred: true }],
  },
  UKR: {
    name: "Ukraine",
    cities: [{ name: "Kyiv", starred: true }],
  },
} as const;

// Extract countries and cities for compatibility
export const COUNTRIES = Object.entries(LOCATION_HIERARCHY).map(
  ([code, data]) => ({
    code: code as keyof typeof LOCATION_HIERARCHY,
    name: data.name,
  }),
);

export const MAJOR_CITIES = Object.values(LOCATION_HIERARCHY).flatMap(
  (country) => country.cities.map((city) => city.name),
);

// Common timezones for remote work
export const TIMEZONES = [
  { value: "UTC-8", label: "Pacific Time (UTC-8)", region: "Americas" },
  { value: "UTC-7", label: "Mountain Time (UTC-7)", region: "Americas" },
  { value: "UTC-6", label: "Central Time (UTC-6)", region: "Americas" },
  { value: "UTC-5", label: "Eastern Time (UTC-5)", region: "Americas" },
  { value: "UTC-3", label: "Argentina Time (UTC-3)", region: "Americas" },
  { value: "UTC+0", label: "Greenwich Mean Time (UTC+0)", region: "Europe" },
  { value: "UTC+1", label: "Central European Time (UTC+1)", region: "Europe" },
  { value: "UTC+2", label: "Eastern European Time (UTC+2)", region: "Europe" },
  { value: "UTC+3", label: "Moscow Time (UTC+3)", region: "Europe/Asia" },
  {
    value: "UTC+4",
    label: "Gulf Standard Time (UTC+4)",
    region: "Middle East",
  },
  {
    value: "UTC+5:30",
    label: "India Standard Time (UTC+5:30)",
    region: "Asia",
  },
  { value: "UTC+8", label: "China Standard Time (UTC+8)", region: "Asia" },
  { value: "UTC+9", label: "Japan Standard Time (UTC+9)", region: "Asia" },
  {
    value: "UTC+10",
    label: "Australian Eastern Time (UTC+10)",
    region: "Asia-Pacific",
  },
  {
    value: "UTC+12",
    label: "New Zealand Time (UTC+12)",
    region: "Asia-Pacific",
  },
] as const;

// Filter constants
export const ALL_FILTER_VALUE = "all" as const;
