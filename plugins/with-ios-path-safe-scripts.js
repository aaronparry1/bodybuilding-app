const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;

  let contents = fs.readFileSync(filePath, "utf8");
  let nextContents = contents;
  for (const [from, to] of replacements) {
    nextContents = nextContents.replace(from, to);
  }

  if (nextContents !== contents) {
    fs.writeFileSync(filePath, nextContents);
  }
}

function patchExpoConstants(projectRoot) {
  replaceInFile(path.join(projectRoot, "node_modules/expo-constants/scripts/get-app-config-ios.sh"), [
    ["PROJECT_DIR_BASENAME=$(basename $PROJECT_DIR)", 'PROJECT_DIR_BASENAME=$(basename "$PROJECT_DIR")'],
  ]);

  replaceInFile(path.join(projectRoot, "node_modules/expo-constants/ios/EXConstants.podspec"), [
    ['env_vars = ENV[\'PROJECT_ROOT\'] ? "PROJECT_ROOT=#{ENV[\'PROJECT_ROOT\']} " : ""', 'env_vars = ENV[\'PROJECT_ROOT\'] ? "PROJECT_ROOT=\\"#{ENV[\'PROJECT_ROOT\']}\\" " : ""'],
    [
      ':script => "bash -l -c \\"#{env_vars}$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"",',
      ':script => "#{env_vars}bash -l \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"",',
    ],
  ]);
}

function patchBundleScript(projectRoot) {
  const iosDir = path.join(projectRoot, "ios");
  if (!fs.existsSync(iosDir)) return;

  for (const entry of fs.readdirSync(iosDir)) {
    if (!entry.endsWith(".xcodeproj")) continue;

    replaceInFile(path.join(iosDir, entry, "project.pbxproj"), [
      [
        '`\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\"`\\n\\n',
        'REACT_NATIVE_XCODE_SCRIPT=\\"$(\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\")\\"\\n/bin/sh \\"$REACT_NATIVE_XCODE_SCRIPT\\"\\n\\n',
      ],
    ]);
  }
}

module.exports = function withIosPathSafeScripts(config) {
  return withDangerousMod(config, [
    "ios",
    (nextConfig) => {
      patchExpoConstants(nextConfig.modRequest.projectRoot);
      patchBundleScript(nextConfig.modRequest.projectRoot);
      return nextConfig;
    },
  ]);
};
