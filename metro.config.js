const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure Metro can resolve images properly
config.resolver.assetExts.push("png", "jpg", "jpeg", "gif", "svg", "webp");

module.exports = withNativeWind(config, { input: "./app/global.css" });
