# Custom domain switch

The production domain is `https://1mintool.com`.

1. Confirm canonical URLs, `robots.txt`, `sitemap-index.xml`, RSS, and structured data use `https://1mintool.com`.
2. Add the custom domain to Google Search Console and submit `https://1mintool.com/sitemap-index.xml`.
3. Redirect the production `pages.dev` hostname to the custom domain after verification.

`PUBLIC_SITE_URL` remains available as an override for preview or migration builds.
