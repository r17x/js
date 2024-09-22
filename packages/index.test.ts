import * as fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("vitest", () => {
	it("works", () => {
		expect(1).toBe(1);
	});

	it("biome configuration", () => {
		expect(import("@r17x/biome").then((m) => m.default)).resolves.toStrictEqual(
			JSON.parse(
				fs.readFileSync("./packages/biome/index.json", { encoding: "utf8" }),
			),
		);
	});

	it("semantic-release configuration", () => {
		expect(
			import("@r17x/semantic-release").then((m) => m.default),
		).resolves.toStrictEqual(
			JSON.parse(
				fs.readFileSync("./packages/semantic-release/index.json", {
					encoding: "utf8",
				}),
			),
		);
	});
});
