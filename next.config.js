/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GROK_API_KEY: process.env.GROK_API_KEY,
  },
}

module.exports = nextConfig
