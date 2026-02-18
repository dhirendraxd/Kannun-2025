import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://kannun-2025.vercel.app").replace(/\/$/, "");

const routes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/universities", changefreq: "daily", priority: "0.9" },
  { path: "/resources", changefreq: "weekly", priority: "0.8" },
  { path: "/login", changefreq: "monthly", priority: "0.4" },
  { path: "/signup", changefreq: "monthly", priority: "0.5" }
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const outputPath = resolve(process.cwd(), "public", "sitemap.xml");
writeFileSync(outputPath, xml, "utf8");
console.log(`Generated sitemap at ${outputPath} using ${siteUrl}`);
