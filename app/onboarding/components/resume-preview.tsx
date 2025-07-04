"use client";

import { FileTextIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface ResumePreviewProps {
  file: File;
}

export function ResumePreview({ file }: ResumePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex cursor-default flex-col items-center justify-center py-4"
    >
      <div className="relative size-full max-w-56 rounded-lg border border-gray-100 bg-white p-6 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
        <div className="absolute left-0 top-0 h-2 w-full rounded-t-lg bg-gradient-to-r from-gray-50 to-gray-100" />
        <div>
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-red-50 p-2">
              <FileTextIcon className="size-6 text-red-500" />
            </div>
            <div>
              <p className="w-36 truncate text-sm font-semibold text-gray-800">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {Math.round(file.size / 1024)} KB
              </p>
            </div>
          </div>
        </div>

        {/* Fake text lines to simulate a document */}
        <div className="mt-4 flex-grow space-y-2 opacity-50">
          <div className="h-1.5 w-full rounded-full bg-gray-200" />
          <div className="h-1.5 w-5/6 rounded-full bg-gray-200" />
          <div className="h-1.5 w-full rounded-full bg-gray-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
          <div className="h-1.5 w-full rounded-full bg-gray-200" />
          <div className="h-1.5 w-3/4 rounded-full bg-gray-200" />
          <div className="h-1.5 w-full rounded-full bg-gray-200" />
          <div className="h-1.5 w-1/2 rounded-full bg-gray-200" />
        </div>
        <div className="pt-4 text-center text-xs text-gray-400">
          Drop a new file to replace
        </div>
      </div>
    </motion.div>
  );
}
