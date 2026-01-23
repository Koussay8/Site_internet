/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development
    reactStrictMode: true,

    // Optimize images
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },

    // Experimental features for better performance
    experimental: {
        // Optimize package imports
        optimizePackageImports: ['lucide-react', 'recharts'],
    },

    // Compiler optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Headers for caching static assets
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|png|webp|avif|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
