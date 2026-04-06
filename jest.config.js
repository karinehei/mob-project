module.exports = {
    preset: 'react-native',


    transform: {
      '^.+\\.(js|ts|tsx)$': 'ts-jest',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
