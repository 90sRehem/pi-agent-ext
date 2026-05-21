import { describe, expect, it } from "vitest";
import {
  ConfigError,
  PiExtError,
  PipelineError,
  SpawnError,
  TeamError,
  TimeoutError,
} from "./index";

describe("@pi/core errors", () => {
  it("PiExtError carries code", () => {
    const err = new PiExtError("E_TEST", "boom");
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("E_TEST");
    expect(err.message).toBe("boom");
  });

  it("subclasses preserve code", () => {
    const err = new ConfigError("E_CONFIG", "bad config");
    expect(err).toBeInstanceOf(PiExtError);
    expect(err.code).toBe("E_CONFIG");

    expect(new SpawnError("E_SPAWN", "spawn").code).toBe("E_SPAWN");
    expect(new TimeoutError("E_TIMEOUT", "timeout").code).toBe("E_TIMEOUT");
    expect(new PipelineError("E_PIPELINE", "pipeline").code).toBe("E_PIPELINE");
    expect(new TeamError("E_TEAM", "team").code).toBe("E_TEAM");
  });
});
