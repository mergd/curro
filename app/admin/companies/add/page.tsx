"use client";

import { CompanyForm } from "@/components/forms/company-form";
import { api } from "@/convex/_generated/api";

import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AddCompanyPage() {
  const router = useRouter();
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const addCompany = useMutation(api.companies.add);
  const fetchCompanyDetails = useAction(
    api.companies.fetchCompanyDetailsFromPerplexity,
  );

  const handleSubmit = async (data: any) => {
    try {
      await addCompany(data);
      toast.success("Company added successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  const handleAutoFill = async (formData: {
    name: string;
    website?: string;
  }) => {
    if (!formData.name.trim()) {
      toast.error("Please enter a company name first");
      return;
    }

    setIsAutoFilling(true);
    try {
      const details = await fetchCompanyDetails({
        companyName: formData.name.trim(),
        companyUrl: formData.website?.trim() || undefined,
      });

      toast.success("Company details auto-filled successfully!");
      return details;
    } catch (error) {
      console.error("Error auto-filling company details:", error);

      // More specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("No object generated") ||
          error.message.includes("Type validation failed")
        ) {
          toast.error(
            "AI couldn't parse company information properly. Please try again or fill manually.",
          );
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          toast.error(
            "Network error while fetching company details. Please check your connection and try again.",
          );
        } else {
          toast.error(`Failed to auto-fill: ${error.message}`);
        }
      } else {
        toast.error("Failed to auto-fill company details. Please try again.");
      }
      return null;
    } finally {
      setIsAutoFilling(false);
    }
  };

  return (
    <CompanyForm
      mode="add"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isAutoFilling={isAutoFilling}
      onAutoFill={handleAutoFill}
      showAutoFill={true}
    />
  );
}
