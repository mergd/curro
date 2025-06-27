"use client";

import type { Locale } from "@/lib/i18n/routing";

import { locales } from "@/lib/i18n/routing";

import { CheckIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

const languageNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
};

const languageFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  zh: "🇨🇳",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;

  const handleLanguageChange = (newLocale: Locale) => {
    // Set cookie and refresh page
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    window.location.reload();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="2" className="gap-2">
          <Languages className="size-4" />
          <span className="hidden sm:inline">
            {languageFlags[locale]} {languageNames[locale]}
          </span>
          <span className="sm:hidden">{languageFlags[locale]}</span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {locales.map((lang) => (
          <DropdownMenu.Item
            className="gap-1"
            key={lang}
            onClick={() => handleLanguageChange(lang)}
          >
            <span className="text-base">{languageFlags[lang]}</span>
            <span className="flex-1">{languageNames[lang]}</span>
            {locale === lang && <CheckIcon className="size-4 ml-3" />}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
