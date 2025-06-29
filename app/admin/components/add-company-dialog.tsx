"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SparkleIcon } from "@phosphor-icons/react";
import { useAction, useMutation } from "convex/react";
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
  tags: z.string().optional(),
  locations: z.string().optional(),
  recentFinancingAmount: z.string().optional(),
  recentFinancingDate: z.string().optional(),
  investors: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCompanyDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddCompanyDialogProps) {
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
      tags: "",
      locations: "",
      recentFinancingAmount: "",
      recentFinancingDate: "",
      investors: "",
    },
  });

  const companyName = form.watch("name");
  const website = form.watch("website");
  const jobBoardUrl = form.watch("jobBoardUrl");

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
        form.setValue("tags", details.tags.join(", "));
      }
      if (details.locations && details.locations.length > 0) {
        form.setValue("locations", details.locations.join(", "));
      }
      if (details.recentFinancing) {
        form.setValue("recentFinancingAmount", details.recentFinancing.amount);
        form.setValue("recentFinancingDate", details.recentFinancing.date);
      }
      if (details.investors && details.investors.length > 0) {
        form.setValue("investors", details.investors.join(", "));
      }

      toast.success("Company details auto-filled successfully!");
    } catch (error) {
      console.error("Error auto-filling company details:", error);
      toast.error("Failed to auto-fill company details. Please try again.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const companyData = {
        name: data.name,
        website: data.website || undefined,
        logoUrl: data.logoUrl || undefined,
        jobBoardUrl: data.jobBoardUrl,
        sourceType: data.sourceType,
        numberOfEmployees: data.numberOfEmployees,
        stage: data.stage,
        tags: data.tags
          ? data.tags.split(",").map((tag) => tag.trim())
          : undefined,
        locations: data.locations
          ? data.locations.split(",").map((location) => location.trim())
          : undefined,
        recentFinancing:
          data.recentFinancingAmount && data.recentFinancingDate
            ? {
                amount: data.recentFinancingAmount,
                date: data.recentFinancingDate,
              }
            : undefined,
        investors: data.investors
          ? data.investors.split(",").map((investor) => investor.trim())
          : undefined,
      };

      await addCompany(companyData);
      toast.success("Company added successfully!");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Add a new company to track their job postings and details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Company Name</FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAutoFill}
                          disabled={!companyName.trim() || isAutoFilling}
                          className="cursor-pointer w-full text-xs"
                          title="Prefill with data from Perplexity"
                        >
                          <SparkleIcon
                            className={`size-4 ${isAutoFilling ? "animate-spin" : ""} mr-1`}
                          />
                          {isAutoFilling
                            ? "Loading..."
                            : "Prefill with Perplexity"}
                        </Button>
                      </div>
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
                        <Input placeholder="https://jobs.acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          <SelectItem value="ashby">Ashby</SelectItem>
                          <SelectItem value="greenhouse">Greenhouse</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="501-1000">501-1000</SelectItem>
                          <SelectItem value="1001-5000">1001-5000</SelectItem>
                          <SelectItem value="5000+">5000+</SelectItem>
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
                          <SelectItem value="pre-seed">Pre-seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="series-c">Series C</SelectItem>
                          <SelectItem value="series-d">Series D</SelectItem>
                          <SelectItem value="series-e">Series E</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="pre-ipo">Pre-IPO</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="acquired">Acquired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="fintech, saas, b2b, ai/ml"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="locations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locations</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="San Francisco, New York"
                          {...field}
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
                        <Input
                          placeholder="Sequoia Capital, Andreessen Horowitz"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recentFinancingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recent Financing Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="$10M" {...field} />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="cursor-pointer"
              >
                {form.formState.isSubmitting ? "Adding..." : "Add Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
