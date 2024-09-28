import * as fs from "node:fs";
import * as path from "node:path";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { z } from "zod";
import * as EnvironmentCore from "./../unplugin-environment/src/core/core";
import EnvironmentEsbuild from "./../unplugin-environment/src/esbuild";
import EnvironmentFarm from "./../unplugin-environment/src/farm";
import Environment from "./../unplugin-environment/src/index";
import EnvironmentRolldown from "./../unplugin-environment/src/rolldown";
import EnvironmentRollup from "./../unplugin-environment/src/rollup";
import EnvironmentRspack from "./../unplugin-environment/src/rspack";
import EnvironmentVite from "./../unplugin-environment/src/vite";
import EnvironmentWebpack from "./../unplugin-environment/src/webpack";

import { type RspackOptions, build, webpackVersion } from "./utils";

const unSkipped = [
	"farm",
	"webpack",
	"vite",
	"esbuild",
	"rollup",
	"rolldown",
	"rspack",
];

describe.sequential.each([
	{
		plugin: {
			farm: EnvironmentFarm,
			webpack: EnvironmentWebpack,
			vite: EnvironmentVite,
			esbuild: EnvironmentEsbuild,
			rollup: EnvironmentRollup,
			rolldown: EnvironmentRolldown,
			rspack: EnvironmentRspack,
		},
		pluginName: "unplugin-environment",
		pluginOption: "REACT_APP",
	},
	{
		plugin: {
			farm: EnvironmentFarm,
			webpack: EnvironmentWebpack,
			vite: EnvironmentVite,
			esbuild: EnvironmentEsbuild,
			rollup: EnvironmentRollup,
			rolldown: EnvironmentRolldown,
			rspack: EnvironmentRspack,
		},
		pluginName: "unplugin-environment",
		pluginOption: {
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
			},
		},
	},
	{
		plugin: Environment,
		pluginName: "unplugin-environment",
		pluginOption: "REACT_APP",
	},
	{
		plugin: Environment,
		pluginName: "unplugin-environment",
		pluginOption: {
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
			},
		},
	},
])(
	"[E2E] $pluginName has been created virtual module",
	({ plugin, pluginName, pluginOption }) => {
		const isSkipped = (n: string) => !unSkipped.includes(n);
		const readSourcemap = (meta: string) =>
			fs.promises
				.readFile(path.resolve(__dirname, `test.out/${meta}/output.js.map`), {
					encoding: "utf8",
				})
				.then(JSON.parse);

		const env = { REACT_APP_NAME: "test" };
		const coreOption = EnvironmentCore.getOptions(pluginOption);
		const expected = EnvironmentCore.createModuleEnv(env, coreOption).code;

		beforeAll(() => {
			fs.rmSync(path.resolve(__dirname, "test.out"), {
				recursive: true,
				force: true,
			});
		});

		beforeEach(() => {
			vi.stubGlobal("process", {
				...process,
				env: { ...env },
			});
		});

		afterEach(() => {
			vi.resetAllMocks();
		});

		it.skipIf(isSkipped("webpack"))(
			`build ${pluginName} with webpack`,
			async () => {
				const webpack4Options = {
					entry: path.resolve(__dirname, "test.src/entry.js"),
					cache: false,
					output: {
						path: path.resolve(__dirname, "test.out/webpack"),
						filename: "output.js",
						libraryTarget: "commonjs",
					},
					plugins: [plugin.webpack(pluginOption)],
					devtool: "source-map",
				};

				const webpack5Options = {
					entry: path.resolve(__dirname, "test.src/entry.js"),
					plugins: [plugin.webpack(pluginOption)],
					devtool: "source-map",
					output: {
						path: path.resolve(__dirname, "test.out/webpack"),
						filename: "output.js",
						library: {
							type: "commonjs",
						},
					},
				};

				await new Promise((resolve) => {
					build.webpack(
						webpackVersion.startsWith("4") ? webpack4Options : webpack5Options,
						resolve,
					);
				});

				const sourcemap = await readSourcemap("webpack");
				const virtualModule = sourcemap.sourcesContent[1];
				expect(sourcemap.sources[1]).toBe("webpack://js/./_virtual_%40env");
				expect(virtualModule).toBe(expected);
			},
		);

		it.skipIf(isSkipped("vite"))(`build ${pluginName} with vite`, async () => {
			await build.vite({
				clearScreen: false,
				plugins: [plugin.vite(pluginOption)],
				build: {
					lib: {
						entry: path.resolve(__dirname, "test.src/entry.js"),
						name: "TestLib",
						fileName: "output",
						formats: ["cjs"],
					},
					outDir: path.resolve(__dirname, "test.out/vite"),
					sourcemap: true,
				},
			});

			const sourcemap = await readSourcemap("vite");
			const virtualModule = sourcemap.sourcesContent[0];
			expect(sourcemap.sources[0]).toBe("../../../../@env");
			expect(virtualModule).toBe(expected);
		});

		it.skipIf(isSkipped("esbuild"))(
			`build ${pluginName} with esbuild`,
			async () => {
				await build.esbuild({
					entryPoints: [path.resolve(__dirname, "test.src/entry.js")],
					plugins: [plugin.esbuild(pluginOption)],
					bundle: true, // actually traverse imports
					outfile: path.resolve(__dirname, "test.out/esbuild/output.js"),
					format: "cjs",
					sourcemap: true,
				});

				const sourcemap = await readSourcemap("esbuild");
				const virtualModule = sourcemap.sourcesContent[0];
				expect(sourcemap.sources[0]).toBe("unplugin-environment:@env");
				expect(virtualModule).toBe(expected);
			},
		);

		it.skipIf(isSkipped("farm"))(`build ${pluginName} with farm`, async () => {
			await build.farm({
				clearScreen: true,
				minify: false,
				sourcemap: true,
				plugins: [plugin.farm(pluginOption)],
				compilation: {
					persistentCache: false,
					sourcemap: "all",
					input: {
						output: path.resolve(__dirname, "test.src/entry.js"),
					},
					output: {
						entryFilename: "output.js",
						path: path.resolve(__dirname, "test.out/farm"),
					},
				},
			});

			const sourcemap = await readSourcemap("farm");
			const virtualModule = sourcemap.sourcesContent[0];
			expect(sourcemap.sources[0]).toBe("/@env");
			expect(virtualModule).toBe(expected);
		});

		it.skipIf(isSkipped("rollup"))(
			`build ${pluginName} with rollup`,
			async () => {
				await build
					.rollup({
						plugins: [plugin.rollup(pluginOption)],
						input: path.resolve(__dirname, "test.src/entry.js"),
					})
					.then((rollupBuild) =>
						rollupBuild.write({
							file: path.resolve(__dirname, "test.out/rollup/output.js"),
							format: "cjs",
							exports: "named",
							sourcemap: true,
						}),
					);

				const sourcemap = await readSourcemap("rollup");
				const virtualModule = sourcemap.sourcesContent[0];
				expect(sourcemap.sources[0]).toBe("../../../../@env");
				expect(virtualModule).toBe(expected);
			},
		);

		it.skipIf(isSkipped("rolldown"))(
			`build ${pluginName} with rolldown`,
			async () => {
				await build
					.rolldown({
						plugins: [plugin.rolldown(pluginOption)],
						input: path.resolve(__dirname, "test.src/entry.js"),
						treeshake: false,
					})
					.then((rolldownBuild) =>
						rolldownBuild.write({
							format: "cjs",
							dir: path.resolve(__dirname, "test.out/rolldown"),
							exports: "named",
							sourcemap: true,
							entryFileNames: "output.js",
						}),
					);

				const sourcemap = await readSourcemap("rolldown");
				const virtualModule = sourcemap.sourcesContent[0];
				expect(sourcemap.sources[0]).toBe("../../../../@env");
				expect(virtualModule).toBe(expected);
			},
		);

		it.skipIf(isSkipped("rspack"))(
			`build ${pluginName} with rspack`,
			async () => {
				const rspackOptions: RspackOptions = {
					entry: path.resolve(__dirname, "test.src/entry.js"),
					plugins: [plugin.rspack(pluginOption)],
					devtool: "source-map",
					output: {
						path: path.resolve(__dirname, "test.out/rspack"),
						filename: "output.js",
						library: {
							type: "commonjs",
						},
					},
				};
				const compiler = build.rspack(rspackOptions);
				await new Promise((resolve, reject) => {
					compiler.run((err, stats) => {
						if (err || stats?.hasErrors()) {
							console.log(stats?.toJson().errors);
							compiler.close(reject);
						}
						compiler.close(resolve);
					});
				});
				const sourcemap = await readSourcemap("rspack");
				const virtualModule = sourcemap.sourcesContent[1];
				expect(sourcemap.sources[1]).toBe(
					"webpack://js/./node_modules/.virtual/%40env",
				);
				expect(virtualModule).toBe(
					`export const env = ${JSON.stringify({ REACT_APP_NAME: "test" })}`,
				);
			},
		);
	},
);
