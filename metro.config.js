// metro.config.js
// Diperlukan agar expo-sqlite berfungsi di web (Web Worker & Wasm support)
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Let Metro treat .wasm files as assets
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// Aktifkan dukungan SQLite Web Worker
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
