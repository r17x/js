import type { AstroIntegration } from "astro";
import type { Options } from "./types";
import ResScriptVite from "./vite";

export default function (options: Options): AstroIntegration {
	return {
		name: "unplugin-rescript",
		hooks: {
			// biome-ignore lint/suspicious/noExplicitAny: expected
			"astro:config:setup": async (astro: any) => {
				astro.config.vite.plugins ||= [];
				astro.config.vite.plugins.push(ResScriptVite(options));
			},
		},
	};
}
