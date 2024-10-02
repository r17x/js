import * as fs from "node:fs";
import * as path from "node:path";
import Environment from "unplugin-environment";
import * as EnvironmentCore from "unplugin-environment/core/core";
import EnvironmentEsbuild from "unplugin-environment/esbuild";
import EnvironmentFarm from "unplugin-environment/farm";
import EnvironmentRolldown from "unplugin-environment/rolldown";
import EnvironmentRollup from "unplugin-environment/rollup";
import EnvironmentRspack from "unplugin-environment/rspack";
import EnvironmentVite from "unplugin-environment/vite";
import EnvironmentWebpack from "unplugin-environment/webpack";
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

import {
	type Options,
	OptionsClientServer,
} from "unplugin-environment/core/types";
import { type RspackOptions, build, webpackVersion } from "./utils";

const plugins = {
	farm: EnvironmentFarm,
	webpack: EnvironmentWebpack,
	vite: EnvironmentVite,
	esbuild: EnvironmentEsbuild,
	rollup: EnvironmentRollup,
	rolldown: EnvironmentRolldown,
	rspack: EnvironmentRspack,
};

const input = {
	farm: { entry: "entry.js", outfile: "output.js" },
	webpack: { entry: "entry.js", outfile: "output.js" },
	vite: { entry: "entry.js", outfile: "output.js" },
	esbuild: { entry: "entry.js", outfile: "output.js" },
	rollup: { entry: "entry.js", outfile: "output.js" },
	rolldown: { entry: "entry.js", outfile: "output.js" },
	rspack: { entry: "entry.js", outfile: "output.js" },
};
const inputServer = {
	farm: { entry: "entry.server.js", outfile: "output.server.js" },
	webpack: { entry: "entry.server.js", outfile: "output.server.js" },
	vite: { entry: "entry.server.js", outfile: "output.server.js" },
	esbuild: { entry: "entry.server.js", outfile: "output.server.js" },
	rollup: { entry: "entry.server.js", outfile: "output.server.js" },
	rolldown: { entry: "entry.server.js", outfile: "output.server.js" },
	rspack: { entry: "entry.server.js", outfile: "output.server.js" },
};

const expectations = {
	webpack: {
		bundler: "webpack",
		index: 1,
		bundlerModuleName: "webpack://js/./_virtual_%40env",
	},
	vite: {
		bundler: "vite",
		index: 0,
		bundlerModuleName: "../../../../@env",
	},
	esbuild: {
		bundler: "esbuild",
		index: 0,
		bundlerModuleName: "unplugin-environment:@env",
	},
	farm: {
		bundler: "farm",
		index: 0,
		bundlerModuleName: "/@env",
	},
	rollup: {
		bundler: "rollup",
		index: 0,
		bundlerModuleName: "../../../../@env",
	},
	rolldown: {
		bundler: "rolldown",
		index: 0,
		bundlerModuleName: "../../../../@env",
	},
	rspack: {
		bundler: "rspack",
		index: 1,
		bundlerModuleName: "webpack://js/./node_modules/.virtual/%40env",
	},
};

const expectationsServer = {
	webpack: {
		bundler: "webpack",
		index: 0,
		bundlerModuleName: "webpack://js/./_virtual_%40env%2Fserver",
	},
	vite: {
		bundler: "vite",
		index: 0,
		bundlerModuleName: "../../../../@env/server",
	},
	esbuild: {
		bundler: "esbuild",
		index: 0,
		bundlerModuleName: "unplugin-environment:@env/server",
	},
	farm: {
		bundler: "farm",
		index: 1,
		bundlerModuleName: "/@env/server",
	},
	rollup: {
		bundler: "rollup",
		index: 0,
		bundlerModuleName: "../../../../@env/server",
	},
	rolldown: {
		bundler: "rolldown",
		index: 0,
		bundlerModuleName: "../../../../@env/server",
	},
	rspack: {
		bundler: "rspack",
		index: 0,
		bundlerModuleName: "webpack://js/./node_modules/.virtual/%40env%2Fserver",
	},
};

const unSkipped = [
	"farm",
	"ebpack",
	"vite",
	"esbuild",
	"rollup",
	"rolldown",
	"rspack",
	"webpack",
];

