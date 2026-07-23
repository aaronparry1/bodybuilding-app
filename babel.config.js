module.exports = function configureBabel(api) {
  api.cache.using(() => process.env.APP_ENV ?? "development");
  return {
    presets: ["babel-preset-expo"],
    plugins: process.env.APP_ENV === "production" ? ["./scripts/babel-strip-dev-client-probes.cjs"] : [],
  };
};
