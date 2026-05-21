export interface AgentDef {
  name: string;
  description: string;
  tools: string[];
  model: string;
  timeoutMs: number;
  systemPrompt?: string;
}

export interface RoleConfig {
  model: string;
  timeoutMs: number;
  tools: string[];
}

export type AgentStatus = "idle" | "running" | "done" | "error";

export interface PipelineConfig {
  name: string;
  description: string;
  phases: PhaseDef[];
  reviewMaxLoops?: number;
}

export interface AgentRole {
  role: string;
  agent: string;
}

export interface PhaseDef {
  name: string;
  description: string;
  mode: "interactive" | "parallel" | "sequential";
  agents: AgentRole[];
  approvalRequired?: boolean;
  maxLoops?: number;
}

export interface PhaseResult {
  name: string;
  output: string;
  status: "pending" | "active" | "done" | "error";
}

export interface TeamDef {
  name: string;
  agents: string[];
}

export interface TeamConfig {
  defaultGridColumns: number;
  autoRemoveDelayMs: number;
  teams: Record<string, string[]>;
  roles: Record<string, RoleConfig>;
}

export type SubagentEvent =
  | { type: "message_update"; delta: string }
  | { type: "tool_execution_start"; tool: string }
  | { type: "tool_execution_end"; tool: string; success: boolean }
  | { type: "complete"; result: string }
  | { type: "error"; message: string };

export type SubagentCommand =
  | { type: "task"; task: string }
  | { type: "kill" }
  | { type: "pause" };

export interface SessionFile {
  id: string;
  role: string;
  task: string;
  history: SubagentEvent[];
  createdAt: number;
}

export class PiExtError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = new.target.name;
  }
}

export class ConfigError extends PiExtError {}
export class SpawnError extends PiExtError {}
export class TimeoutError extends PiExtError {}
export class PipelineError extends PiExtError {}
export class TeamError extends PiExtError {}

export type MergeStrategy = "concat" | "summarize";

export interface VariableMap {
  $ORIGINAL: string;
  $INPUT: string;
  $INPUT_1: string;
  $INPUT_2: string;
  $CONTEXT: string;
}

export type WidgetStatus = "running" | "done" | "error" | "pending";
