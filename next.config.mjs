/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        {
          module: /node_modules\/source-map/,
          message: /Critical dependency/,
        },
      ];
    }
    return config;
  },
};

export default nextConfig;