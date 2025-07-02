"use client";

import { CompanyForm } from "@/components/forms/company-form";
import { api } from "@/convex/_generated/api";

import { useMutation } from "convex/react";
import { toast } from "sonner";

interface CompanyEditFormProps {
  company: any;
  onCancel: () => void;
  onSaved: () => void;
}

export function CompanyEditForm({
  company,
  onCancel,
  onSaved,
}: CompanyEditFormProps) {
  const updateCompany = useMutation(api.companies.update);

  const handleSubmit = async (data: any) => {
    try {
      await updateCompany(data);
      toast.success("Company updated successfully!");
      onSaved();
    } catch (error) {
      console.error("Failed to update company:", error);
      toast.error("Failed to update company. Please try again.");
    }
  };

  return (
    <CompanyForm
      mode="edit"
      company={company}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
