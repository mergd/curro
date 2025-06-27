"use client";

import { AppThemeProvider } from "@/components/theme";
import { Locale } from "@/lib/i18n/routing";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProvidersProps {
  children: React.ReactNode;
  messages: Record<string, any>;
  locale: Locale;
}

export const Providers = ({ children, messages, locale }: ProvidersProps) => {
  return (
    <ConvexAuthProvider client={convex}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ViewTransitions>
          <AppThemeProvider enableSystem={false}>{children}</AppThemeProvider>
        </ViewTransitions>
      </NextIntlClientProvider>
    </ConvexAuthProvider>
  );
};
