import { formats } from "@/lib/i18n/request";
import { locales } from "@/lib/i18n/routing";

import messages from "../messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
