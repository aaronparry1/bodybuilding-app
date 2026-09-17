const APP_STORE_URL = "https://apps.apple.com/gb/app/adaptive-strength-coach/id6762462649";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.aaronparry.adaptivestrengthcoach";

function detectDeviceStore(userAgent = navigator.userAgent) {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function setupDownloadPage() {
  const device = detectDeviceStore();
  const status = document.querySelector("[data-device-status]");
  const primary = document.querySelector("[data-primary-store]");
  if (!status || !primary) return;

  if (device === "ios") {
    status.textContent = "Looks like iPhone or iPad. Download from the App Store and start your 14-day free trial.";
    primary.textContent = "Download on the App Store";
    primary.setAttribute("href", APP_STORE_URL);
    return;
  }

  if (device === "android") {
    status.textContent = "Looks like Android. Google Play release is being prepared.";
    primary.textContent = "Google Play coming soon";
    primary.setAttribute("href", PLAY_STORE_URL);
    return;
  }

  status.textContent = "Choose your platform. iPhone users can download from the App Store now.";
  primary.textContent = "Download on the App Store";
  primary.setAttribute("href", "#store-options");
}

setupDownloadPage();
