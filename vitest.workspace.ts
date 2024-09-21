import { defineConfig, defineWorkspace, mergeConfig } from "vitest/config";

const config = defineConfig({
	test: {
		passWithNoTests: true,
		globals: true,
		coverage: {
			all: true,
			provider: "v8",
			reporter: ["lcov", "html"],
		},
	},
});

export default defineWorkspace([
	mergeConfig(config, {
		include: ["packages/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
	}),
]);
