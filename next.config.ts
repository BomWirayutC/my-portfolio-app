import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https', // or 'http'
        hostname: 'iotwlprsgduofjzickdl.supabase.co', // Replace with the actual hostname of your image source
        // port: '', // Optional: if a specific port is used
        // pathname: '/path/to/images/**', // Optional: if images are within a specific path
      },
      // Add more objects for other external domains if needed
    ],
  },
};

export default nextConfig;
