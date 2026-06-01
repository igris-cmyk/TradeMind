/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@nivo/core", "@nivo/calendar", "@nivo/heatmap"],
  },
};

export default nextConfig;
