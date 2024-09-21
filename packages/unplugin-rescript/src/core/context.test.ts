import { describe, expect, it } from "vitest";
import { Context } from "./context";

describe("unplugin-rescript:test", () => {
	it("Core.Context.filter", () => {
		const ctx = new Context({
			cwd: ".",
			rescriptConfig: "rescript.json",
		});
		expect(ctx.filter("a.js")).toBeFalsy();
		expect(ctx.filter("a.res")).toBeTruthy();
	});
});
