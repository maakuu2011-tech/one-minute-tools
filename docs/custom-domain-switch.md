# Custom domain switch

After the domain is registered and connected to Cloudflare Pages:

1. Add `PUBLIC_SITE_URL=https://example.com` to the Pages production environment variables.
2. Redeploy the production branch.
3. Confirm canonical URLs, `robots.txt`, `sitemap-index.xml`, RSS, and structured data use the custom domain.
4. Add the custom domain to Google Search Console and submit `https://example.com/sitemap-index.xml`.
5. Redirect the production `pages.dev` hostname to the custom domain after verification.

Until `PUBLIC_SITE_URL` is set, builds continue to use `https://one-minute-tools.pages.dev`.
