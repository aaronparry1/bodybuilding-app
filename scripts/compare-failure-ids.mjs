import fs from "node:fs";

const [baselinePath, candidatePath] = process.argv.slice(2);
if (!baselinePath || !candidatePath) throw new Error("usage: node scripts/compare-failure-ids.mjs baseline.json candidate.json");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const baseline = new Set(read(baselinePath).failureIds ?? []);
const candidate = new Set(read(candidatePath).failureIds ?? []);
const difference = (a, b) => [...a].filter((value) => !b.has(value)).sort();
console.log(JSON.stringify({ unchanged: [...candidate].filter((value) => baseline.has(value)).sort(), newlyFailing: difference(candidate, baseline), newlyPassing: difference(baseline, candidate) }, null, 2));
