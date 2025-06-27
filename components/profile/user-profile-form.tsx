"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

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
    const fourFacts = [values.fact1, values.fact2, values.fact3, values.fact4].filter(Boolean);
    const interests = values.interests.split(",").map(s => s.trim());

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="yearsOfExperience">Years of Experience</label>
        <input {...form.register("yearsOfExperience", { valueAsNumber: true })} id="yearsOfExperience" type="number" className="border p-2 w-full" />
      </div>
      <div>
        <label htmlFor="interests">Interests (comma-separated)</label>
        <input {...form.register("interests")} id="interests" className="border p-2 w-full" />
      </div>
      <div>
        <label>4 Most Impressive Facts</label>
        <input {...form.register("fact1")} placeholder="Fact 1" className="border p-2 w-full mt-2" />
        <input {...form.register("fact2")} placeholder="Fact 2" className="border p-2 w-full mt-2" />
        <input {...form.register("fact3")} placeholder="Fact 3" className="border p-2 w-full mt-2" />
        <input {...form.register("fact4")} placeholder="Fact 4" className="border p-2 w-full mt-2" />
      </div>
      <div>
        <label htmlFor="resume">Resume</label>
        <input type="file" id="resume" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="border p-2 w-full" />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save Profile
      </button>
    </form>
  );
}
