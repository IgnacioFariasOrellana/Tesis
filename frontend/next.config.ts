import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: process.env.SUPABASE_URL
      ? [{ protocol: "https" as const, hostname: new URL(process.env.SUPABASE_URL).hostname, pathname: "/storage/v1/object/public/product-images/**" }]
      : [],
  },
};
export default nextConfig;
