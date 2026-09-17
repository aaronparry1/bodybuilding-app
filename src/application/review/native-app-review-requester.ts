import { Linking, Platform } from "react-native";
import type { NativeAppReviewRequester } from "@/application/review/app-review-prompt";

const APP_STORE_ID = "6762462649";
const PLAY_PACKAGE = "com.aaronparry.adaptivestrengthcoach";

/**
 * Uses the native in-app rating sheet (expo-store-review) when the module is
 * present in the build, and falls back to opening the store's review page
 * otherwise. The policy for *when* to ask lives in app-review-prompt.ts.
 */
export const nativeAppReviewRequester: NativeAppReviewRequester = {
  async isAvailable() {
    const storeReview = loadStoreReview();
    if (storeReview) {
      try {
        return await storeReview.isAvailableAsync();
      } catch {
        return false;
      }
    }
    return Platform.OS === "ios" || Platform.OS === "android";
  },
  async requestReview() {
    const storeReview = loadStoreReview();
    if (storeReview) {
      await storeReview.requestReview();
      return true;
    }
    const url = Platform.OS === "ios"
      ? `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`
      : `market://details?id=${PLAY_PACKAGE}`;
    await Linking.openURL(url);
    return true;
  },
};

type StoreReviewModule = { isAvailableAsync(): Promise<boolean>; requestReview(): Promise<void> };

function loadStoreReview(): StoreReviewModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-store-review") as StoreReviewModule;
  } catch {
    return null;
  }
}
