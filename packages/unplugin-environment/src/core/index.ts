import path from "path";
import { fileURLToPath } from "url";
import { F, G } from "@mobily/ts-belt";
import { config as dotenvConfig } from "dotenv";
import type { UnpluginFactory } from "unplugin";
import * as Core from "./core";
import { log } from "./logger";
import type { PluginOption } from "./types";

export const unpluginFactory: UnpluginFactory<PluginOption> = (opt) => {
	const options = Core.getOptions(opt);
	const isProduction =
		["true", "1"].includes(process?.env?.CI || "") &&
		process?.env?.NODE_ENV !== "development";

	const env = G.isObject<Record<string, string>>(process?.env)
		? process.env
		: {};
	/**
	 * NOTE:
	 * Vite not load env file automatically until user set configuration for env.
	 * So, we load all env file here (with `dotenv` package) and filter by our options.
	 */
	dotenvConfig({ processEnv: env });

	/**
	 * This writer function for generate `env.d.ts` file.
	 */
	const writer = () =>
		import("fs/promises").then(async (fs) => {
			const dtsPath = path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				"env.d.ts",
			);
			const dtsContent = Core.mapOptions(options, {
				single: (o) => Core.createModuleDTS(env, o),
				clientServer: (o) =>
					[
						Core.createModuleDTS(env, o.client),
						"",
						Core.createModuleDTS(env, o.server),
					].join("\n"),
			});
			fs.writeFile(
				dtsPath,
				// it will be handle existing user configuration and client/server configuration.
				// for client/server configuration, we will generate on each and merged into one file `env.d.ts`.
				dtsContent,
			).then(() => {
				log({
					kind: "info",
					message: "✓ Generated env.d.ts",
					prefix: "unplugin-environment",
				});
			});
		});

	const logError = (e: Error) => {
		log({
			kind: "error",
			message: e?.message || "something went wrong",
			prefix: "unplugin-environment",
		});
		isProduction && process.exit(1);
	};

	// use for resolve module by moduleEnvName.
	const resolveId = Core.mapOptions(options, {
		single: (o) => Core.resolveId(o),
		clientServer: (o) => (id: string) =>
			Core.resolveId(o.client)(id) || Core.resolveId(o.server)(id),
	});

	// use for load module by moduleEnvName.
	const loadInclude = Core.mapOptions(options, {
		single: (o) => Core.loadInclude(o),
		clientServer: (o) =>
			F.anyPass([Core.loadInclude(o.client), Core.loadInclude(o.server)]),
	});

	// use for load virtual module by moduleEnvName.
	const load = Core.load(env, options);

	// use for validation `schema` and `moduleEnvName` is use for generate `env.d.ts` file.
	const build = F.memoizeWithKey(
		() => JSON.stringify({ ...options, ...env }),
		Core.mapOptions(options, {
			single: (o) => async () => {
				await Core.build(env, o).then(writer).catch(logError);
			},
			clientServer: (o) => async () => {
				await Promise.all([
					Core.build(env, o.client).then(writer),
					Core.build(env, o.server).then(writer),
				]).catch(logError);
			},
		}),
	);

	return {
		name: "unplugin-environment",
		enforce: "pre",
		resolveId,
		loadInclude,
		load,
		watchChange: Core.watchChange(
			[
				".env",
				// ideally, user could add pattern file for load env file (`.env.*`)
				// to watch and update the `env` object.
			],
			() => {
				dotenvConfig({ processEnv: env });
				build();
			},
		),
		buildStart: build,
	};
};
