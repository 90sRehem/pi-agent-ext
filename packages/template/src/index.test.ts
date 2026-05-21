import { describe, expect, it } from "vitest";
import { createTemplate } from "./index";

describe("template", () => {
	it("should create template string", () => {
		const result = createTemplate({ name: "test", version: "1.0.0" });
		expect(result).toBe("Template: test@1.0.0");
	});
});
