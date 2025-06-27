export function parseAshby(html: string) {
  const jobs = [];
  const jobPostingRegex = /<a href="(\/jobs\/[^\s"]+)"[^>]*>\s*<div[^>]*>([^<]+)<\/div>/g;
  let match;

  while ((match = jobPostingRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    jobs.push({ title, url });
  }

  return jobs;
}
