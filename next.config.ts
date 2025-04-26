import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.socket.tech',
      },
      {
        protocol: 'https',
        hostname: 'bridgelogos.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Applies to all routes
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, content-type, Authorization',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.safe.global;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
