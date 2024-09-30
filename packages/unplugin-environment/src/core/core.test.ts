import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { zodToTs } from "zod-to-ts";
import * as Core from "./core";
import type { PluginOption } from "./types";

describe("uplugin-environment:core", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("valid merge zod schema", () => {
		expect(
			Core.printTypeDefinition(
				zodToTs(
					z
						.object({
							REACT_APP_NAME: z.string().optional(),
						})
						.merge(
							z.object({
								REACT_APP_VERSION: z.string(),
							}),
						),
				).node,
			),
		).matchSnapshot();
	});

	it("valid run build", () => {
		expect(
			Core.build({ REACT_APP_NAME: "htmx_BTW" }, Core.getOptions("REACT_APP")),
		).resolves.toStrictEqual({
			success: true,
			data: {
				REACT_APP_NAME: "htmx_BTW",
			},
		});
	});

	it("only run watchChange once when valid watchList", () => {
		const onChange = vi.fn();
		const watcher = Core.watchChange([".env"], onChange);
		watcher("/a/b/c/.env~~~~");
		watcher("/a/b/c/any");
		watcher("/a/b/c/any");
		watcher("/a/b/c/any");
		expect(onChange).toHaveBeenCalledTimes(1);
	});

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

	it("[DTS] valid create module type definition", () => {
		const options = Core.getOptions({
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
				REACT_APP_VERSION: z.string(),
				REACT_APP_AGE: z.number(),
				REACT_APP_PORT: z.coerce.number().min(1),
				REACT_APP_DATA: z
					.string()
					.transform((a) => JSON.parse(a))
					.pipe(
						z.object({
							age: z.number(),
							name: z.string(),
						}),
					),
			},
			moduleEnvName: "@myenv",
		});

		expect(
			Core.createModuleDTS(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					REACT_APP_DURATION: "123",
					REACT_APP_PORT: "8080",
					REACT_APP_DATA: JSON.stringify({ age: 123, name: "htmx_BTW" }),
					SECRET_KEY_TOKEN_: "1234567890",
				},
				options,
			),
		).toMatchSnapshot();
	});

	it("valid create module env", () => {
		expect(() =>
			Core.load(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					REACT_APP_DURATION: "123",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions({
					match: "REACT_APP",
					schema: z.any(),
					moduleEnvName: "@myenv",
				}),
			)("@myenv"),
		).toThrowError();

		expect(
			Core.load(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					REACT_APP_DURATION: "123",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions({
					match: "REACT_APP",
					schema: z.object({
						REACT_APP_NAME: z.string(),
					}),
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

	it("valid parse env", () => {
		const mockEnv = {
			REACT_APP_PORT: "8080",
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_VERSION: "6.6.6",
			SECRET_KEY_TOKEN_: "1234567890",
		};

		expect(Core.getEnv(mockEnv, Core.getOptions("REACT_APP"))).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_VERSION: "6.6.6",
			REACT_APP_PORT: "8080",
		});

		expect(
			Core.getEnv(
				mockEnv,
				Core.getOptions(["REACT_APP", "!REACT_APP_VERSION"]),
			),
		).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_PORT: "8080",
		});

		expect(
			Core.getEnv(
				mockEnv,
				Core.getOptions({
					match: ["REACT_APP", "!REACT_APP_VERSION"],
					schema: z.object({
						REACT_APP_NAME: z.string(),
						REACT_APP_PORT: z.coerce.number().min(1),
					}),
				}),
			),
		).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_PORT: 8080,
		});
	});

	it("valid resolveId", () => {
		const options = Core.getOptions("REACT_APP");

		expect(Core.resolveId(options)("@env")).toBe("@env");
		expect(Core.resolveId(options)("@env.ts")).toBeNull();
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
