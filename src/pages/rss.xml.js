import updates from "../data/siteUpdates.json";
import { SITE_URL } from "../../site.config.mjs";

const siteUrl = SITE_URL;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function GET() {
  const items = updates
    .map((item) => {
      const url = new URL(item.href, siteUrl).toString();
      return `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid>${escapeXml(url)}#${escapeXml(item.date)}-${escapeXml(item.title)}</guid>
  <pubDate>${new Date(`${item.date}T00:00:00+09:00`).toUTCString()}</pubDate>
  <description>${escapeXml(item.description)}</description>
</item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>1分ツール 更新情報</title>
  <link>${siteUrl}/</link>
  <description>1分ツールの新しいツール、1分コンテンツ、サイト改善の更新情報です。</description>
  <language>ja</language>
  ${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
