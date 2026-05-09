/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net",
              "frame-src https://www.facebook.com https://www.youtube.com https://www.tiktok.com https://www.instagram.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.google.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
