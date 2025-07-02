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

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  yearsOfExperience: z.number().min(0),
  interests: z.string(),
  fact1: z.string(),
  fact2: z.string(),
  fact3: z.string(),
  fact4: z.string(),
});

export function UserProfileForm() {
  const userProfile = useQuery(api.userProfiles.get);
  const updateUserProfile = useMutation(api.userProfiles.update);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const saveStorageId = useMutation(api.resumes.saveStorageId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearsOfExperience: userProfile?.yearsOfExperience ?? 0,
      interests: userProfile?.interests?.join(", ") ?? "",
      fact1: userProfile?.fourFacts?.[0] ?? "",
      fact2: userProfile?.fourFacts?.[1] ?? "",
      fact3: userProfile?.fourFacts?.[2] ?? "",
      fact4: userProfile?.fourFacts?.[3] ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const fourFacts = [
      values.fact1,
      values.fact2,
      values.fact3,
      values.fact4,
    ].filter(Boolean);
    const interests = values.interests.split(",").map((s) => s.trim());

    await updateUserProfile({
      yearsOfExperience: values.yearsOfExperience,
      interests,
      fourFacts,
    });

    if (selectedFile) {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      await saveStorageId({ storageId });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormLayout>
          <FormSection
            title="Professional Information"
            description="Tell us about your experience and interests"
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
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests (comma-separated)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="4 Most Impressive Facts"
            description="Share your most compelling achievements"
          >
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="fact1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fact 1</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your first impressive fact..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fact2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fact 2</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your second impressive fact..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fact3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fact 3</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your third impressive fact..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fact4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fact 4</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your fourth impressive fact..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Resume Upload">
            <div>
              <label
                htmlFor="resume"
                className="block text-sm font-medium mb-2"
              >
                Resume
              </label>
              <input
                type="file"
                id="resume"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </FormSection>

          <FormActions>
            <Button type="submit">Save Profile</Button>
          </FormActions>
        </FormLayout>
      </form>
    </Form>
  );
}
