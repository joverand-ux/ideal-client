import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const response = await axios.get(normalized, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ConnectIQ/1.0)" },
    });
    const $ = cheerio.load(response.data as string);
    $("script, style, nav, footer, header").remove();
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
  } catch {
    return "";
  }
}

export async function researchCompany(companyName: string, website: string | null): Promise<string> {
  let content = `Company: ${companyName}\n`;
  if (website) {
    const scraped = await scrapeWebsite(website);
    if (scraped) content += `\nWebsite content:\n${scraped}`;
  }
  return content;
}
