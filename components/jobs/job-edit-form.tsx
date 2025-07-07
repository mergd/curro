"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FormActions,
  FormGrid,
  FormLayout,
  FormSection,
} from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-tag-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagCombobox } from "@/components/ui/tag-combobox";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  COMPENSATION_TYPES,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  LOCATION_HIERARCHY,
  MAJOR_CITIES,
  REMOTE_OPTIONS,
  ROLE_TYPES,
  TIMEZONES,
} from "@/lib/constants";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  yearsOfExperience: z
    .object({
      min: z.number().min(0, "Minimum experience must be 0 or greater"),
      max: z.number().optional(),
    })
    .optional(),
  roleType: z.enum(ROLE_TYPES).optional(),
  roleSubcategory: z.string().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  internshipRequirements: z
    .object({
      graduationDate: z.string().optional(),
      eligiblePrograms: z.array(z.string()).optional(),
      additionalRequirements: z.string().optional(),
    })
    .optional(),
  additionalRequirements: z.string().optional(),
  compensation: z
    .object({
      type: z.enum(COMPENSATION_TYPES),
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  remoteOptions: z.enum(REMOTE_OPTIONS).optional(),
  remoteTimezonePreferences: z.array(z.string()).optional(),
  equity: z
    .object({
      offered: z.boolean(),
      percentage: z.number().optional(),
      details: z.string().optional(),
    })
    .optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobEditFormProps {
  job: Doc<"jobs">;
  onCancel: () => void;
  onSave: () => void;
}

export function JobEditForm({ job, onCancel, onSave }: JobEditFormProps) {
  const updateJob = useMutation(api.jobs.update);
  const [showInternshipFields, setShowInternshipFields] = useState(
    job.employmentType === "Internship",
  );
  const [showEquityFields, setShowEquityFields] = useState(
    job.equity?.offered ?? false,
  );

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      locations: job.locations,
      educationLevel: job.educationLevel as any,
      yearsOfExperience: job.yearsOfExperience,
      roleType: job.roleType as any,
      roleSubcategory: job.roleSubcategory,
      employmentType: job.employmentType as any,
      internshipRequirements: job.internshipRequirements,
      additionalRequirements: job.additionalRequirements,
      compensation: job.compensation as any,
      remoteOptions: job.remoteOptions as any,
      remoteTimezonePreferences: job.remoteTimezonePreferences,
      equity: job.equity,
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    try {
      await updateJob({
        id: job._id,
        ...values,
      });
      toast.success("Job updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to update job");
      console.error(error);
    }
  };

  // Create options for dropdowns
  const locationOptions = MAJOR_CITIES.map((city) => ({
    label: city,
    value: city,
  }));

  const timezoneOptions = TIMEZONES.map((tz) => ({
    label: tz.label,
    value: tz.value,
  }));

  const internshipProgramOptions = [
    { label: "Undergraduate", value: "undergraduate" },
    { label: "Graduate", value: "graduate" },
    { label: "PhD", value: "phd" },
    { label: "Bootcamp", value: "bootcamp" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormLayout>
          <FormSection
            title="Basic Information"
            description="Core details of the job posting."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Job Classification"
            description="Role type, employment details, and requirements."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="roleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleSubcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Subcategory</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., fullstack, backend, frontend"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowInternshipFields(value === "Internship");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Experience & Requirements"
            description="Experience requirements and additional qualifications."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="yearsOfExperience.min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearsOfExperience.max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalRequirements"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Additional Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Any additional requirements or qualifications..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          {showInternshipFields && (
            <FormSection
              title="Internship Details"
              description="Specific requirements for internship positions."
            >
              <FormGrid>
                <FormField
                  control={form.control}
                  name="internshipRequirements.graduationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Graduation Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., May 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="internshipRequirements.eligiblePrograms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligible Programs</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={internshipProgramOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select eligible programs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="internshipRequirements.additionalRequirements"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Additional Internship Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Any specific requirements for interns..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>
          )}

          <FormSection
            title="Location & Remote Work"
            description="Job locations and remote work options."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locations</FormLabel>
                    <FormControl>
                      <TagCombobox
                        options={locationOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Add job locations"
                        allowCustom={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remoteOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote Work Options</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select remote option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REMOTE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remoteTimezonePreferences"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Remote Timezone Preferences</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={timezoneOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select preferred timezones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Compensation"
            description="Salary and compensation details."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="compensation.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compensation Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select compensation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPENSATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compensation.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., USD, EUR, GBP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compensation.min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Compensation</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compensation.max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Compensation</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Equity & Benefits"
            description="Equity compensation and additional benefits."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="equity.offered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equity Offered</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const offered = value === "true";
                        field.onChange(offered);
                        setShowEquityFields(offered);
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equity option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showEquityFields && (
                <>
                  <FormField
                    control={form.control}
                    name="equity.percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equity Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              )
                            }
                            value={field.value || ""}
                            placeholder="e.g., 0.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equity.details"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Equity Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Additional equity details..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </FormGrid>
          </FormSection>

          <FormActions>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save Changes
            </Button>
          </FormActions>
        </FormLayout>
      </form>
    </Form>
  );
}