describe.sequential.each([
	{
		plugin: plugins,
		pluginName: "unplugin-environment",
		pluginOption: "REACT_APP",
		env: { REACT_APP_NAME: "test" },
		input,
		expectations,
		isServer: false,
	},
	{
		plugin: plugins,
		pluginName: "unplugin-environment",
		pluginOption: {
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
			},
		},
		env: { REACT_APP_NAME: "test" },
		input,
		expectations,
		isServer: false,
	},
	{
		plugin: Environment,
		pluginName: "unplugin-environment",
		pluginOption: "REACT_APP",
		env: { REACT_APP_NAME: "test" },
		input,
		expectations,
		isServer: false,
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
		env: { REACT_APP_NAME: "test" },
		input,
		expectations,
		isServer: false,
	},
	{
		plugin: Environment,
		pluginName: "unplugin-environment",
		pluginOption: {
			client: {
				match: "CLIENT_APP",
				schema: {
					CLIENT_APP_NAME: z.string(),
				},
			},
			server: {
				match: "SERVER_APP",
				schema: {
					SERVER_APP_NAME: z.string(),
				},
			},
		},
		env: {
			CLIENT_APP_NAME: "test",
			SERVER_APP_NAME: "test",
		},
		input: inputServer,
		expectations: expectationsServer,
		isServer: true,
	},
])(
	"[E2E] $pluginName has been created virtual module",
	({
		plugin,
		pluginName,
		pluginOption,
		env,
		input,
		expectations,
		isServer,
	}) => {
		const isSkipped = (n: string) => !unSkipped.includes(n);
		const readSourcemap = (meta: string) =>
			fs.promises
				.readFile(
					path.resolve(
						__dirname,
						`test.out/${meta}/${input[meta].outfile}.map`,
					),
					{
						encoding: "utf8",
					},
				)
				.then(JSON.parse);

		const coreOption = EnvironmentCore.getOptions(pluginOption);
		const expected = isServer
			? EnvironmentCore.createModuleEnvServer(env, coreOption.server as Options)
					.code
			: EnvironmentCore.createModuleEnv(
					env,
					coreOption?.client ? coreOption.client : (coreOption as Options),
				).code;
		const checkExpectations = async ({ bundler, index, bundlerModuleName }) => {
			const sourcemap = await readSourcemap(bundler);
			const virtualModule = sourcemap.sourcesContent[index];
			expect(sourcemap.sources[index]).toBe(bundlerModuleName);
			expect(virtualModule).toBe(expected);
		};

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
					entry: path.resolve(__dirname, "test.src", input.webpack.entry),
					cache: false,
					output: {
						path: path.resolve(__dirname, "test.out/webpack"),
						filename: input.webpack.outfile,
						libraryTarget: "commonjs",
					},
					plugins: [plugin.webpack(pluginOption)],
					devtool: "source-map",
				};

				const webpack5Options = {
					entry: path.resolve(__dirname, "test.src", input.webpack.entry),
					plugins: [plugin.webpack(pluginOption)],
					devtool: "source-map",
					output: {
						path: path.resolve(__dirname, "test.out/webpack"),
						filename: input.webpack.outfile,
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

				await checkExpectations(expectations.webpack);
			},
		);

		it.skipIf(isSkipped("vite"))(`build ${pluginName} with vite`, async () => {
			await build.vite({
				clearScreen: false,
				plugins: [plugin.vite(pluginOption)],
				build: {
					lib: {
						entry: path.resolve(__dirname, "test.src", input.vite.entry),
						name: "TestLib",
						fileName: input.vite.outfile.replace(".js", ""),
						formats: ["cjs"],
					},
					outDir: path.resolve(__dirname, "test.out/vite"),
					sourcemap: true,
				},
			});

			await checkExpectations(expectations.vite);
		});

		it.skipIf(isSkipped("esbuild"))(
			`build ${pluginName} with esbuild`,
			async () => {
				await build.esbuild({
					entryPoints: [
						path.resolve(__dirname, "test.src", input.esbuild.entry),
					],
					plugins: [plugin.esbuild(pluginOption)],
					bundle: true, // actually traverse imports
					outfile: path.resolve(
						__dirname,
						"test.out/esbuild",
						input.esbuild.outfile,
					),
					format: "cjs",
					sourcemap: true,
				});

				await checkExpectations(expectations.esbuild);
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
						output: path.resolve(__dirname, "test.src", input.farm.entry),
					},
					output: {
						entryFilename: input.farm.outfile,
						path: path.resolve(__dirname, "test.out/farm"),
					},
				},
			});

			await checkExpectations(expectations.farm);
		});

		it.skipIf(isSkipped("rollup"))(
			`build ${pluginName} with rollup`,
			async () => {
				await build
					.rollup({
						plugins: [plugin.rollup(pluginOption)],
						input: path.resolve(__dirname, "test.src", input.rollup.entry),
					})
					.then((rollupBuild) =>
						rollupBuild.write({
							file: path.resolve(
								__dirname,
								"test.out/rollup",
								input.rollup.outfile,
							),
							format: "cjs",
							exports: "named",
							sourcemap: true,
						}),
					);

				await checkExpectations(expectations.rollup);
			},
		);

		it.skipIf(isSkipped("rolldown"))(
			`build ${pluginName} with rolldown`,
			async () => {
				await build
					.rolldown({
						plugins: [plugin.rolldown(pluginOption)],
						input: path.resolve(__dirname, "test.src", input.rolldown.entry),
						treeshake: false,
					})
					.then((rolldownBuild) =>
						rolldownBuild.write({
							format: "cjs",
							dir: path.resolve(__dirname, "test.out/rolldown"),
							exports: "named",
							sourcemap: true,
							entryFileNames: input.rolldown.outfile,
						}),
					);

				await checkExpectations(expectations.rolldown);
			},
		);

		it.skipIf(isSkipped("rspack"))(
			`build ${pluginName} with rspack`,
			async () => {
				const rspackOptions: RspackOptions = {
					entry: path.resolve(__dirname, "test.src", input.rspack.entry),
					plugins: [plugin.rspack(pluginOption)],
					devtool: "source-map",
					output: {
						path: path.resolve(__dirname, "test.out/rspack"),
						filename: input.rspack.outfile,
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

				await checkExpectations(expectations.rspack);
			},
		);
	},
);
