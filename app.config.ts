import type { ExpoConfig } from "expo/config";
import { existsSync, readFileSync } from "node:fs";

type AppEnvironment = "development" | "staging" | "production";

const profileToEnvironment: Record<string, AppEnvironment> = {
  development: "development",
  preview: "staging",
  staging: "staging",
  production: "production",
};

function readEnvironment(): AppEnvironment {
  const explicitEnvironment = process.env.APP_ENV as AppEnvironment | undefined;
  if (explicitEnvironment === "development" || explicitEnvironment === "staging" || explicitEnvironment === "production") {
    return explicitEnvironment;
  }

  const profile = process.env.EAS_BUILD_PROFILE ?? "development";
  return profileToEnvironment[profile] ?? "development";
}

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function flag(name: string, publicName: string): boolean {
  return process.env[name] === "1" || process.env[name] === "true" || process.env[publicName] === "1" || process.env[publicName] === "true";
}

function loadLocalEnv(appEnvironment: AppEnvironment) {
  if (process.env.EXPO_NO_DOTENV === "1" || process.env.EXPO_NO_DOTENV === "true") return;
  const environmentFiles = [`.env.${appEnvironment}.local`, `.env.${appEnvironment}`, ...(appEnvironment === "production" ? [] : [".env.local"]), ".env"];
  for (const file of environmentFiles) {
    if (!existsSync(file)) continue;

    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...rest] = trimmed.split("=");
      if (process.env[key]) continue;
      process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

const appEnvironment = readEnvironment();
loadLocalEnv(appEnvironment);
const isProduction = appEnvironment === "production";
const isStaging = appEnvironment === "staging";
const routerRoot = isProduction ? "app-production" : "app";
const appName = env("APP_NAME", isProduction ? "Adaptive Strength Coach" : isStaging ? "Adaptive Strength Coach Staging" : "Adaptive Strength Coach Dev");
const appDownloadUrl = env("APP_DOWNLOAD_URL", "https://adaptivestrengthcoach.com/download");
const appStoreUrl = process.env.APP_STORE_URL;
const googlePlayUrl = process.env.GOOGLE_PLAY_URL;
const revenueCatEntitlementId = env("EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID", "premium");
const revenueCatMonthlyProductId = env("EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID", "subscription_monthly_1");
const revenueCatAnnualProductId = env("EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID", "annual_subscription");

const config: ExpoConfig = {
  name: appName,
  slug: env("APP_SLUG", "hypertrophy-app"),
  version: env("APP_VERSION", "1.1.2"),
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: env("APP_SCHEME", isProduction ? "ironlogic" : isStaging ? "ironlogic-staging" : "ironlogic-dev"),
  userInterfaceStyle: "dark",
  ios: {
    version: env("APP_IOS_VERSION", "1.1.2"),
    icon: "./assets/icon.png",
    supportsTablet: true,
    bundleIdentifier: env(
      "APP_IOS_BUNDLE_IDENTIFIER",
      isProduction
        ? "com.aaronparry.adaptivestrengthcoach"
        : isStaging
          ? "com.aaronparry.adaptivestrengthcoach.staging"
          : "com.aaronparry.adaptivestrengthcoach.dev",
    ),
    buildNumber: env("APP_IOS_BUILD_NUMBER", "53"),
    associatedDomains: ["applinks:adaptivestrengthcoach.com"],
    infoPlist: {
      CFBundleDisplayName: env("APP_IOS_DISPLAY_NAME", appName),
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: env(
      "APP_ANDROID_PACKAGE",
      isProduction
        ? "com.aaronparry.adaptivestrengthcoach"
        : isStaging
          ? "com.aaronparry.adaptivestrengthcoach.staging"
          : "com.aaronparry.adaptivestrengthcoach.dev",
    ),
    versionCode: Number.parseInt(env("APP_ANDROID_VERSION_CODE", "112"), 10),
    adaptiveIcon: {
      backgroundColor: "#080A0F",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "adaptivestrengthcoach.com",
            pathPrefix: "/download",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    ["expo-router", { root: routerRoot }],
    "expo-font",
    "expo-sharing",
    "expo-sqlite",
    "expo-secure-store",
    [
      "expo-build-properties",
      {
        ios: {
          buildReactNativeFromSource: true,
        },
      },
    ],
    "./plugins/with-ios-path-safe-scripts",
  ],
  extra: {
    appEnvironment,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    revenueCatTestApiKey: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
    revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    revenueCatAndroidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    revenueCatEntitlementId,
    revenueCatMonthlyProductId,
    revenueCatAnnualProductId,
    ...(!isProduction ? { designQaMode: process.env.EXPO_PUBLIC_DESIGN_QA_MODE === "1" } : {}),
    ...(!isProduction ? { qaPremiumFixture: process.env.EXPO_PUBLIC_QA_PREMIUM_FIXTURE === "1" } : {}),
    ...(!isProduction ? { qaBuildIdentity: process.env.EXPO_PUBLIC_QA_BUILD_ID } : {}),
    coachingEngineV3: {
      enabled: flag("ASC_COACHING_ENGINE_V3", "EXPO_PUBLIC_ASC_COACHING_ENGINE_V3"),
      activeWorkout: flag("ASC_V3_ACTIVE_WORKOUT", "EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT"),
      qualityGateStrict: flag("ASC_V3_QUALITY_GATE_STRICT", "EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT"),
      shadowMode: flag("ASC_V3_SHADOW_MODE", "EXPO_PUBLIC_ASC_V3_SHADOW_MODE"),
    },
    ...(!isProduction ? { ordinaryV2ShadowObservationEnabled: process.env.EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION === "enabled" } : {}),
    eas: {
      projectId: env("EAS_PROJECT_ID", "74af0233-9986-445e-b138-8210fa059bfc"),
    },
    privacyPolicyUrl: env("APP_PRIVACY_POLICY_URL", "https://adaptivestrengthcoach.com/privacy"),
    termsUrl: env("APP_TERMS_URL", "https://adaptivestrengthcoach.com/terms"),
    supportEmail: env("APP_SUPPORT_EMAIL", "support@adaptivestrengthcoach.com"),
    appDownloadUrl,
    appStoreUrl,
    googlePlayUrl,
    appStoreReviewNotes: "RevenueCat, Apple Watch, and live billing are placeholders for beta readiness.",
  },
};

export default config;
