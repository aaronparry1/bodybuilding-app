const { getDefaultConfig } = require("expo/metro-config");
const exclusionListModule = require("metro-config/private/defaults/exclusionList");
const path = require("node:path");
const exclusionList = exclusionListModule.default ?? exclusionListModule;

const config = getDefaultConfig(__dirname);

const blockedProjectFolders = [
  "dist",
  "ios/build",
  "ios/Pods",
  "hf_portfolio_backtest",
  "qa-screenshots",
  "screenshots",
  "test-results",
  "reports",
].map((folder) => new RegExp(`^${escapePathForRegex(path.join(__dirname, folder))}(?:/.*)?$`));

config.resolver = {
  ...config.resolver,
  blockList: exclusionList([...(Array.isArray(config.resolver?.blockList) ? config.resolver.blockList : []), ...blockedProjectFolders]),
};

config.watcher = {
  ...config.watcher,
  blockList: [...(config.watcher?.blockList ?? []), ...blockedProjectFolders],
  useWatchman: process.env.ASC_METRO_USE_NODE_CRAWLER === "1" ? false : true,
};

module.exports = config;

function escapePathForRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
