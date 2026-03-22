module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|drizzle-orm)',
    ],
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/types/**/*',
        '!src/constants/**/*',
    ],
    testMatch: [
        '**/__tests__/**/*.test.{ts,tsx}',
        '**/?(*.)+(spec|test).{ts,tsx}',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testEnvironment: 'node',
};
