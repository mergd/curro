"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { api } from "@/convex/_generated/api";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
  jobBoardUrl: z.string().url("Please enter a valid job board URL"),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestCompanyDialogProps {
  trigger?: React.ReactNode;
}

export function RequestCompanyDialog({ trigger }: RequestCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitRequest = useMutation(api.companyRequests.submit);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      companyName: "",
      companyWebsite: "",
      jobBoardUrl: "",
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      await submitRequest({
        companyName: data.companyName,
        companyWebsite: data.companyWebsite || undefined,
        jobBoardUrl: data.jobBoardUrl,
      });

      setIsSubmitted(true);
      toast.success("Company request submitted successfully!");

      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        setIsSubmitted(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request",
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsSubmitted(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <PlusIcon className="size-4 mr-2" />
            Request Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Company</DialogTitle>
          <DialogDescription>
            Don&apos;t see a company you&apos;re interested in? Let us know and
            we&apos;ll add it to our job board.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 size-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckIcon className="size-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for your suggestion. We&apos;ll review it and add it to
              our database if it meets our criteria.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
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
                    <FormLabel>Job Board URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://company.com/careers"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
