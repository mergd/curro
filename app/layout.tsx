import "@/styles/main.css";

import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { OpenGraph } from "@/lib/og";
import { fonts } from "@/styles/fonts";

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
      <body suppressHydrationWarning>
        <Providers messages={messages} locale={locale}>
          <Toaster />
          <main className="isolate mx-auto ">
            <article className="article">{children}</article>
          </main>
        </Providers>
      </body>
    </html>
  );
}
