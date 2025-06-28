"use client";

import { AppThemeProvider } from "@/components/theme";
import { Locale } from "@/lib/i18n/routing";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Provider as JotaiProvider } from "jotai";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProvidersProps {
  children: React.ReactNode;
  messages: Record<string, any>;
  locale: Locale;
}

export const Providers = ({ children, messages, locale }: ProvidersProps) => {
  return (
    <JotaiProvider>
      <ConvexAuthProvider client={convex}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ViewTransitions>
            <NuqsAdapter>
              <AppThemeProvider enableSystem={false}>
                {children}
              </AppThemeProvider>
            </NuqsAdapter>
          </ViewTransitions>
        </NextIntlClientProvider>
      </ConvexAuthProvider>
    </JotaiProvider>
  );
};
