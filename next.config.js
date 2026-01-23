/** @type {import('next').NextConfig} */
const nextConfig = {
    // ===== PRODUCTION OPTIMIZATION =====
    reactStrictMode: true,
    poweredByHeader: false, // Masque "X-Powered-By: Next.js"

    // Mobile dev access
    allowedDevOrigins: ['http://10.192.34.112:3000'],

    // ===== IMAGE OPTIMIZATION =====
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 31536000, // 1 an pour les images
    },

    // ===== EXPERIMENTAL FEATURES =====
    experimental: {
        // Optimisation agressive des imports pour réduire le bundle
        optimizePackageImports: [
            'lucide-react',
            'recharts', 
            'motion',
            '@supabase/supabase-js'
        ],
    },

    // ===== COMPILER OPTIMIZATIONS =====
    compiler: {
        // Supprimer console.log en production (garde error/warn)
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn']
        } : false,
    },

    // ===== SECURITY & CACHING HEADERS =====
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                ],
            },
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
