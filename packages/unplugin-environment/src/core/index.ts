// TODO
// PARSE ENV
// Write ENV TYPE
import type { Options } from "@/types";
import type { UnpluginFactory } from "unplugin";
import { Context } from "./context";

export const unpluginFactory: UnpluginFactory<Options> = (options) => {
	const ctx = new Context(options);
	return {
		name: "unplugin-environment",
		enforce: "pre",
		resolveId(id, _importer) {
			return id === "@/env" ? "@/env" : undefined;
		},
		buildStart() {
			console.log("Build Start");
		},
		writeBundle() {
			console.log("Write bundle", ctx);
		},
		load(id) {
			if (id === "@/env") {
				return Promise.resolve({
					code: "export const env = {A: 1} \n\nexport default env",
				});
			}
		},
	};
};
