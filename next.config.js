/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL === '/api'
  ? 'http://127.0.0.1:4000/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://api.mysandbox.codes/api');
const backendBase = apiUrl.replace(/\/api$/, '');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.mysandbox.codes', 'localhost'],
  },
  async rewrites() {
    return [
      // JSON API and Badge — proxy to backend before [username] catches them
      {
        source: '/:username/json',
        destination: `${backendBase}/public/:username/json`,
      },
      {
        source: '/:username/badge',
        destination: `${backendBase}/public/:username/badge`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/public/:path*',
        destination: `${backendBase}/public/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
