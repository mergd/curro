import type { Locale } from "./routing";

import { Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import { defaultLocale, locales } from "./routing";

export const formats = {
  dateTime: {
    short: {
      dateStyle: "short",
    },
  },
} satisfies Formats;

export default getRequestConfig(async () => {
  // Get locale from cookies
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale;

  // Use cookie locale if valid, otherwise use default
  const validLocale = locales.includes(locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    formats,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});
