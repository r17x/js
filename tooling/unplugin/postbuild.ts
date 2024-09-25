import { promises as fs } from "node:fs";
import { basename, resolve } from "node:path";
import chalk from "chalk";
import fg from "fast-glob";

async function run() {
	const cwd = resolve(process.cwd(), "dist");
	console.log(chalk.cyan.inverse(" CWD: "), ` ${cwd}`);

	// fix cjs exports
	const files = await fg("*.cjs", {
		ignore: ["chunk-*"],
		absolute: true,
		cwd,
	});
	for (const file of files) {
		console.log(chalk.cyan.inverse(" POST "), `Fix ${basename(file)}`);
		let code = await fs.readFile(file, "utf8");
		code = code.replace("exports.default =", "module.exports =");
		code += "exports.default = module.exports;";
		await fs.writeFile(file, code);
	}
}

run();
