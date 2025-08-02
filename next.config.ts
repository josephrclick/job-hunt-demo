import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose the OpenAI model to the client (fallback matches server default)
  env: {
    NEXT_PUBLIC_OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle pdf-parse native dependencies for server-side rendering
      config.externals = config.externals || [];
      config.externals.push({
        "pdf-parse/test": "commonjs pdf-parse/test",
      });

      // Ignore test files and other problematic files in pdf-parse
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdf-parse/test": false,
      };
    }

    // Suppress the critical dependency warning from @supabase/realtime-js
    config.module = config.module || {};
    config.module.exprContextCritical = false;

    return config;
  },

  async headers() {
    return [
      {
        // This will apply the headers to all routes under /api/
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Or your specific origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
