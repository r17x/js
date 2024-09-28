import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
		coverage: {
			all: true,
			reportOnFailure: process.env.CI === "true",
			enabled: process.env.CI === "true",
			provider: "v8",
			reporter: ["text", "html", "clover", "json", "json-summary"],
			exclude: coverageConfigDefaults.exclude.concat(["packages/test/**"]),
		},
	},
});