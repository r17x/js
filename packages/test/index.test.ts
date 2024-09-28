import * as fs from "node:fs";
import * as path from "node:path";
// import * as rspack from "@rspack/core";
import * as esbuild from "esbuild";
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
import Environment from "./../unplugin-environment/src/index";
import EnvironmentVite from "./../unplugin-environment/src/vite";
import EnvironmentWebpack from "./../unplugin-environment/src/webpack";

const viteBuild = vite.build;
const rollupBuild = rollup.rollup;
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
	vite: typeof viteBuild;
	esbuild: typeof esbuildBuild;
} = {
	webpack: webpackBuild,
	// rspack: rspackBuild,
	rollup: rollupBuild,
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

describe.each([
	{
		plugin: {
			webpack: EnvironmentWebpack,
			vite: EnvironmentVite,
			esbuild: EnvironmentEsbuild,
		},
		pluginName: "unplugin-environment",
		pluginOption: "REACT_APP",
	},
	{
		plugin: {
			webpack: EnvironmentWebpack,
			vite: EnvironmentVite,
			esbuild: EnvironmentEsbuild,
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
		const isSkipped = (n: string) =>
			!["webpack", "vite", "esbuild"].includes(n);
		const readSourcemap = (meta: string) =>
			fs.promises
				.readFile(path.resolve(__dirname, `test.out/${meta}/output.js.map`), {
					encoding: "utf8",
				})
				.then(JSON.parse);

		const env = { REACT_APP_NAME: "test" };
		const coreOption = EnvironmentCore.getOptions(pluginOption);
		const expected = EnvironmentCore.createModuleEnv(env, coreOption);

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

		it.skipIf(isSkipped("webpack"))(`build ${pluginName} with webpack`, () => {
			Promise.resolve()
				.then(async () => {
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
							webpackVersion.startsWith("4")
								? webpack4Options
								: webpack5Options,
							resolve,
						);
					});
				})
				.then(() => readSourcemap("webpack"))
				.then((sourcemap) => {
					const virtualModule = sourcemap.sourcesContent[1];
					expect(sourcemap.sources[1]).toBe("webpack://js/./_virtual_%40env");
					expect(virtualModule).toBe(expected);
				});
		});

		it.skipIf(isSkipped("vite"))(`build ${pluginName} with vite`, () => {
			Promise.resolve()
				.then(() =>
					build.vite({
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
					}),
				)
				.then(() => readSourcemap("vite"))
				.then((sourcemap) => {
					const virtualModule = sourcemap.sourcesContent[0];
					expect(sourcemap.sources[0]).toBe("../../../../@env");
					expect(virtualModule).toBe(expected);
				});
		});

		it.skipIf(isSkipped("esbuild"))(`build ${pluginName} with esbuild`, () => {
			Promise.resolve()
				.then(() =>
					build.esbuild({
						entryPoints: [path.resolve(__dirname, "test.src/entry.js")],
						plugins: [plugin.esbuild(pluginOption)],
						bundle: true, // actually traverse imports
						outfile: path.resolve(__dirname, "test.out/esbuild/output.js"),
						format: "cjs",
						sourcemap: true,
					}),
				)
				.then(() => readSourcemap("esbuild"))
				.then((sourcemap) => {
					const virtualModule = sourcemap.sourcesContent[0];
					expect(sourcemap.sources[0]).toBe("unplugin-environment:@env");
					expect(virtualModule).toBe(expected);
				});
		});

		it.todo("rollup", async () => {
			build
				.rollup({
					input: path.resolve(__dirname, "test.src/entry.js"),
				})
				.then((rollupBuild) =>
					rollupBuild.write({
						plugins: [plugin.rollup(pluginOption)],
						file: path.resolve(__dirname, "test.out/rollup/output.js"),
						format: "cjs",
						exports: "named",
						sourcemap: true,
					}),
				);
		});

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
