"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Card, Select } from "@radix-ui/themes";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";

interface CompanyEditFormProps {
  company: any;
  onCancel: () => void;
  onSaved: () => void;
}

interface CompanyFormData {
  name: string;
  website?: string;
  logoUrl?: string;
  jobBoardUrl: string;
  sourceType: "ashby" | "greenhouse" | "other";
  numberOfEmployees?: string;
  stage?:
    | "pre-seed"
    | "seed"
    | "series-a"
    | "series-b"
    | "series-c"
    | "series-d"
    | "series-e"
    | "growth"
    | "pre-ipo"
    | "public"
    | "acquired";
  tags?: string[];
  locations?: string[];
}

export function CompanyEditForm({
  company,
  onCancel,
  onSaved,
}: CompanyEditFormProps) {
  const updateCompany = useMutation(api.companies.update);

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: company.name || "",
      website: company.website || "",
      logoUrl: company.logoUrl || "",
      jobBoardUrl: company.jobBoardUrl || "",
      sourceType: company.sourceType || "other",
      numberOfEmployees: company.numberOfEmployees || "",
      stage: company.stage || "",
      tags: company.tags || [],
      locations: company.locations || [],
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await updateCompany({
        id: company._id,
        ...data,
        tags: data.tags?.filter((tag) => tag.trim() !== ""),
        locations: data.locations?.filter((loc) => loc.trim() !== ""),
      });
      onSaved();
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="cursor-pointer">
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit {company.name}</h1>
            <p className="text-muted-foreground">Update company information</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name", { required: true })}
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    {...form.register("logoUrl")}
                    placeholder="https://acme.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobBoardUrl">Job Board URL *</Label>
                  <Input
                    id="jobBoardUrl"
                    {...form.register("jobBoardUrl", { required: true })}
                    placeholder="https://jobs.acme.com"
                  />
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="sourceType">ATS Type</Label>
                  <Select.Root
                    value={form.watch("sourceType")}
                    onValueChange={(value) =>
                      form.setValue("sourceType", value as any)
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="ashby">Ashby</Select.Item>
                      <Select.Item value="greenhouse">Greenhouse</Select.Item>
                      <Select.Item value="other">Other</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                  <Select.Root
                    value={form.watch("numberOfEmployees") || ""}
                    onValueChange={(value) =>
                      form.setValue("numberOfEmployees", value)
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="1-10">1-10</Select.Item>
                      <Select.Item value="11-50">11-50</Select.Item>
                      <Select.Item value="51-200">51-200</Select.Item>
                      <Select.Item value="201-500">201-500</Select.Item>
                      <Select.Item value="501-1000">501-1000</Select.Item>
                      <Select.Item value="1001-5000">1001-5000</Select.Item>
                      <Select.Item value="5000+">5000+</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Company Stage</Label>
                  <Select.Root
                    value={form.watch("stage") || ""}
                    onValueChange={(value) =>
                      form.setValue("stage", value as any)
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="pre-seed">Pre-seed</Select.Item>
                      <Select.Item value="seed">Seed</Select.Item>
                      <Select.Item value="series-a">Series A</Select.Item>
                      <Select.Item value="series-b">Series B</Select.Item>
                      <Select.Item value="series-c">Series C</Select.Item>
                      <Select.Item value="series-d">Series D</Select.Item>
                      <Select.Item value="series-e">Series E</Select.Item>
                      <Select.Item value="growth">Growth</Select.Item>
                      <Select.Item value="pre-ipo">Pre-IPO</Select.Item>
                      <Select.Item value="public">Public</Select.Item>
                      <Select.Item value="acquired">Acquired</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={form.watch("tags")?.join(", ") || ""}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim());
                      form.setValue("tags", tags);
                    }}
                    placeholder="fintech, saas, b2b, ai/ml"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locations">Locations (comma separated)</Label>
                  <Input
                    id="locations"
                    value={form.watch("locations")?.join(", ") || ""}
                    onChange={(e) => {
                      const locations = e.target.value
                        .split(",")
                        .map((loc) => loc.trim());
                      form.setValue("locations", locations);
                    }}
                    placeholder="San Francisco, New York, Remote"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
