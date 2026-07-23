import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

export const forbiddenProductionPayloadMarkers = [
  "train_load_escalation_modal",
  "[design qa fixture]",
  "design-qa:",
  "design-qa-athlete",
  "design-qa-local",
  "design_qa_canonical",
  "design qa fixture active",
  "design qa mode",
  "qahomepreview",
  "qaplanpreview",
  "qaprogresspreview",
  "qaview=",
  "qaendconfirm",
  "v2-benchmark-qa",
  "ordinary-v2-certified.v1",
  "ordinary-v2-boundary-event.v1",
  "v2_ordinary_canary",
  "exdevlauncher",
  "exdevmenu",
  "expo-dev-client",
];

export function scanProductionPayload(root) {
  const absoluteRoot = resolve(root);
  if (!existsSync(absoluteRoot)) throw new Error(`production_payload_missing:${absoluteRoot}`);
  const findings = [];
  for (const file of filesUnder(absoluteRoot)) {
    const contents = readFileSync(file).toString("latin1").toLowerCase();
    for (const marker of forbiddenProductionPayloadMarkers) if (contents.includes(marker)) findings.push({ file, marker });
  }
  return { schemaVersion: "canonical_production_payload_scan_v1", root: absoluteRoot, scannedFiles: filesUnder(absoluteRoot).length, status: findings.length ? "failed" : "passed", findings };
}

function filesUnder(root) {
  if (statSync(root).isFile()) return [root];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? filesUnder(path) : entry.isFile() ? [path] : [];
  }).sort();
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const result = scanProductionPayload(process.argv[2] ?? "");
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== "passed") process.exitCode = 1;
}
