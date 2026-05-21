import { ConfigError, type AgentDef } from "@pi/core";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { randomUUID } from "crypto";

export const DEFAULT_TIMEOUT_MS = 600_000;
export const DEFAULT_MODEL = "minimax-m2.7";
export const WATCHDOG_GRACE_MS = 30_000;
export const DEFAULT_GRID_COLUMNS = 2;

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function loadConfig<T>(path: string): T {
  const fullPath = resolve(path);

  if (!existsSync(fullPath)) {
    throw new ConfigError("CONFIG_NOT_FOUND", `Config not found: ${fullPath}`);
  }

  let raw: string;
  try {
    raw = readFileSync(fullPath, "utf8");
  } catch (err) {
    throw new ConfigError(
      "CONFIG_READ_FAILED",
      `Failed to read config: ${fullPath}: ${String(err)}`,
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new ConfigError(
      "CONFIG_INVALID_JSON",
      `Invalid JSON in config: ${fullPath}: ${String(err)}`,
    );
  }
}

export function loadDirConfigs<T>(dir: string): Map<string, T> {
  const fullDir = resolve(dir);

  if (!existsSync(fullDir)) {
    throw new ConfigError("CONFIG_DIR_NOT_FOUND", `Config dir not found: ${fullDir}`);
  }

  const out = new Map<string, T>();
  const entries = readdirSync(fullDir, { withFileTypes: true });

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".json")) continue;

    const p = join(fullDir, ent.name);
    const key = ent.name.slice(0, -".json".length);
    out.set(key, loadConfig<T>(p));
  }

  return out;
}

export function parseAgentDef(mdContent: string): AgentDef {
  const trimmed = mdContent.replace(/^\uFEFF/, "");
  const lines = trimmed.split(/\r?\n/);

  if (lines[0] !== "---") {
    throw new ConfigError("AGENT_DEF_NO_FRONTMATTER", "Missing YAML frontmatter delimiter '---' at start");
  }

  const endIdx = lines.indexOf("---", 1);
  if (endIdx === -1) {
    throw new ConfigError("AGENT_DEF_FRONTMATTER_UNCLOSED", "Unclosed YAML frontmatter: missing closing '---'");
  }

  const fmLines = lines.slice(1, endIdx);
  const body = lines.slice(endIdx + 1).join("\n").trim();

  const fm = parseYamlFrontmatterSimple(fmLines.join("\n"));

  const name = stringField(fm, "name");
  const description = body || stringFieldOptional(fm, "description") || "";
  const model = stringFieldOptional(fm, "model") ?? DEFAULT_MODEL;
  const timeoutMs = numberFieldOptional(fm, "timeoutMs") ?? DEFAULT_TIMEOUT_MS;

  const tools = arrayOfStringsFieldOptional(fm, "tools") ?? [];
  const systemPrompt = stringFieldOptional(fm, "systemPrompt") ?? undefined;

  return {
    name,
    description,
    tools,
    model,
    timeoutMs,
    systemPrompt,
  };
}

function parseYamlFrontmatterSimple(input: string): Record<string, unknown> {
  // Minimal YAML subset parser:
  // - key: value (string/number/bool)
  // - key: [a, b]
  // - key: followed by indented list items (- a)
  const out: Record<string, unknown> = {};
  const lines = input.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    if (line.trimStart().startsWith("#")) continue;

    const m = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(line);
    if (!m) {
      throw new ConfigError("AGENT_DEF_FRONTMATTER_INVALID", `Invalid frontmatter line: ${line}`);
    }

    const key = m[1] as string;
    const rest = m[2] ?? "";

    if (rest === "") {
      // Possibly a block list
      const items: string[] = [];
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        const li = /^\s*-\s*(.*)$/.exec(next ?? "");
        if (!li) break;
        items.push(unquote((li[1] ?? "").trim()));
        i++;
      }
      out[key] = items;
      continue;
    }

    if (rest.startsWith("[")) {
      out[key] = parseInlineArray(rest);
      continue;
    }

    out[key] = parseScalar(rest.trim());
  }

  return out;
}

function parseInlineArray(rest: string): string[] {
  // Very small: [a, b, "c"]
  const s = rest.trim();
  if (!s.endsWith("]")) {
    throw new ConfigError("AGENT_DEF_FRONTMATTER_INVALID", `Invalid inline array: ${rest}`);
  }
  const inner = s.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((x) => unquote(x.trim()))
    .filter((x) => x.length > 0);
}

function parseScalar(raw: string): string | number | boolean {
  const v = unquote(raw);
  if (/^-?\d+$/.test(v)) return Number(v);
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

function unquote(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function stringField(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) {
    throw new ConfigError("AGENT_DEF_FRONTMATTER_MISSING_FIELD", `Missing or invalid field: ${key}`);
  }
  return v;
}

function stringFieldOptional(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v !== "string") {
    throw new ConfigError("AGENT_DEF_FRONTMATTER_INVALID_FIELD", `Invalid field (expected string): ${key}`);
  }
  return v;
}

function numberFieldOptional(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string" && /^-?\d+$/.test(v)) return Number(v);
  throw new ConfigError("AGENT_DEF_FRONTMATTER_INVALID_FIELD", `Invalid field (expected number): ${key}`);
}

function arrayOfStringsFieldOptional(obj: Record<string, unknown>, key: string): string[] | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
    throw new ConfigError(
      "AGENT_DEF_FRONTMATTER_INVALID_FIELD",
      `Invalid field (expected string[]): ${key}`,
    );
  }
  return v;
}

export function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (rem === 0) return `${m}m`;
  return `${m}m ${rem}s`;
}

export function formatTools(count: number): string {
  return `${count} tools`;
}

export function truncate(text: string, max: number): string {
  if (max <= 0) return "";
  if (text.length <= max) return text;
  if (max <= 1) return "…".slice(0, max);
  return `${text.slice(0, max - 1)}…`;
}

export function box(lines: string[]): string[] {
  const width = Math.max(0, ...lines.map((l) => l.length));
  const top = `┌${"─".repeat(width + 2)}┐`;
  const bottom = `└${"─".repeat(width + 2)}┘`;
  const body = lines.map((l) => `│ ${l.padEnd(width, " ")} │`);
  return [top, ...body, bottom];
}

export function grid(cells: string[][], cols: number): string[] {
  const safeCols = Math.max(1, cols);
  const cellWidths = cells.map((cell) => Math.max(0, ...cell.map((l) => l.length)));

  const rows: string[] = [];

  for (let i = 0; i < cells.length; i += safeCols) {
    const rowCells = cells.slice(i, i + safeCols);
    const rowWidths = cellWidths.slice(i, i + safeCols);

    const heights = rowCells.map((c) => c.length);
    const height = Math.max(0, ...heights);

    for (let lineIdx = 0; lineIdx < height; lineIdx++) {
      const parts = rowCells.map((cell, j) => {
        const w = rowWidths[j] ?? 0;
        const line = cell[lineIdx] ?? "";
        return line.padEnd(w, " ");
      });
      rows.push(parts.join("  ").replace(/\s+$/u, ""));
    }
  }

  return rows;
}

export function generateSessionId(): string {
  return randomUUID();
}

export function getSessionPath(id: string): string {
  return join(".pi", "sessions", `${id}.json`);
}
