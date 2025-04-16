import envConfig from "@/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(envConfig.NEXT_PUBLIC_URL_IMAGE + "/**")],
  },
};

export default nextConfig;
