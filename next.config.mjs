/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yxrrnpoezyvgogbfbvji.supabase.co",
      },
    ],
  },
};

export default nextConfig;
