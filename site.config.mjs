const fallbackSiteUrl = "https://1mintool.com";
const configuredSiteUrl = process.env.PUBLIC_SITE_URL?.trim();

export const SITE_URL = (configuredSiteUrl || fallbackSiteUrl).replace(/\/+$/, "");
