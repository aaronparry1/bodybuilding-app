import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildCanonicalGeneratorPersonaCertification } from "@/domain/training/canonical-generator-persona-certification";

const outputDirectory = join(process.cwd(), "qa-reports", "generator-certification");
mkdirSync(outputDirectory, { recursive: true });
const output = join(outputDirectory, "canonical-generator-persona-certification.json");
writeFileSync(output, `${JSON.stringify(buildCanonicalGeneratorPersonaCertification(), null, 2)}\n`);
console.log(output);
