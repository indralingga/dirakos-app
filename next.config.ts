import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["whatsapp-web.js", "puppeteer-extra", "puppeteer-extra-plugin-stealth"],
};

export default nextConfig;
