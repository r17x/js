import * as fs from "node:fs";
import * as path from "node:path";
import * as farm from "@farmfe/core";
// import * as rspack from "@rspack/core";
import * as esbuild from "esbuild";
import * as rolldown from "rolldown";
import * as rollup from "rollup";
import * as vite from "vite";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import * as webpack from "webpack";
import { z } from "zod";
import * as EnvironmentCore from "./../unplugin-environment/src/core/core";
import EnvironmentEsbuild from "./../unplugin-environment/src/esbuild";
import EnvironmentFarm from "./../unplugin-environment/src/farm";
import Environment from "./../unplugin-environment/src/index";
import EnvironmentRolldown from "./../unplugin-environment/src/rolldown";
import EnvironmentRollup from "./../unplugin-environment/src/rollup";
import EnvironmentVite from "./../unplugin-environment/src/vite";
import EnvironmentWebpack from "./../unplugin-environment/src/webpack";

const viteBuild = vite.build;
const farmBuild = farm.build;
const rollupBuild = rollup.rollup;
const rolldownBuild = rolldown.rolldown;
const esbuildBuild = esbuild.build;
const webpackBuild: typeof webpack.webpack =
	// biome-ignore lint/suspicious/noExplicitAny: false
	webpack.webpack || (webpack as any).default || webpack;
// const rspackBuild = rspack.rspack;

// biome-ignore lint/suspicious/noExplicitAny: false
const webpackVersion = ((webpack as any).default || webpack).version;

const build: {
	webpack: typeof webpack.webpack;
	// rspack: typeof rspackBuild;
	rollup: typeof rollupBuild;
	rolldown: typeof rolldownBuild;
	vite: typeof viteBuild;
	farm: typeof farmBuild;
	esbuild: typeof esbuildBuild;
} = {
	farm: farmBuild,
	webpack: webpackBuild,
	// rspack: rspackBuild,
	rollup: rollupBuild,
	rolldown: rolldownBuild,
	vite(config) {
		return viteBuild(
			vite.mergeConfig(config || {}, {
				build: {
					rollupOptions: {
						logLevel: "silent",
					},
				},
				logLevel: "silent",
			}),
		);
	},
	esbuild: esbuildBuild,
};

const unSkipped = ["farm", "webpack", "vite", "esbuild", "rollup", "rolldown"];

describe.sequential.each([
	{
		plugin: {
			farm: EnvironmentFarm,
			webpack: EnvironmentWebpack,
			vite: EnvironmentVite,
			esbuild: EnvironmentEsbuild,
			rollup: EnvironmentRollup,
			rolldown: EnvironmentRolldown,
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

		it.todo("rspack", async () => {
			// expect.assertions(3);
			// const { default: plugin } = await import(`${pluginRoot}/src/rspack`);
			// const rspackOptions: rspack.RspackOptions = {
			// 	entry: path.resolve(__dirname, "test.src/entry.js"),
			// 	plugins: [plugin(pluginOption)],
			// 	devtool: "source-map",
			// 	output: {
			// 		path: path.resolve(__dirname, "test.out/rspack"),
			// 		filename: "output.js",
			// 		library: {
			// 			type: "commonjs",
			// 		},
			// 	},
			// };
			// await new Promise((resolve) => {
			// 	build.rspack(rspackOptions, resolve);
			// });
			// const sourcemap = await readSourcemap("rspack");
			// const virtualModule = sourcemap.sourcesContent[0];
			// expect(sourcemap.sources[0]).toBe("../../../../@env");
			// expect(virtualModule).toBe(
			// 	`export const env = ${JSON.stringify({ REACT_APP_NAME: "test" })}`,
			// );
		});
	},
);
