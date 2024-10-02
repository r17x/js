import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { zodToTs } from "zod-to-ts";
import * as Core from "./core";
import type { Options, PluginOption } from "./types";

describe("uplugin-environment:core", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const casesSchema = [
		{
			schema: "",
			expected: "Error",
		},
		{
			schema: z.object({
				REACT_APP_NAME: z.string(),
			}),
			expected: z.ZodObject,
		},
		{
			schema: {
				REACT_APP_NAME: z.string(),
			},
			expected: z.ZodObject,
		},
	];

	it.each(casesSchema)(
		"$schema field of PluginOption is $expected",
		({ schema: s, expected }) => {
			const { data, success } = Core.schema.safeParse(s);
			if (expected === "Error") {
				expect(success).toBe(false);
			} else {
				expect(success).toBe(true);
				expect(data).instanceof(expected);
			}
		},
	);

	const casesOptions = [
		{
			options: "APP",
			expected: {
				match: "APP",
				schema: expect.any(z.ZodType),
				moduleEnvName: "@env",
			},
		},
		{
			options: ["APP", "!SERVER"],
			expected: {
				match: ["APP", "!SERVER"],
				schema: expect.any(z.ZodType),
				moduleEnvName: "@env",
			},
		},
		{
			options: {
				match: ["APP", "!SERVER"],
				schema: {
					APP_NAME: z.string(),
				},
			},
			expected: {
				match: ["APP", "!SERVER"],
				schema: expect.any(z.ZodType),
				moduleEnvName: "@env",
			},
		},
	];

	it.each(casesOptions)(
		"Valid $options as param of Environment",
		({ options, expected }) => {
			expect(Core.getOptions(options)).toStrictEqual(expected);
		},
	);

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
			Core.build(
				{ REACT_APP_NAME: "htmx_BTW" },
				Core.getOptions("REACT_APP") as Options,
			),
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
				options as Options,
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
				}) as Options,
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
				}) as Options,
			)("@myenv"),
		).resolves.toMatchSnapshot();

		expect(
			Core.load(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions("REACT_APP") as Options,
			)("@env"),
		).resolves.toMatchSnapshot();
		expect(
			Core.createModuleEnv(
				{
					REACT_APP_NAME: "htmx_BTW",
					REACT_APP_VERSION: "6.6.6",
					SECRET_KEY_TOKEN_: "1234567890",
				},
				Core.getOptions("REACT_APP") as Options,
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

		expect(
			Core.getEnv(mockEnv, Core.getOptions("REACT_APP") as Options),
		).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_VERSION: "6.6.6",
			REACT_APP_PORT: "8080",
		});

		expect(
			Core.getEnv(
				mockEnv,
				Core.getOptions(["REACT_APP", "!REACT_APP_VERSION"]) as Options,
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
				}) as Options,
			),
		).toStrictEqual({
			REACT_APP_NAME: "htmx_BTW",
			REACT_APP_PORT: 8080,
		});
	});

	it("valid resolveId", () => {
		const options = Core.getOptions("REACT_APP");
		Core.mapOptions(options, {
			single: (o) => {
				expect(Core.resolveId(o)("@env")).toBe("@env");
				expect(Core.resolveId(o)("@env.ts")).toBeNull();
				expect(Core.resolveId(o)("@env.ts")).not.toBe("@env");
			},
			clientServer: () => {},
		});
	});

	it("valid options value", () => {
		expect(() => Core.getOptions("")).toThrowError();
		expect(() => Core.getOptions({} as PluginOption)).toThrowError();
		expect(() => Core.getOptions({ match: "" } as PluginOption)).toThrowError();
		expect(() =>
			Core.getOptions({ client: "", server: "" } as PluginOption),
		).toThrowError();

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

		expect(
			Core.getOptions({ client: "CLIENT_APP", server: "SERVER_APP" }),
		).toStrictEqual({
			client: {
				match: "CLIENT_APP",
				schema: expect.any(z.ZodType),
				moduleEnvName: "@env/client",
			},
			server: {
				match: "SERVER_APP",
				schema: expect.any(z.ZodType),
				moduleEnvName: "@env/server",
			},
		});

		expect(
			Core.getOptions({
				client: {
					match: "CLIENT_APP",
					schema: z.object({
						CLIENT_APP_NAME: z.string(),
					}),
					moduleEnvName: "@myenv/client",
				},
				server: {
					match: "SERVER_APP",
					schema: z.object({
						SERVER_APP_NAME: z.string(),
					}),
					moduleEnvName: "@myenv/server",
				},
			}),
		).toStrictEqual({
			client: {
				match: "CLIENT_APP",
				schema: expect.any(z.ZodType),
				moduleEnvName: "@myenv/client",
			},
			server: {
				match: "SERVER_APP",
				schema: expect.any(z.ZodType),
				moduleEnvName: "@myenv/server",
			},
		});
	});
});
