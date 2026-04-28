import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // ✅ Pas de rewrites — le proxy catch-all gère tout
  // Les rewrites et le proxy catch-all en même temps créent des conflits
};

export default nextConfig;
