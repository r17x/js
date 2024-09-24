import path from "path";
import { fileURLToPath } from "url";
import type { PluginOption } from "@/types";
import { config as dotenvConfig } from "dotenv";
import type { UnpluginFactory } from "unplugin";
import * as Core from "./core";
import { log } from "./logger";
/**
 * NOTE:
 * Vite not load env file automatically until user set configuration for env.
 * So, we load all env file here (with `dotenv` package) and filter by our options.
 */
export const unpluginFactory: UnpluginFactory<PluginOption> = (o) => {
	const isProduction =
		process?.env?.CI === "true" && process?.env?.NODE_ENV !== "development";
	const env = process.env as Record<string, string>;
	dotenvConfig({ processEnv: env });
	const options = Core.getOptions(o);
	/**
	 * This writer function not BETTER implementation
	 */
	const writer = () =>
		import("fs/promises").then(async (fs) => {
			fs.writeFile(
				path.resolve(path.dirname(fileURLToPath(import.meta.url)), "env.d.ts"),
				[
					"",
					"// THIS FILE IS GENERATE FROM `unplugin-environment` - see https://npm.im/unplugin-environment",
					"",
					Core.createModuleDTS(options),
				].join("\n"),
			);
		});

	return {
		name: "unplugin-environment",
		enforce: "pre",
		resolveId: Core.resolveId(options),
		load: Core.load(env, options),
		watchChange(id) {
			if (id.startsWith(".env")) {
				dotenvConfig({ processEnv: env });
			}
		},
		buildStart() {
			options.schema
				.safeParseAsync(env)
				.then((r) => {
					if (r.success) {
						return writer();
					}
					return Promise.reject(r.error);
				})
				.catch((e) => {
					log({
						kind: "error",
						message: e?.message || "something went wrong",
						prefix: "unplugin-environment",
					});
					if (isProduction) {
						process.exit(1);
					}
				});
		},
	};
};
