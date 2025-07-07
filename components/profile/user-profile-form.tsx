"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CityInput } from "@/components/ui/city-input";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { MultiSelect } from "@/components/ui/multi-tag-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPE_OPTIONS,
  REMOTE_OPTIONS,
  ROLE_TYPE_OPTIONS,
  TIMEZONES,
} from "@/lib/constants";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, FileTextIcon, UploadIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  // Professional Background
  yearsOfExperience: z.number().min(0),
  educationLevel: z.string().optional(),
  isCurrentlyEmployed: z.boolean().optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),

  // Job Preferences
  interestedRoleTypes: z.array(z.string()).optional(),
  preferredEmploymentTypes: z.array(z.string()).optional(),
  preferredRemoteOptions: z.array(z.string()).optional(),

  // Location & Logistics
  currentLocation: z.string().optional(),
  openToRelocation: z.boolean().optional(),
  needsSponsorship: z.boolean().optional(),
  preferredTimezones: z.array(z.string()).optional(),

  // Goals
  lookingForInNextCompany: z.string().optional(),
  desiredStartMonth: z.string().optional(),

  // Four Facts
  fourFacts: z.array(z.string()).optional(),

  // Interests
  interests: z.string().optional(),
});

export function UserProfileForm() {
  const userProfile = useQuery(api.userProfiles.get);
  const updateUserProfile = useMutation(api.userProfiles.update);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const saveStorageId = useMutation(api.resumes.saveStorageId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearsOfExperience: 0,
      educationLevel: "",
      isCurrentlyEmployed: false,
      currentCompany: "",
      currentRole: "",
      interestedRoleTypes: [],
      preferredEmploymentTypes: [],
      preferredRemoteOptions: [],
      currentLocation: "",
      openToRelocation: false,
      needsSponsorship: false,
      preferredTimezones: [],
      lookingForInNextCompany: "",
      desiredStartMonth: "",
      fourFacts: ["", "", "", ""],
      interests: "",
    },
  });

  // Update form when userProfile loads
  useEffect(() => {
    if (userProfile) {
      form.reset({
        yearsOfExperience: userProfile.yearsOfExperience ?? 0,
        educationLevel: userProfile.educationLevel ?? "",
        isCurrentlyEmployed: userProfile.isCurrentlyEmployed ?? false,
        currentCompany: userProfile.currentCompany ?? "",
        currentRole: userProfile.currentRole ?? "",
        interestedRoleTypes: userProfile.interestedRoleTypes ?? [],
        preferredEmploymentTypes: userProfile.preferredEmploymentTypes ?? [],
        preferredRemoteOptions: userProfile.preferredRemoteOptions ?? [],
        currentLocation: userProfile.currentLocation ?? "",
        openToRelocation: userProfile.openToRelocation ?? false,
        needsSponsorship: userProfile.needsSponsorship ?? false,
        preferredTimezones: userProfile.preferredTimezones ?? [],
        lookingForInNextCompany: userProfile.lookingForInNextCompany ?? "",
        desiredStartMonth: userProfile.desiredStartMonth ?? "",
        fourFacts: userProfile.fourFacts ?? ["", "", "", ""],
        interests: userProfile.interests?.join(", ") ?? "",
      });
    }
  }, [userProfile, form]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFile(files[0]);
    setIsParsing(true);

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": files[0].type },
        body: files[0],
      });
      const { storageId } = await result.json();
      await saveStorageId({ storageId });
      setUploadedFile(files[0]);
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsParsing(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const fourFacts = values.fourFacts?.filter(Boolean) ?? [];
      const interests = values.interests
        ? values.interests.split(",").map((s) => s.trim())
        : [];

      await updateUserProfile({
        yearsOfExperience: values.yearsOfExperience,
        educationLevel: values.educationLevel || undefined,
        isCurrentlyEmployed: values.isCurrentlyEmployed,
        currentCompany: values.currentCompany || undefined,
        currentRole: values.currentRole || undefined,
        interestedRoleTypes: values.interestedRoleTypes?.length
          ? values.interestedRoleTypes
          : undefined,
        preferredEmploymentTypes: values.preferredEmploymentTypes?.length
          ? values.preferredEmploymentTypes
          : undefined,
        preferredRemoteOptions: values.preferredRemoteOptions?.length
          ? values.preferredRemoteOptions
          : undefined,
        currentLocation: values.currentLocation || undefined,
        openToRelocation: values.openToRelocation,
        needsSponsorship: values.needsSponsorship,
        preferredTimezones: values.preferredTimezones?.length
          ? values.preferredTimezones
          : undefined,
        lookingForInNextCompany: values.lookingForInNextCompany || undefined,
        desiredStartMonth: values.desiredStartMonth || undefined,
        fourFacts: fourFacts.length ? fourFacts : undefined,
        interests: interests.length ? interests : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const remoteOptions = REMOTE_OPTIONS.map((option) => ({
    value: option,
    label: option === "On-Site" ? "On-site" : option,
  }));

  const timezoneOptions = TIMEZONES.map((tz) => ({
    value: tz.value,
    label: tz.label,
  }));

  const includesRemote =
    form.watch("preferredRemoteOptions")?.includes("Remote") ||
    form.watch("preferredRemoteOptions")?.length === 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormLayout>
          <FormSection
            title="Update Your Profile"
            description="Keep your profile up to date to get better job recommendations."
          />

          {/* Resume Upload Section */}
          <FormSection
            title="Resume"
            description="Upload or update your resume to keep your profile current."
          >
            <Dropzone
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
              onDrop={handleFileUpload}
              disabled={isParsing}
            >
              <DropzoneEmptyState>
                {!uploadedFile ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <UploadIcon size={24} />
                    </div>
                    <p className="mb-2 text-lg font-medium">
                      Upload your resume
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-green-100 text-green-600">
                      <CheckIcon size={24} />
                    </div>
                    <p className="mb-2 text-lg font-medium text-green-700">
                      Resume uploaded successfully!
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      {uploadedFile.name} (
                      {Math.round(uploadedFile.size / 1024)} KB)
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Drop a new file to replace
                    </p>
                  </div>
                )}
              </DropzoneEmptyState>
              <DropzoneContent>
                {isParsing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-4 size-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="text-lg font-medium">
                      Parsing your resume...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few seconds
                    </p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileTextIcon size={24} />
                    </div>
                    <p className="mb-2 text-lg font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                  </div>
                ) : null}
              </DropzoneContent>
            </Dropzone>
          </FormSection>

          <Separator />

          {/* Professional Background */}
          <FormSection
            title="Professional Background"
            description="Tell us about your current situation and experience level."
          >
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="isCurrentlyEmployed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I am currently employed</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("isCurrentlyEmployed") && (
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="currentCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Google, Startup Inc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer, Product Manager"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            )}
          </FormSection>

          {/* Job Preferences */}
          <FormSection
            title="Job Preferences"
            description="What kind of roles and work arrangements are you interested in?"
          >
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="interestedRoleTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interested Role Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={ROLE_TYPE_OPTIONS}
                        value={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select role types you're interested in"
                      />
                    </FormControl>
                    <FormDescription>
                      Select all role types you&apos;re interested in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredEmploymentTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Employment Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={EMPLOYMENT_TYPE_OPTIONS}
                        value={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select employment types you're open to"
                      />
                    </FormControl>
                    <FormDescription>
                      Select all employment types you&apos;re open to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredRemoteOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote Work Preferences</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={remoteOptions}
                        value={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select remote work options you're comfortable with"
                      />
                    </FormControl>
                    <FormDescription>
                      Select all remote work options you&apos;re comfortable
                      with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          {/* Location & Logistics */}
          <FormSection
            title="Location & Logistics"
            description="Tell us about your location preferences and work authorization."
          >
            <FormField
              control={form.control}
              name="currentLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <CityInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g., San Francisco, USA"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your current city and country
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="openToRelocation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I&apos;m open to relocating for the right opportunity
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="needsSponsorship"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I need work authorization/visa sponsorship
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {includesRemote && (
              <FormField
                control={form.control}
                name="preferredTimezones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Preferred Time Zones (for remote work)
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={timezoneOptions}
                        value={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Select time zones you're comfortable working in"
                      />
                    </FormControl>
                    <FormDescription>
                      Select time zones you&apos;re comfortable working in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </FormSection>

          {/* Goals */}
          <FormSection
            title="Your Goals"
            description="Help us understand what you're looking for in your next role."
          >
            <FormGrid cols={1}>
              <FormField
                control={form.control}
                name="lookingForInNextCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      What are you looking for in your next company?
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Growth opportunities, innovative technology, good work-life balance, mission-driven company..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about culture, role, growth opportunities, or
                      anything else that matters to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desiredStartMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When would you like to start?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start timeframe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Immediately">Immediately</SelectItem>
                        <SelectItem value="1 month">Within 1 month</SelectItem>
                        <SelectItem value="2-3 months">2-3 months</SelectItem>
                        <SelectItem value="3-6 months">3-6 months</SelectItem>
                        <SelectItem value="6+ months">6+ months</SelectItem>
                        <SelectItem value="Just exploring">
                          Just exploring opportunities
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          {/* Four Impressive Facts */}
          <FormSection
            title="Four Impressive Facts About You"
            description="Share your most impressive achievements, skills, or experiences that make you stand out."
          >
            <FormField
              control={form.control}
              name="fourFacts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Four Most Impressive Facts</FormLabel>
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index}>
                        <FormControl>
                          <Input
                            placeholder={`Impressive fact #${index + 1}`}
                            value={field.value?.[index] || ""}
                            onChange={(e) => {
                              const newFacts = [
                                ...(field.value || ["", "", "", ""]),
                              ];
                              newFacts[index] = e.target.value;
                              field.onChange(newFacts);
                            }}
                          />
                        </FormControl>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Examples: "Built an app with 10K+ users and was featured in
                    the NYT", "Created a sick job board app", "Fastest
                    Triathlete in California"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Interests */}
          <FormSection
            title="Interests"
            description="Tell us about your professional interests and areas of expertise."
          >
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Professional Interests (comma-separated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Machine Learning, Web Development, Product Strategy"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List your professional interests, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Form Actions */}
          <FormActions>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full size-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Save Profile
                  <CheckIcon className="size-4 ml-2" />
                </>
              )}
            </Button>
          </FormActions>
        </FormLayout>
      </form>
    </Form>
  );
}
