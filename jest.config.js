module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)',
    ],
    setupFilesAfterEnv: ['@testing-library/react-native/cleanup-after-each'],
    moduleNameMapper: {
        '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    },
};
