import { randomBytes } from "crypto";

export function createPublicSlug(name: string): string {
  const base = slugify(name || "looplens-report");
  const suffix = randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "looplens-report"
  );
}
