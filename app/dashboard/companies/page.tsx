import { Companies } from "@/components/admin/companies";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Companies</h3>
        <p className="text-sm text-muted-foreground">
          Manage the companies that are scraped for job postings.
        </p>
      </div>
      <Companies />
    </div>
  );
}
