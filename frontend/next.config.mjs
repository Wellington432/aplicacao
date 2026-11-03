/** @type {import('next').NextConfig} */

// Libera as imagens de produto vindas da API. Antes só funcionava em
// http://localhost:3333 — em produção (outro domínio) as imagens quebravam.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(':', ''),
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
