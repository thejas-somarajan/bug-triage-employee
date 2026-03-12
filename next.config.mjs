/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@radix-ui/react-dialog",
    "@radix-ui/react-select",
    "@radix-ui/react-label",
    "@radix-ui/react-slot",
  ],
}

export default nextConfig
