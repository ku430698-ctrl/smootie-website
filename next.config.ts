import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/insights",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/inquiries",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
