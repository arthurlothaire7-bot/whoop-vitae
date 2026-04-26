/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    appDir: true,
      },
        env: {
    WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID,
          WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET,
          WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
};

module.exports = nextConfig;
