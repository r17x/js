import type { PluginOption } from "@/types";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodToTs } from "zod-to-ts";
import * as Core from "./core";

describe("uplugin-environment:core", () => {
	it("only for knowledge", () => {
		expect(
			Core.printTypeDefinition(
				zodToTs(z.record(z.any().optional(), z.string())).node,
			),
		).toMatchSnapshot();

		expect(
			Core.printTypeDefinition(
				zodToTs(
					z.object({
						REACT_APP_NAME: z.string(),
						REACT_APP_VERSION: z.string(),
						REACT_APP_AGE: z.number(),
					}),
				).node,
			),
		).toMatchSnapshot();
	});

	it("valid create module declaration", () => {
		const options = Core.getOptions({
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
				REACT_APP_VERSION: z.string(),
				REACT_APP_AGE: z.number(),
			},
			moduleEnvName: "@myenv",
		});

		expect(Core.createModuleDTS(options)).toMatchSnapshot();
	});

	it("valid create module env", () => {
		expect(
			Core.load(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions({
					match: "REACT_APP",
					schema: z.any(),
					moduleEnvName: "@myenv",
				}),
			)("@myenv"),
		).resolves.toMatchSnapshot();

		expect(
			Core.load(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions("REACT_APP"),
			)("@env"),
		).resolves.toMatchSnapshot();
		expect(
			Core.createModuleEnv(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions("REACT_APP"),
			),
		).toMatchSnapshot();
	});

	it("print type definition", () => {
		expect(
			Core.printTypeDefinition(
				zodToTs(
					z
						.object({
							REACT_APP_NAME: z.string(),
						})
						.strict(),
				).node,
			),
		).toBe(
			`{
    REACT_APP_NAME: string;
}`,
		);
	});
	it("parse type definition", () => {
		const options = Core.getOptions({
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
				REACT_APP_VERSION: z.string(),
			},
		});

		expect(Core.getTsNodeType(options)).toStrictEqual(
			zodToTs(options.schema).node,
		);

		expect(
			Core.getTsNodeType({
				match: "REACT_APP",
				schema: z
					.object({
						REACT_APP_NAME: z.string(),
					})
					.strict(),
				moduleEnvName: "@env",
			}),
		).toStrictEqual(
			zodToTs(
				z
					.object({
						REACT_APP_NAME: z.string(),
					})
					.strict(),
			).node,
		);
	});

	it("valid parse env", () => {
		const mockEnv = {
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_VERSION: "6.6.6",
			SECRET_KEY_TOKEN_: "1234567890",
		};

		expect(Core.getEnv(mockEnv, Core.getOptions("REACT_APP"))).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_VERSION: "6.6.6",
		});

		expect(
			Core.getEnv(
				mockEnv,
				Core.getOptions(["REACT_APP", "!REACT_APP_VERSION"]),
			),
		).toStrictEqual({ REACT_APP_NAME: "htmx_BTW" });
	});

	it("valid resolveId", () => {
		const options = Core.getOptions("REACT_APP");

		expect(Core.resolveId(options)("@env")).toBe("@env");
		expect(Core.resolveId(options)("@env.ts")).toBeUndefined();
		expect(Core.resolveId(options)("@env.ts")).not.toBe("@env");
	});

	it("valid options value", () => {
		expect(() => Core.getOptions("")).toThrowError();
		expect(() => Core.getOptions({} as PluginOption)).toThrowError();
		expect(() => Core.getOptions({ match: "" } as PluginOption)).toThrowError();

		expect(Core.getOptions("REACT_APP")).toStrictEqual({
			match: "REACT_APP",
			schema: expect.any(z.ZodType),
			moduleEnvName: "@env",
		});

		expect(Core.getOptions(["REACT_APP", "VITE_APP"])).toStrictEqual({
			match: ["REACT_APP", "VITE_APP"],
			schema: expect.any(z.ZodType),
			moduleEnvName: "@env",
		});
	});
});
