const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro bundler config. Created by React Native template pattern.
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
