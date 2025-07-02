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
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagCombobox } from "@/components/ui/tag-combobox";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  COMPANY_TAGS,
  EMPLOYEE_COUNT_RANGES,
  SOURCE_TYPES,
} from "@/lib/constants";
import { inferSourceType } from "@/lib/utils/company";
import {
  CompanyFormData,
  companyFormSchema,
  formatCategoryLabels,
  formatFinancingAmount,
  getAvailableSubcategories,
  getCompanyFormDefaults,
  INVESTOR_OPTIONS,
  LOCATION_OPTIONS,
  transformFormDataForSubmission,
} from "@/lib/utils/company-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SparkleIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface CompanyFormProps {
  mode: "add" | "edit";
  company?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isAutoFilling?: boolean;
  onAutoFill?: (formData: { name: string; website?: string }) => Promise<any>;
  showAutoFill?: boolean;
}

export function CompanyForm({
  mode,
  company,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isAutoFilling = false,
  onAutoFill,
  showAutoFill = false,
}: CompanyFormProps) {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: getCompanyFormDefaults(company),
  });

  const companyName = form.watch("name");
  const website = form.watch("website");
  const jobBoardUrl = form.watch("jobBoardUrl");
  const logoUrl = form.watch("logoUrl");
  const selectedCategories = form.watch("category") || [];
  const sourceType = form.watch("sourceType");

  // Check if prefill should be shown (name and website are filled)
  const canShowPrefill = showAutoFill && companyName.trim() && website?.trim();

  // Auto-infer sourceType when jobBoardUrl changes
  useEffect(() => {
    if (jobBoardUrl && jobBoardUrl.trim()) {
      const inferredType = inferSourceType(jobBoardUrl);
      const currentSourceType = form.getValues("sourceType");
      if (currentSourceType !== inferredType) {
        form.setValue("sourceType", inferredType, { shouldValidate: true });
      }
    } else {
      // Clear sourceType when URL is empty
      const currentSourceType = form.getValues("sourceType");
      if (currentSourceType) {
        form.setValue("sourceType", undefined, { shouldValidate: true });
      }
    }
  }, [jobBoardUrl, form]);

  // Auto-format financing amount on blur
  const handleFinancingAmountBlur = (value: string) => {
    const formatted = formatFinancingAmount(value);
    if (formatted !== value) {
      form.setValue("recentFinancingAmount", formatted);
    }
  };

  // Get available subcategories based on selected categories
  const availableSubcategories = getAvailableSubcategories(selectedCategories);

  const handleSubmit = async (data: CompanyFormData) => {
    const transformedData = transformFormDataForSubmission(data);

    if (mode === "edit" && company) {
      await onSubmit({ id: company._id, ...transformedData });
    } else {
      await onSubmit(transformedData);
    }
  };

  const handleAutoFillClick = async () => {
    if (!onAutoFill) return;

    const details = await onAutoFill({
      name: companyName,
      website: website,
    });

    if (details) {
      // Fill in the form with the fetched details
      if (details.description) {
        form.setValue("description", details.description);
      }
      if (details.foundedYear) {
        form.setValue("foundedYear", details.foundedYear.toString());
      }
      if (details.website) {
        form.setValue("website", details.website);
      }
      if (details.logoUrl) {
        form.setValue("logoUrl", details.logoUrl);
      }
      if (details.numberOfEmployees) {
        form.setValue("numberOfEmployees", details.numberOfEmployees);
      }
      if (details.stage) {
        form.setValue("stage", details.stage);
      }
      if (details.tags && details.tags.length > 0) {
        form.setValue("tags", details.tags);
      }
      if (details.locations && details.locations.length > 0) {
        form.setValue("locations", details.locations);
      }
      if (details.recentFinancing) {
        if (details.recentFinancing.amount) {
          const formattedAmount =
            details.recentFinancing.amount.toLocaleString();
          form.setValue("recentFinancingAmount", formattedAmount);
        }
        if (details.recentFinancing.date) {
          const dateValue = details.recentFinancing.date;
          if (dateValue.includes("-") && dateValue.length > 7) {
            const yearMonth = dateValue.substring(0, 7);
            form.setValue("recentFinancingDate", yearMonth);
          } else {
            form.setValue("recentFinancingDate", dateValue);
          }
        }
      }
      if (details.investors && details.investors.length > 0) {
        form.setValue("investors", details.investors);
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-fit"
          size="sm"
          onClick={onCancel}
        >
          <ArrowLeftIcon className="size-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold ">
            {mode === "edit" ? `Edit ${company?.name}` : "Add New Company"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "edit"
              ? "Update company information and details."
              : "Add a new company to track their job postings and details."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <FormLayout>
                <FormSection
                  title="Basic Information"
                  description="Enter the company's core details and job board information"
                >
                  <FormGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="https://acme.com"
                                {...field}
                              />
                              {canShowPrefill && (
                                <AnimatePresence>
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: -10,
                                      scale: 0.95,
                                    }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 25,
                                    }}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={handleAutoFillClick}
                                            disabled={isAutoFilling}
                                            className="cursor-pointer relative overflow-hidden group"
                                          >
                                            <motion.div
                                              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                                              animate={{
                                                opacity: [0.3, 0.6, 0.3],
                                              }}
                                              transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                              }}
                                            />
                                            <SparkleIcon
                                              className={`size-4 ${
                                                isAutoFilling
                                                  ? "animate-spin"
                                                  : "group-hover:animate-pulse"
                                              } relative z-10`}
                                            />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Prefill with data from Perplexity
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </motion.div>
                                </AnimatePresence>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormGrid>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of what the company does..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://acme.com/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div
                    className={`grid gap-4 ${
                      jobBoardUrl?.trim()
                        ? "grid-cols-1 md:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name="jobBoardUrl"
                      render={({ field }) => (
                        <FormItem
                          className={jobBoardUrl?.trim() ? "md:col-span-2" : ""}
                        >
                          <FormLabel required>Job Board URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://jobs.acme.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {jobBoardUrl?.trim() && (
                      <FormField
                        control={form.control}
                        name="sourceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ATS Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              key={`sourceType-${field.value}`}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Auto-detected" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOURCE_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() +
                                      type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </FormSection>

                <FormGrid cols={2}>
                  <FormSection title="Company Details">
                    <FormField
                      control={form.control}
                      name="numberOfEmployees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Employees</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EMPLOYEE_COUNT_RANGES.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
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
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Stage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMPANY_STAGES.map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                  {stage.charAt(0).toUpperCase() +
                                    stage.slice(1).replace(/-/g, " ")}
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
                      name="foundedYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2010"
                              type="number"
                              min="1990"
                              max={new Date().getFullYear()}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>

                  <FormSection title="Classification">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <FormControl>
                            <TagCombobox
                              options={formatCategoryLabels(COMPANY_CATEGORIES)}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Add categories..."
                              allowCustom={false}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {availableSubcategories.length > 0 && (
                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategories</FormLabel>
                            <FormControl>
                              <TagCombobox
                                options={availableSubcategories}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Add subcategories..."
                                allowCustom={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <TagCombobox
                              options={formatCategoryLabels(COMPANY_TAGS)}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Add tags..."
                              allowCustom={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormSection title="Location & Funding">
                    <FormField
                      control={form.control}
                      name="locations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Locations</FormLabel>
                          <FormControl>
                            <TagCombobox
                              options={LOCATION_OPTIONS}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Add locations..."
                              allowCustom={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investors</FormLabel>
                          <FormControl>
                            <TagCombobox
                              options={INVESTOR_OPTIONS}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Add investors..."
                              allowCustom={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>

                  <FormSection title="Recent Financing">
                    <FormField
                      control={form.control}
                      name="recentFinancingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recent Financing Amount (USD)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="10M or 10,000,000"
                              {...field}
                              onBlur={(e) =>
                                handleFinancingAmountBlur(e.target.value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recentFinancingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recent Financing Date</FormLabel>
                          <FormControl>
                            <MonthYearPicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select month and year"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>
                </FormGrid>
              </FormLayout>
            </div>

            {/* Logo Preview Sidebar */}
            {logoUrl && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logo Preview</h3>
                <ImagePreview
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="w-full aspect-square max-w-48"
                />
              </div>
            )}
          </div>

          <FormActions>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Adding..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Add Company"}
            </Button>
          </FormActions>
        </form>
      </Form>
    </div>
  );
}
