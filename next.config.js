/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'github.com'
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io'
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud'
      }
    ]
  },
  // Enable webpack 5 features
  webpack: (config, { isServer }) => {
    // Handle node modules that need to be transpiled
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      punycode: require.resolve('punycode/')
    };

    // Suppress punycode deprecation warnings
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        punycode: require.resolve('punycode/')
      };
    }

    // Improve chunk loading reliability
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: {
            ...config.optimization.splitChunks?.cacheGroups?.default,
            reuseExistingChunk: true
          }
        }
      }
    };

    return config;
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_STACKS_NETWORK: process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet',
    NEXT_PUBLIC_APP_NAME: 'StacksBuilder',
    NEXT_PUBLIC_APP_DESCRIPTION: 'The premier platform for Stacks developers to showcase their work and connect with opportunities'
  }
};

module.exports = nextConfig;
