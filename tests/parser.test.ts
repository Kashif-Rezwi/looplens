import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseLoopMarkdown } from "@/lib/parser";

function fixture(name: string): string {
  return readFileSync(join(process.cwd(), "tests", "fixtures", name), "utf8");
}

describe("parseLoopMarkdown", () => {
  it("parses pipe-delimited LOOP.md entries and preserves source text", () => {
    const iterations = parseLoopMarkdown(fixture("loop-pipe.md"));

    expect(iterations).toHaveLength(2);
    expect(iterations[0].makerAction).toContain("Added report workspace");
    expect(iterations[0].checkerAction).toContain("npm test passed");
    expect(iterations[1].status).toBe("fixed");
    expect(iterations[1].evidenceLinks[0]?.url).toBe("https://example.com/report/abc");
    expect(iterations[1].sourceText).toContain("mobile cards overflowed");
  });

  it("parses bullet entries with inline labels", () => {
    const iterations = parseLoopMarkdown(fixture("loop-bullets.md"));

    expect(iterations).toHaveLength(2);
    expect(iterations[0].makerAction).toContain("Created parser fixtures");
    expect(iterations[1].failureFound).toContain("missing redaction checklist");
    expect(iterations[1].fixApplied).toContain("required redaction acceptance");
    expect(iterations[1].status).toBe("fixed");
  });

  it("groups multiline iteration notes", () => {
    const iterations = parseLoopMarkdown(fixture("loop-multiline.md"));

    expect(iterations).toHaveLength(2);
    expect(iterations[0].status).toBe("blocked");
    expect(iterations[1].status).toBe("fixed");
  });

  it("keeps malformed evidence visible and extracts URLs", () => {
    const iterations = parseLoopMarkdown(fixture("loop-malformed.md"));

    expect(iterations).toHaveLength(1);
    expect(iterations[0].sourceText).toContain("rough note");
    expect(iterations[0].evidenceLinks[0]?.type).toBe("testsprite");
  });
});
