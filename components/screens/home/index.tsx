import { UserButton } from "@/components/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import * as FadeIn from "@/components/motion/staggers/fade";
import { Footer } from "@/components/ui/footer";

import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("Home");
  return (
    <FadeIn.Container>
      <FadeIn.Item>
        <Image
          className="mb-2"
          src="/images/blockclock.png"
          alt="William"
          width={60}
          height={60}
        />
      </FadeIn.Item>
      <FadeIn.Item>
        <div className="flex justify-between items-start">
          <div>
            <h1>{t("title")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <LanguageSwitcher />
          </div>
        </div>
      </FadeIn.Item>
      <div className="mt-2.5" />
      <FadeIn.Item>
        <p>A landing page template for a blog.</p>
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </FadeIn.Item>

      <div className="mt-2.5" />
      <FadeIn.Item>
        <Footer />
      </FadeIn.Item>
    </FadeIn.Container>
  );
}
