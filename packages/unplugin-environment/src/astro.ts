import type { AstroIntegration } from "astro";
import type { PluginOption } from "./core/types";
import Environment from "./vite";

export default function (options: PluginOption): AstroIntegration {
	return {
		name: "unplugin-environment",
		hooks: {
			"astro:config:setup": async (astro) => {
				astro.config.vite.plugins ||= [];
				astro.config.vite.plugins.push(Environment(options));
			},
		},
	};
}
