import * as farm from "@farmfe/core";
import * as rspack from "@rspack/core";
import * as esbuild from "esbuild";
import * as rolldown from "rolldown";
import * as rollup from "rollup";
import * as vite from "vite";
import * as webpack from "webpack";

const viteBuild = vite.build;
const farmBuild = farm.build;
const rollupBuild = rollup.rollup;
const rolldownBuild = rolldown.rolldown;
const esbuildBuild = esbuild.build;
const webpackBuild: typeof webpack.webpack =
	// biome-ignore lint/suspicious/noExplicitAny: false
	webpack.webpack || (webpack as any).default || webpack;
const rspackBuild = rspack.rspack;

// biome-ignore lint/suspicious/noExplicitAny: false
export const webpackVersion = ((webpack as any).default || webpack).version;

export const build: {
	webpack: typeof webpack.webpack;
	rspack: typeof rspackBuild;
	rollup: typeof rollupBuild;
	rolldown: typeof rolldownBuild;
	vite: typeof viteBuild;
	farm: typeof farmBuild;
	esbuild: typeof esbuildBuild;
} = {
	farm: farmBuild,
	webpack: webpackBuild,
	rspack: rspackBuild,
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

export type { RspackOptions } from "@rspack/core";
export type FarmOptions = farm.FarmCLIOptions & farm.UserConfig;
export type EsbuildOptions = esbuild.BuildOptions;
export type RolldownOptions = rolldown.RolldownOptions;
export type RollupOptions = rollup.RollupOptions;
export type ViteOptions = vite.UserConfig;
