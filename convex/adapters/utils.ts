import { DOMParser } from "xmldom";
import xpath from "xpath";

export function extractLinksWithXPath(
  html: string,
  baseUrl: string,
  containerXPath: string,
): string[] {
  const parser = new DOMParser({ errorHandler: () => {} });
  const doc = parser.parseFromString(html, "text/html");

  // Select all <a> elements within the container
  const nodes = xpath.select(`${containerXPath}//a`, doc) as any[];
  console.log(`XPath '${containerXPath}' found nodes:`, nodes.length);

  const links: string[] = [];
  for (const node of nodes) {
    const href = node.getAttribute
      ? node.getAttribute("href")
      : node.attributes?.getNamedItem?.("href")?.value;
    if (href) {
      links.push(href.startsWith("http") ? href : new URL(href, baseUrl).href);
    }
  }
  console.log(`Links extracted:`, links.slice(0, 10));
  return Array.from(new Set(links));
}
