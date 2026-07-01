import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://one-minute-tools.pages.dev",
  integrations: [sitemap()],
});
