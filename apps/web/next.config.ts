import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/today", destination: "/", permanent: false },
    ];
  },
  transpilePackages: [
    'neyro-mobile',
    'expo',
    'expo-modules-core',
    'expo-sqlite',
    'expo-keep-awake',
    'expo-crypto',
    'expo-font',
    'expo-asset',
    'expo-constants'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'expo-sqlite': path.join(__dirname, 'mocks/empty-mock.js'),
      'expo-secure-store': path.join(__dirname, 'mocks/expo-secure-store.js'),
      'expo-crypto': path.join(__dirname, 'mocks/expo-crypto.js'),
      'drizzle-orm/expo-sqlite': path.join(__dirname, 'mocks/empty-mock.js'),
      '@mobile': path.join(__dirname, '../mobile/src'),
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...(config.resolve.extensions || []),
    ];
    return config;
  },
};

export default nextConfig;
