import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    typescript: {
        ignoreBuildErrors: true,
    },

    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        reactCompiler: true,
        serverActions: {
            bodySizeLimit: '35MB',
        },
    },
}

export default nextConfig
