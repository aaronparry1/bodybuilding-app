import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "public");
const requiredRoutes = [
  "index.html",
  "download/index.html",
  "features/index.html",
  "pricing/index.html",
  "faq/index.html",
  "support/index.html",
  "privacy/index.html",
  "terms/index.html",
  "delete-account/index.html",
  "404.html",
];
const requiredAssets = [
  "assets/logo.png",
  "assets/favicon.png",
  "assets/screenshots/home.png",
  "assets/screenshots/workout.png",
  "assets/screenshots/progress-dashboard.png",
  "assets/screenshots/workout-review-pr.jpg",
  "assets/screenshots/recovery-capacity.png",
  "assets/screenshots/powerlifting-meet.png",
];

for (const route of requiredRoutes) {
  const path = join(root, route);
  if (!existsSync(path)) throw new Error(`Missing route: ${route}`);
}

for (const asset of requiredAssets) {
  const path = join(root, asset);
  if (!existsSync(path)) throw new Error(`Missing asset: ${asset}`);
}

const homepage = readFileSync(join(root, "index.html"), "utf8");
for (const phrase of ["Adaptive Strength Coach", "Strength Dashboard", "Recovery & Capacity", "Powerlifting Meet", "/download"]) {
  if (!homepage.includes(phrase)) throw new Error(`Homepage missing phrase: ${phrase}`);
}

const download = readFileSync(join(root, "download/index.html"), "utf8");
const siteScript = readFileSync(join(root, "site.js"), "utf8");
if (!download.includes("data-device-status") || !siteScript.includes("detectDeviceStore") || !siteScript.includes("APP_STORE_URL") || !siteScript.includes("PLAY_STORE_URL")) {
  throw new Error("Download page is missing smart-link plumbing");
}

console.log("Website routes and assets verified.");
