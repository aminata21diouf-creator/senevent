const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Racine du monorepo (deux niveaux au-dessus de apps/mobile)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Surveiller tout le monorepo (pour voir packages/shared)
config.watchFolders = [monorepoRoot];

// 2. Chercher les modules dans les deux node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
