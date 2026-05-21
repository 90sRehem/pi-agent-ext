import { describe, expect, it } from "vitest";
import { parseAgentDef, formatElapsed, truncate, box, grid } from "./index";

describe("@pi/shared parseAgentDef", () => {
  it("parses basic frontmatter and uses body as description", () => {
    const md = [
      "---",
      "name: tester",
      "description: ignored",
      "tools: [read, bash]",
      "model: x",
      "timeoutMs: 123",
      "systemPrompt: hello",
      "---",
      "This is the body description",
    ].join("\n");

    const a = parseAgentDef(md);
    expect(a.name).toBe("tester");
    expect(a.description).toBe("This is the body description");
    expect(a.tools).toEqual(["read", "bash"]);
    expect(a.model).toBe("x");
    expect(a.timeoutMs).toBe(123);
    expect(a.systemPrompt).toBe("hello");
  });
});

describe("@pi/shared render utils", () => {
  it("formatElapsed", () => {
    expect(formatElapsed(45_000)).toBe("45s");
    expect(formatElapsed(120_000)).toBe("2m");
    expect(formatElapsed(150_000)).toBe("2m 30s");
  });

  it("truncate", () => {
    expect(truncate("hello", 10)).toBe("hello");
    expect(truncate("hello", 5)).toBe("hello");
    expect(truncate("hello", 4)).toBe("hel…");
  });

  it("box", () => {
    const b = box(["a", "bb"]);
    expect(b[0]).toBe("┌────┐");
    expect(b[1]).toBe("│ a  │");
    expect(b[2]).toBe("│ bb │");
    expect(b[3]).toBe("└────┘");
  });

  it("grid", () => {
    const g = grid(
      [
        ["a"],
        ["b", "bb"],
        ["c"],
      ],
      2,
    );
    expect(g).toEqual(["a  b", "   bb", "c"]);
  });
});
