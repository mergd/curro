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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  locations: z.array(z.string()).optional(),
  roleType: z.string().optional(),
  employmentType: z.string().optional(),
  educationLevel: z.string().optional(),
  // Add other fields as necessary
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobEditFormProps {
  job: Doc<"jobs">;
  onCancel: () => void;
  onSave: () => void;
}

export function JobEditForm({ job, onCancel, onSave }: JobEditFormProps) {
  const updateJob = useMutation(api.jobs.update);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      locations: job.locations,
      roleType: job.roleType,
      employmentType: job.employmentType,
      educationLevel: job.educationLevel,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormLayout>
          <FormSection
            title="Job Details"
            description="Edit the core details of the job posting."
          >
            <FormGrid>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add more fields here */}
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
