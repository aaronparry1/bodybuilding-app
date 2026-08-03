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
  "delete-account/verify/index.html",
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

const deletionPage = readFileSync(join(root, "delete-account/index.html"), "utf8");
const deletionVerifyPage = readFileSync(join(root, "delete-account/verify/index.html"), "utf8");
const deletionVerifyScript = readFileSync(join(root, "delete-account/verify.js"), "utf8");
for (const phrase of [
  "Delete your Adaptive Strength Coach account",
  "Arx Algorithms",
  'action="/api/delete-account/request"',
  "Data deleted",
  "Data not controlled by the deleted app account",
  'href="/privacy/"',
  'rel="canonical" href="https://adaptivestrengthcoach.com/delete-account/"',
]) {
  if (!deletionPage.includes(phrase)) throw new Error(`Deletion page missing phrase: ${phrase}`);
}
if (!deletionVerifyPage.includes("data-confirm-deletion") || !deletionVerifyScript.includes("/api/delete-account/confirm")) {
  throw new Error("Deletion verification page is missing secure confirmation plumbing");
}

console.log("Website routes and assets verified.");
