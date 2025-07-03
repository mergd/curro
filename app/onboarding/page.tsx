"use client";

import type { OnboardingFormData } from "./components";

import { Form } from "@/components/ui/form";
import { api } from "@/convex/_generated/api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { OnboardingForm, onboardingSchema } from "./components";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.get);
  const updateProfile = useMutation(api.userProfiles.update);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const saveStorageId = useMutation(api.resumes.saveStorageId);
  const parseResume = useAction(api.userProfiles.parseResumeFromStorage);

  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      yearsOfExperience: 0,
      isCurrentlyEmployed: false,
      interestedRoleTypes: [],
      preferredEmploymentTypes: ["Permanent"],
      preferredRemoteOptions: ["On-Site"],
      openToRelocation: false,
      needsSponsorship: false,
      currentLocation: "",
      lookingForInNextCompany: "",
      desiredStartMonth: "",
      interests: [],
      fourFacts: [],
      preferredTimezones: [],
    },
  } as const);

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/auth");
    }
  }, [user, router]);

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (userProfile?.hasCompletedOnboarding) {
      router.push("/dashboard");
    }
  }, [userProfile, router]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsParsing(true);

    try {
      // Upload file to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();
      await saveStorageId({ storageId });

      // Parse the resume
      const parsedData = await parseResume({ storageId });

      // Pre-populate form with parsed data
      if (parsedData.yearsOfExperience) {
        form.setValue("yearsOfExperience", parsedData.yearsOfExperience);
      }
      if (parsedData.educationLevel) {
        form.setValue("educationLevel", parsedData.educationLevel);
      }
      if (parsedData.currentCompany) {
        form.setValue("currentCompany", parsedData.currentCompany);
      }
      if (parsedData.currentRole) {
        form.setValue("currentRole", parsedData.currentRole);
      }
      if (parsedData.isCurrentlyEmployed !== undefined) {
        form.setValue("isCurrentlyEmployed", parsedData.isCurrentlyEmployed);
      }
      if (parsedData.currentLocation) {
        form.setValue("currentLocation", parsedData.currentLocation);
      }
      if (
        parsedData.interestedRoleTypes &&
        parsedData.interestedRoleTypes.length > 0
      ) {
        form.setValue("interestedRoleTypes", parsedData.interestedRoleTypes);
      }
      if (parsedData.interests && parsedData.interests.length > 0) {
        form.setValue("interests", parsedData.interests);
      }
      if (parsedData.keyAchievements && parsedData.keyAchievements.length > 0) {
        form.setValue("fourFacts", parsedData.keyAchievements);
      }

      toast.success(
        "Resume parsed successfully! Review and edit the information below.",
      );
    } catch (error) {
      console.error("Resume upload/parsing failed:", error);
      toast.error(
        "Failed to parse resume. You can still fill out the form manually.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        ...data,
        hasCompletedOnboarding: true,
      });

      toast.success("Onboarding completed! Welcome to Curro.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (user === undefined || userProfile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <OnboardingForm
                form={form}
                onSubmit={onSubmit}
                onFileUpload={handleFileUpload}
                isSubmitting={isSubmitting}
                isParsing={isParsing}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
