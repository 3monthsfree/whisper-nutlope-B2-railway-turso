import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize libsql packages to avoid bundling issues
      config.externals.push({
        'libsql': 'commonjs libsql',
        '@libsql/client': 'commonjs @libsql/client',
      });
    }

    // Ignore non-JS files (README.md, LICENSE) in node_modules
    config.module.rules.push({
      test: /\.(md|txt)$/,
      type: 'asset/source',
      parser: {
        dataUrlCondition: {
          maxSize: 0, // Never inline
        },
      },
    });

    return config;
  },
};

export default nextConfig;
