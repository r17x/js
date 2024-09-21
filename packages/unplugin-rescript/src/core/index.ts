import type { Options } from "@/types";
import type { UnpluginFactory } from "unplugin";
import { Context } from "./context";

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
	options = {
		cwd: process.cwd(),
		rescriptConfig: "rescript.json",
	},
) => {
	const ctx = new Context(options);
	return {
		name: "unplugin-rescript",
		enforce: "pre",
		resolveId(id, importer, _options) {
			return ctx.resolveId(id, importer);
		},
		async buildStart() {
			await ctx.build();
		},
		buildEnd() {
			ctx.compilerProcess?.();
		},
		watchChange(id, change) {
			ctx.watchChange(id, change.event);
		},
		transformInclude(id) {
			return ctx.filter(id);
		},
	};
};
