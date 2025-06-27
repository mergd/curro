"use client";

import { api } from "@/convex/_generated/api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string(),
  website: z.string().url(),
  jobBoardUrl: z.string().url(),
  sourceType: z.enum(["ashby", "greenhouse", "other"]),
});

export function Companies() {
  const companies = useQuery(api.companies.list);
  const addCompany = useMutation(api.companies.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      website: "",
      jobBoardUrl: "",
      sourceType: "other",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await addCompany(values);
    form.reset();
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name">Company Name</label>
          <input
            {...form.register("name")}
            id="name"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            {...form.register("website")}
            id="website"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="jobBoardUrl">Job Board URL</label>
          <input
            {...form.register("jobBoardUrl")}
            id="jobBoardUrl"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="sourceType">Source Type</label>
          <select
            {...form.register("sourceType")}
            id="sourceType"
            className="border p-2 w-full"
          >
            <option value="ashby">Ashby</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Company
        </button>
      </form>

      <div className="mt-8">
        <h4 className="font-medium">Current Companies</h4>
        <ul>
          {companies?.map((company) => (
            <li
              key={company._id}
              className="flex justify-between items-center py-2 border-b"
            >
              <span>
                {company.name} ({company.jobBoardUrl})
              </span>
              {/* Add a delete button here */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
