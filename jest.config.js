module.exports = {
    preset: 'react-native',

    transform: {
        '^.+\\.(js|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-native-community)/)',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|react-native-linear-gradient)/)',
      ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
