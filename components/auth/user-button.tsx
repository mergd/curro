"use client";

import { api } from "@/convex/_generated/api";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useQuery } from "convex/react";
import { LogIn, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordInput } from "./password-input";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function UserButton() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.currentUser);
  const [open, setOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signIn("password", {
        email: values.email,
        password: values.password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      form.reset();
      setOpen(false);

      if (isSignUp) {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage =
        error.data?.message || "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant="solid" size="2">
            <LogIn className="size-4" />
            Sign In
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="400px">
          <Dialog.Title>{isSignUp ? "Create Account" : "Sign In"}</Dialog.Title>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3" mt="4">
              <TextField.Root
                type="email"
                placeholder="Email"
                {...form.register("email")}
                required
              />
              <PasswordInput
                placeholder="Password"
                {...form.register("password")}
                required
              />

              <Flex gap="2" mt="2">
                <Button
                  type="submit"
                  variant="solid"
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Loading..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </Button>
                <Dialog.Close>
                  <Button variant="soft" color="gray" className="flex-1">
                    Cancel
                  </Button>
                </Dialog.Close>
              </Flex>

              <Button
                type="button"
                variant="ghost"
                size="1"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-base"
              >
                {isSignUp ? "Already have an account?" : "Need an account?"}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <Flex align="center" gap="2">
      <Flex align="center" gap="2" className="text-gray-11">
        <User className="size-4" />
        <Text size="2" className="text-base">
          {user.name || user.email || "Anonymous"}
        </Text>
      </Flex>
      <Button
        variant="soft"
        color="gray"
        size="2"
        onClick={() => void signOut()}
      >
        <LogOut className="size-4" />
        Sign Out
      </Button>
    </Flex>
  );
}
