import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❌ Hace que el build no falle por errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❌ Hace que el build no falle por errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
