import type {
  EducationLevel,
  EmploymentType,
  RemoteOption,
  RoleType,
} from "@/lib/constants";

import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
} from "@/lib/constants";

import { z } from "zod";

export const onboardingSchema = z.object({
  // Basic info
  yearsOfExperience: z.number().min(0).max(50),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),

  // Current situation
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  isCurrentlyEmployed: z.boolean().default(false),

  // Preferences
  interestedRoleTypes: z
    .array(z.enum(ROLE_TYPES))
    .min(1, "Please select at least one role type"),
  preferredEmploymentTypes: z
    .array(z.enum(EMPLOYMENT_TYPES))
    .min(1, "Please select at least one employment type"),
  preferredRemoteOptions: z
    .array(z.enum(REMOTE_OPTIONS))
    .min(1, "Please select at least one remote option"),

  // Location
  currentLocation: z.string().min(1, "Please enter your current location"),
  openToRelocation: z.boolean().default(false),
  needsSponsorship: z.boolean().default(false),
  preferredTimezones: z.array(z.string()).optional(),

  // Goals
  lookingForInNextCompany: z
    .string()
    .min(10, "Please provide more details about what you're looking for"),
  desiredStartMonth: z
    .string()
    .min(1, "Please select when you'd like to start"),

  // Optional interests
  interests: z.array(z.string()).optional(),
  fourFacts: z.array(z.string()).optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
