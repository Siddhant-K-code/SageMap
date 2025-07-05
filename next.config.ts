import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from GitPod
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Configure for GitPod compatibility
  experimental: {
    // Future compatibility options can be added here
  },
};

export default nextConfig;
