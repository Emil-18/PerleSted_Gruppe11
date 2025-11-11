// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);


config.resolver.unstable_enablePackageExports = true;
config.resolver.mainFields = ["react-native", "browser", "main"];

config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = config;