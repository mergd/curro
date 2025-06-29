import Link from "@/components/ui/link";

import { MessageCircleQuestionIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <div className="group relative flex items-baseline gap-2">
        <h1 className="bg-linear-to-r from-gray-12 to-gray-11 bg-clip-text font-bold text-2xl text-transparent">
          404
        </h1>
        <MessageCircleQuestionIcon className="group-hover:-rotate-12 size-6 text-gray-11 transition-all duration-300 group-hover:text-primary-9" />
      </div>
      <p className="mt-2 text-base text-gray-11">
        This page could not be found
      </p>
      <Link
        underline
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-sm hover:text-primary-11"
      >
        Go back to the home page
      </Link>
    </div>
  );
}
