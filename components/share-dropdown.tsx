"use client";

import Copyable from "@/components/icons/copyable";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MailIcon, Share2Icon } from "lucide-react";

interface ShareDropdownProps {
  title: string;
  url?: string;
}

export function ShareDropdown({ title, url }: ShareDropdownProps) {
  const currentUrl =
    (url ?? typeof window !== "undefined") ? window.location.href : "";

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${title}&body=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="size-8 items-center justify-center rounded-md p-2 hover:bg-gray-4"
        >
          <Share2Icon className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="max-w-[250px] rounded-md bg-gray-2 p-1.5 shadow-md"
          sideOffset={5}
          align="end"
        >
          <div className="mb-1 px-2 py-1">
            <h3 className="font-medium text-gray-12 text-sm">
              Share this link
            </h3>
          </div>
          <DropdownMenu.Item
            onSelect={(e) => e.preventDefault()}
            className="flex cursor-default items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-4"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-gray-11 text-sm">{currentUrl}</div>
            </div>
            <Copyable text={currentUrl} className="size-4 shrink-0" />
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-6" />
          <DropdownMenu.Item
            className="flex cursor-default items-center gap-2 rounded px-2 py-1.5 outline-none hover:bg-gray-4"
            onSelect={handleEmailShare}
          >
            <MailIcon className="size-4" />
            <span className="text-sm">Email</span>
          </DropdownMenu.Item>
          {/* Social Media Sharing Options */}
          {/* <DropdownMenu.Item className="flex gap-2 items-center px-2 py-1.5 outline-none cursor-default rounded hover:bg-gray-4">
            <TwitterIcon className="size-4" />
            <span className="text-sm">Twitter</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex gap-2 items-center px-2 py-1.5 outline-none cursor-default rounded hover:bg-gray-4">
            <FacebookIcon className="size-4" />
            <span className="text-sm">Facebook</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex gap-2 items-center px-2 py-1.5 outline-none cursor-default rounded hover:bg-gray-4">
            <RedditIcon className="size-4" />
            <span className="text-sm">Reddit</span>
          </DropdownMenu.Item> */}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
