import {
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  COMPANY_SUBCATEGORIES,
  COMPANY_TAGS,
  EMPLOYEE_COUNT_RANGES,
  SOURCE_TYPES,
} from "@/lib/constants";

import { z } from "zod";

// Form schema
export const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional().or(z.literal("")),
  foundedYear: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  jobBoardUrl: z.string().url("Please enter a valid job board URL"),
  sourceType: z.enum(["ashby", "greenhouse", "other"]).optional(),
  numberOfEmployees: z.string().optional(),
  stage: z.enum(COMPANY_STAGES).optional(),
  category: z.array(z.string()).optional(),
  subcategory: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  recentFinancingAmount: z.string().optional(),
  recentFinancingDate: z.string().optional(),
  investors: z.array(z.string()).optional(),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;

// Utility functions
export const formatFinancingAmount = (value: string): string => {
  if (!value) return value;

  // Remove any existing formatting
  const cleanValue = value.replace(/[,$\s]/g, "");

  // Handle abbreviations
  const lowerValue = cleanValue.toLowerCase();
  let numValue = parseFloat(cleanValue);

  if (lowerValue.includes("m")) {
    numValue = parseFloat(cleanValue.replace(/[^0-9.]/g, "")) * 1000000;
  } else if (lowerValue.includes("b")) {
    numValue = parseFloat(cleanValue.replace(/[^0-9.]/g, "")) * 1000000000;
  } else if (lowerValue.includes("k")) {
    numValue = parseFloat(cleanValue.replace(/[^0-9.]/g, "")) * 1000;
  }

  // Format with commas
  if (!isNaN(numValue)) {
    return numValue.toLocaleString();
  }

  return value;
};

export const parseFinancingAmount = (value: string): number => {
  if (!value) return 0;

  // Remove currency symbols and commas, parse the number
  const cleanAmount = value.replace(/[$,\s]/g, "");
  let amount = parseFloat(cleanAmount);

  // Handle common abbreviations (M for million, B for billion, K for thousand)
  if (cleanAmount.toLowerCase().includes("m")) {
    amount = parseFloat(cleanAmount.replace(/[^0-9.]/g, "")) * 1000000;
  } else if (cleanAmount.toLowerCase().includes("b")) {
    amount = parseFloat(cleanAmount.replace(/[^0-9.]/g, "")) * 1000000000;
  } else if (cleanAmount.toLowerCase().includes("k")) {
    amount = parseFloat(cleanAmount.replace(/[^0-9.]/g, "")) * 1000;
  }

  return amount;
};

export const getAvailableSubcategories = (selectedCategories: string[]) => {
  return selectedCategories.flatMap((category) => {
    const subcats =
      COMPANY_SUBCATEGORIES[category as keyof typeof COMPANY_SUBCATEGORIES];
    return subcats
      ? subcats.map((sub) => ({
          label: sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, " "),
          value: sub,
        }))
      : [];
  });
};

export const formatCategoryLabels = (items: readonly string[]) => {
  return items.map((item) => ({
    label: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, " "),
    value: item,
  }));
};

// Data options for form fields
export const LOCATION_OPTIONS = [
  { label: "San Francisco, USA", value: "San Francisco, USA" },
  { label: "New York, USA", value: "New York, USA" },
  { label: "London, GBR", value: "London, GBR" },
  { label: "Remote", value: "Remote" },
  { label: "Los Angeles, USA", value: "Los Angeles, USA" },
  { label: "Chicago, USA", value: "Chicago, USA" },
  { label: "Boston, USA", value: "Boston, USA" },
  { label: "Seattle, USA", value: "Seattle, USA" },
  { label: "Austin, USA", value: "Austin, USA" },
  { label: "Toronto, CAN", value: "Toronto, CAN" },
  { label: "Singapore, SGP", value: "Singapore, SGP" },
];

export const INVESTOR_OPTIONS = [
  { label: "Sequoia Capital", value: "Sequoia Capital" },
  { label: "Andreessen Horowitz", value: "Andreessen Horowitz" },
  { label: "Y Combinator", value: "Y Combinator" },
  { label: "Accel", value: "Accel" },
  { label: "Greylock Partners", value: "Greylock Partners" },
  { label: "Kleiner Perkins", value: "Kleiner Perkins" },
  { label: "NEA", value: "NEA" },
  { label: "Benchmark", value: "Benchmark" },
  { label: "General Catalyst", value: "General Catalyst" },
  { label: "Bessemer Venture Partners", value: "Bessemer Venture Partners" },
  { label: "First Round Capital", value: "First Round Capital" },
  { label: "Founders Fund", value: "Founders Fund" },
  { label: "GV", value: "GV" },
  { label: "Intel Capital", value: "Intel Capital" },
  { label: "Khosla Ventures", value: "Khosla Ventures" },
  {
    label: "Lightspeed Venture Partners",
    value: "Lightspeed Venture Partners",
  },
  { label: "Redpoint Ventures", value: "Redpoint Ventures" },
  { label: "Union Square Ventures", value: "Union Square Ventures" },
];

// Transform company data for form defaults
export const getCompanyFormDefaults = (
  company?: any,
): Partial<CompanyFormData> => {
  if (!company) {
    return {
      name: "",
      description: "",
      foundedYear: "",
      website: "",
      logoUrl: "",
      jobBoardUrl: "",
      sourceType: undefined,
      numberOfEmployees: undefined,
      stage: undefined,
      category: [],
      subcategory: [],
      tags: [],
      locations: [],
      recentFinancingAmount: "",
      recentFinancingDate: "",
      investors: [],
    };
  }

  return {
    name: company.name || "",
    description: company.description || "",
    foundedYear: company.foundedYear?.toString() || "",
    website: company.website || "",
    logoUrl: company.logoUrl || "",
    jobBoardUrl: company.jobBoardUrl || "",
    sourceType: company.sourceType || "other",
    numberOfEmployees: company.numberOfEmployees || "",
    stage: company.stage || "",
    category: company.category || [],
    subcategory: company.subcategory || [],
    tags: company.tags || [],
    locations: company.locations || [],
    recentFinancingAmount: company.recentFinancing?.amount
      ? company.recentFinancing.amount.toLocaleString()
      : "",
    recentFinancingDate: company.recentFinancing?.date || "",
    investors: company.investors || [],
  };
};

// Transform form data for submission
export const transformFormDataForSubmission = (data: CompanyFormData) => {
  // Parse and format the financing amount
  let recentFinancing = undefined;
  if (data.recentFinancingAmount && data.recentFinancingDate) {
    const amount = parseFinancingAmount(data.recentFinancingAmount);
    recentFinancing = {
      amount: amount,
      date: data.recentFinancingDate,
    };
  }

  return {
    name: data.name,
    description: data.description || undefined,
    foundedYear:
      data.foundedYear && data.foundedYear.trim()
        ? parseInt(data.foundedYear, 10)
        : undefined,
    website: data.website || undefined,
    logoUrl: data.logoUrl || undefined,
    jobBoardUrl: data.jobBoardUrl,
    sourceType: data.sourceType,
    numberOfEmployees: data.numberOfEmployees,
    stage: data.stage,
    category: data.category?.length ? data.category : undefined,
    subcategory: data.subcategory?.length ? data.subcategory : undefined,
    tags: data.tags?.length ? data.tags : undefined,
    locations: data.locations?.length ? data.locations : undefined,
    recentFinancing,
    investors: data.investors?.length ? data.investors : undefined,
  };
};
