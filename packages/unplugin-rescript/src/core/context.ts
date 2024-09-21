import path from "path";
import type { ContextOptions, Options } from "@/types";
import colors from "picocolors";
import * as utils from "./utils";

import { exec } from "child_process";
import { promisify } from "util";
import { npmRunPathEnv } from "npm-run-path";

class Context {
	options: ContextOptions;
	compilerProcess: (() => void) | null = null;
	exec = promisify(exec);

	constructor(options: Options) {
		const compilerOptions: ContextOptions["compilerOptions"] = Object.assign(
			{ suffix: ".res.js" },
			utils.loadResConfig(options.cwd, options.rescriptConfig) || {},
		);

		this.options = {
			...options,
			compilerOptions,
			command: {
				build: options.command?.build || "rescript build -with-deps",
			},
		};
		this.verifyDeps();
	}

	getNewId(id: string) {
		return id.replace(".res", this.options.compilerOptions.suffix);
	}

	resolveId(id: string, importer?: string) {
		if (this.filter(id)) {
			const newId = this.getNewId(id);
			if (!importer) return newId;
			return path.resolve(path.dirname(importer), newId);
		}
	}

	verifyDeps() {
		// TODO:
		// * check current rescript version
		// * resolve compilerOptions by current rescript version (ReScriptV11, ReScriptV10)
		// * adjust command build based on current rescript version
	}

	filter(id: string) {
		return utils.filter(id);
	}

	log(kind: "error" | "info", message: string) {
		const timeFormatter = new Intl.DateTimeFormat(undefined, {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		});

		const prefix = [
			colors.dim(timeFormatter.format(new Date())),
			kind === "error"
				? colors.dim(colors.red(`[unplugin-rescript:${colors.bold("failed")}]`))
				: colors.cyan(`[unplugin-rescript:${colors.bold("success")}]`),
		].join(" ");

		message.split("\n").forEach((line, index, arr) => {
			line.length <= 2
				? console[kind](prefix.replaceAll(/.*/g, " "), line)
				: kind === "error" &&
						(line.includes("│") || arr[index - 2]?.includes("│"))
					? console[kind](prefix, colors.bold(line))
					: console[kind](prefix, line);
		});
	}

	async build() {
		this.compilerProcess?.();

		const controller = new AbortController();
		const { signal } = controller;

		await this.exec(this.options.command.build, {
			signal,
			env: npmRunPathEnv(),
		})
			.then(({ stdout, stderr }) => {
				stdout && this.log("info", stdout);
				stderr && this.log("error", stderr);
			})
			.catch((e) => {
				e.stdout && this.log("error", String(e.stdout));
				controller.abort();
			});

		this.compilerProcess = () => {
			if (!signal.aborted) {
				controller.abort();
			}
		};
	}

	watchChange(id: string, _change: string) {
		if (this.filter(id)) {
			return this.build();
		}
	}
}

export { Context };
