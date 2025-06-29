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
import { ImagePreview } from "@/components/ui/image-preview";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagCombobox } from "@/components/ui/tag-combobox";
import { api } from "@/convex/_generated/api";
import {
  COMPANY_CATEGORIES,
  COMPANY_STAGES,
  COMPANY_SUBCATEGORIES,
  COMPANY_TAGS,
  EMPLOYEE_COUNT_RANGES,
  SOURCE_TYPES,
} from "@/lib/constants";
import { inferSourceType } from "@/lib/utils/company";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SparkleIcon } from "@phosphor-icons/react";
import { useAction, useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
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
  stage: z
    .enum([
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
    ])
    .optional(),
  category: z.array(z.string()).optional(),
  subcategory: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  recentFinancingAmount: z.string().optional(),
  recentFinancingDate: z.string().optional(),
  investors: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddCompanyPage() {
  const router = useRouter();
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const addCompany = useMutation(api.companies.add);
  const fetchCompanyDetails = useAction(
    api.companies.fetchCompanyDetailsFromPerplexity,
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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
    },
  });

  const companyName = form.watch("name");
  const website = form.watch("website");
  const jobBoardUrl = form.watch("jobBoardUrl");
  const logoUrl = form.watch("logoUrl");
  const selectedCategories = form.watch("category") || [];

  // Check if prefill should be shown (name and website are filled)
  const canShowPrefill = companyName.trim() && website?.trim();

  // Auto-infer sourceType when jobBoardUrl changes
  useEffect(() => {
    if (jobBoardUrl && jobBoardUrl.trim()) {
      const inferredType = inferSourceType(jobBoardUrl);
      if (form.getValues("sourceType") !== inferredType) {
        form.setValue("sourceType", inferredType);
      }
    }
  }, [jobBoardUrl, form]);

  const handleAutoFill = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name first");
      return;
    }

    setIsAutoFilling(true);
    try {
      const details = await fetchCompanyDetails({
        companyName: companyName.trim(),
        companyUrl: website?.trim() || undefined,
      });

      // Fill in the form with the fetched details
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
          form.setValue(
            "recentFinancingAmount",
            details.recentFinancing.amount.toString(),
          );
        }
        if (details.recentFinancing.date) {
          form.setValue("recentFinancingDate", details.recentFinancing.date);
        }
      }
      if (details.investors && details.investors.length > 0) {
        form.setValue("investors", details.investors);
      }

      toast.success("Company details auto-filled successfully!");
    } catch (error) {
      console.error("Error auto-filling company details:", error);
      toast.error("Failed to auto-fill company details. Please try again.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Get available subcategories based on selected categories
  const availableSubcategories = selectedCategories.flatMap((category) => {
    const subcats =
      COMPANY_SUBCATEGORIES[category as keyof typeof COMPANY_SUBCATEGORIES];
    return subcats
      ? subcats.map((sub) => ({
          label: sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, " "),
          value: sub,
        }))
      : [];
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Parse and format the financing amount
      let recentFinancing = undefined;
      if (data.recentFinancingAmount && data.recentFinancingDate) {
        // Remove currency symbols and parse the number
        const cleanAmount = data.recentFinancingAmount.replace(/[$,\s]/g, "");
        let amount = parseFloat(cleanAmount);

        // Handle common abbreviations (M for million, B for billion, K for thousand)
        if (cleanAmount.toLowerCase().includes("m")) {
          amount = amount * 1000000;
        } else if (cleanAmount.toLowerCase().includes("b")) {
          amount = amount * 1000000000;
        } else if (cleanAmount.toLowerCase().includes("k")) {
          amount = amount * 1000;
        }

        recentFinancing = {
          amount: amount,
          date: data.recentFinancingDate,
        };
      }

      const companyData = {
        name: data.name,
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

      await addCompany(companyData);
      toast.success("Company added successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company. Please try again.");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="cursor-pointer">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Company</h1>
          <p className="text-muted-foreground">
            Add a new company to track their job postings and details.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Basic Information */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Input placeholder="https://acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AnimatePresence>
                  {canShowPrefill && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                        className="cursor-pointer w-full relative overflow-hidden group"
                        title="Prefill with data from Perplexity"
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
                          className={`size-4 ${isAutoFilling ? "animate-spin" : "group-hover:animate-pulse"} mr-2 relative z-10`}
                        />
                        <span className="relative z-10">
                          {isAutoFilling
                            ? "Gathering insights..."
                            : "✨ Prefill with AI"}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="jobBoardUrl"
                    render={({ field }) => (
                      <FormItem>
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Details</h3>

                  <FormField
                    control={form.control}
                    name="sourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATS Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ATS type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SOURCE_TYPES.map((type) => (
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
                </div>

                {/* Classification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Classification</h3>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <TagCombobox
                            options={COMPANY_CATEGORIES.map((cat) => ({
                              label:
                                cat.charAt(0).toUpperCase() +
                                cat.slice(1).replace(/-/g, " "),
                              value: cat,
                            }))}
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
                            options={COMPANY_TAGS.map((tag) => ({
                              label:
                                tag.charAt(0).toUpperCase() +
                                tag.slice(1).replace(/-/g, " "),
                              value: tag,
                            }))}
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Location & Funding */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location & Funding</h3>

                  <FormField
                    control={form.control}
                    name="locations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locations</FormLabel>
                        <FormControl>
                          <TagCombobox
                            options={[
                              {
                                label: "San Francisco",
                                value: "san-francisco",
                              },
                              { label: "New York", value: "new-york" },
                              { label: "London", value: "london" },
                              { label: "Remote", value: "remote" },
                              { label: "Los Angeles", value: "los-angeles" },
                              { label: "Chicago", value: "chicago" },
                              { label: "Boston", value: "boston" },
                              { label: "Seattle", value: "seattle" },
                              { label: "Austin", value: "austin" },
                              { label: "Toronto", value: "toronto" },
                            ]}
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
                            options={[
                              {
                                label: "Sequoia Capital",
                                value: "sequoia-capital",
                              },
                              {
                                label: "Andreessen Horowitz",
                                value: "andreessen-horowitz",
                              },
                              { label: "Y Combinator", value: "y-combinator" },
                              { label: "Accel", value: "accel" },
                              {
                                label: "Greylock Partners",
                                value: "greylock-partners",
                              },
                              {
                                label: "Kleiner Perkins",
                                value: "kleiner-perkins",
                              },
                              { label: "NEA", value: "nea" },
                              { label: "Benchmark", value: "benchmark" },
                            ]}
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
                </div>

                {/* Recent Financing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Financing</h3>

                  <FormField
                    control={form.control}
                    name="recentFinancingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recent Financing Amount (USD)</FormLabel>
                        <FormControl>
                          <Input placeholder="10M" {...field} />
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
                          <Input placeholder="2024-01-15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link href="/admin">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="cursor-pointer"
            >
              {form.formState.isSubmitting ? "Adding..." : "Add Company"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
