import "@/styles/main.css";
import "@radix-ui/themes/styles.css";

import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { OpenGraph } from "@/lib/og";
import { fonts } from "@/styles/fonts";

import { Theme } from "@radix-ui/themes";
import clsx from "clsx";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  ...OpenGraph,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} className={clsx(fonts)} suppressHydrationWarning>
      <body>
        <Providers messages={messages} locale={locale}>
          <Theme accentColor="gray" radius="large" scaling="90%">
            <Toaster />
            <main className="isolate mx-auto ">
              <article className="article">{children}</article>
            </main>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
