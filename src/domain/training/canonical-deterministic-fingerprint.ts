/**
 * Canonical, runtime-portable serialization for durable reconciliation
 * fingerprints. Object keys are sorted; array order remains authoritative.
 * The full canonical value is retained deliberately so reconciliation never
 * relies on a lossy or collision-prone digest.
 */
export function canonicalDeterministicFingerprint(value: unknown): string {
  return `canonical_fingerprint_v1|${stable(value)}`;
}

export function canonicalDeterministicFingerprintId(value: unknown): string {
  const input = canonicalDeterministicFingerprint(value);
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193);
    right = Math.imul(right ^ (code + index), 0x85ebca6b);
  }
  return `${(left >>> 0).toString(16).padStart(8, "0")}${(right >>> 0).toString(16).padStart(8, "0")}`;
}

function stable(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);
  if (value === undefined) return '"__undefined__"';
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(String(value));
}
