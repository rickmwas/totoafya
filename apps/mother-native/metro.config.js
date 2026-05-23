const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Resolution strategy
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force alias for semver (Fixes Reanimated resolution issues in monorepos)
config.resolver.extraNodeModules = {
  'semver': path.resolve(workspaceRoot, 'node_modules/semver'),
};

config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: './src/global.css' });
