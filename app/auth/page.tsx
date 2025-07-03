"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { api } from "@/convex/_generated/api";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PaperPlaneIcon,
  UserIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const user = useQuery(api.auth.currentUser);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState<string | null>(null);
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  // Check if user exists when email is set
  const userExists = useQuery(
    api.auth.checkUserExists,
    emailToCheck ? { email: emailToCheck } : "skip",
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Show resend option after 30 seconds
  useEffect(() => {
    if (isEmailSent) {
      const timer = setTimeout(() => {
        setShowResendOption(true);
      }, 30000);

      return () => clearTimeout(timer);
    } else {
      setShowResendOption(false);
    }
  }, [isEmailSent]);

  // Handle the magic link sending after user check is complete
  useEffect(() => {
    if (emailToCheck && userExists !== undefined) {
      const sendMagicLink = async () => {
        try {
          const formData = new FormData();
          formData.append("email", emailToCheck);

          const redirectTo = userExists
            ? `${window.location.origin}/dashboard`
            : `${window.location.origin}/onboarding`;

          formData.append("redirectTo", redirectTo);

          await signIn("resend", formData);
          setIsEmailSent(true);
          setCheckedEmail(emailToCheck);
          setEmailToCheck(null); // Reset the check
          toast.success("Magic link sent! Check your email to sign in.");
        } catch (error: any) {
          console.error("Magic link error:", error);
          const errorMessage =
            error.data?.message ||
            "Failed to send magic link. Please try again.";
          toast.error(errorMessage);
          setEmailToCheck(null); // Reset on error
        }
      };

      sendMagicLink();
    }
  }, [emailToCheck, userExists, signIn]);

  const onSubmit = async (values: MagicLinkFormData) => {
    // Set the email to trigger the user existence check
    setEmailToCheck(values.email);
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setCheckedEmail(null);
    form.handleSubmit(onSubmit)();
  };

  const handleUseDifferent = () => {
    setIsEmailSent(false);
    setCheckedEmail(null);
    form.reset();
  };

  if (user) {
    return null; // Will redirect in useEffect
  }

  // Determine if we know whether this is sign in or sign up
  const emailValue = form.watch("email");
  const isCheckingUser = emailToCheck !== null;
  const hasCheckedResult = checkedEmail !== null && userExists !== undefined;
  const isSignIn = hasCheckedResult && userExists;
  const isSignUp = hasCheckedResult && !userExists;

  // Get appropriate titles and descriptions
  const getCardContent = () => {
    if (isEmailSent) {
      return {
        title: "Check your email",
        description: `We sent you a magic link to ${isSignIn ? "sign in to" : "complete your"} account`,
        icon: PaperPlaneIcon,
      };
    }

    if (isSignIn) {
      return {
        title: "Welcome back",
        description: "We found your account! Enter your email to sign in",
        icon: UserIcon,
      };
    }

    if (isSignUp) {
      return {
        title: "Create your account",
        description: "Enter your email to get started with Curro",
        icon: UserPlusIcon,
      };
    }

    return {
      title: "Welcome",
      description: "Enter your email to get a magic link for signing in",
      icon: null,
    };
  };

  const cardContent = getCardContent();

  return (
    <div className="min-h-screen flex items-center -mt-12 justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to home
        </Link>

        <Logo />
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {cardContent.icon && (
                <cardContent.icon className="size-5 text-muted-foreground" />
              )}
              <CardTitle className="text-2xl">{cardContent.title}</CardTitle>
            </div>
            <CardDescription>{cardContent.description}</CardDescription>
          </CardHeader>

          <CardContent>
            {isEmailSent ? (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <PaperPlaneIcon className="size-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    We sent a magic link to{" "}
                    <span className="font-medium text-foreground">
                      {checkedEmail || form.getValues("email")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the link in your email to{" "}
                    {isSignIn ? "sign in" : "complete setup"}
                  </p>
                </div>

                {showResendOption && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Didn&apos;t receive the email?
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleResendEmail}
                      className="w-full"
                    >
                      Resend magic link
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={handleUseDifferent}
                  className="w-full text-xs"
                >
                  Use different email
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting || isCheckingUser}
                  >
                    {isCheckingUser
                      ? "Checking account..."
                      : form.formState.isSubmitting
                        ? "Sending magic link..."
                        : isSignIn
                          ? "Send sign-in link"
                          : isSignUp
                            ? "Create account"
                            : "Continue with email"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {!isEmailSent && (
          <p className="text-xs text-center text-muted-foreground">
            By {isSignUp ? "creating an account" : "signing in"}, you agree to
            our terms of service and privacy policy
          </p>
        )}
      </div>
    </div>
  );
}
