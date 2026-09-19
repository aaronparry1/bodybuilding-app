import { existsSync, readFileSync, readdirSync } from "node:fs";
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
  "privacy-policy/index.html",
  "terms-of-service/index.html",
  "delete-account/index.html",
  "cave/index.html",
  "programmes/index.html",
  "programmes/4-day-upper-lower-hypertrophy/index.html",
  "programmes/3-day-full-body-strength/index.html",
  "programmes/stalled-on-bench/index.html",
  "programmes/sets-per-muscle-group/index.html",
  "programmes/when-to-deload/index.html",
  "delete-account/verify/index.html",
  "404.html",
];
const requiredAssets = [
  "assets/logo.png",
  "assets/favicon.png",
  "assets/fonts/oswald-500.woff2",
  "assets/fonts/oswald-600.woff2",
  "assets/fonts/oswald-700.woff2",
  "assets/fonts/source-sans-3-400.woff2",
  "assets/fonts/source-sans-3-600.woff2",
  "assets/fonts/source-sans-3-400-italic.woff2",
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
  if (asset.endsWith(".woff2") && readFileSync(path).subarray(0, 4).toString() !== "wOF2") {
    throw new Error(`Invalid WOFF2 font: ${asset}`);
  }
}

for (const file of readdirSync(root, { recursive: true }).filter((file) => file.endsWith(".html"))) {
  const html = readFileSync(join(root, file), "utf8");
  if (/free forever|free tier|planning, logging and progress are free|Free: your programme|Get the app, free|working draft/i.test(html)) {
    throw new Error(`Outdated pricing or draft copy: ${file}`);
  }
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
  'href="/privacy-policy/"',
  'rel="canonical" href="https://adaptivestrengthcoach.com/delete-account/"',
]) {
  if (!deletionPage.includes(phrase)) throw new Error(`Deletion page missing phrase: ${phrase}`);
}
if (!deletionVerifyPage.includes("data-confirm-deletion") || !deletionVerifyScript.includes("/api/delete-account/confirm")) {
  throw new Error("Deletion verification page is missing secure confirmation plumbing");
}

console.log("Website routes and assets verified.");
