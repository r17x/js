import fs from "fs";
import path from "path";

const findUp = (
	name: string,
	startDir: string,
	stopDir = path.parse(startDir).root,
) => {
	let dir = startDir;
	while (dir !== stopDir) {
		const file = path.join(dir, name);
		if (fs.existsSync(file)) return file;
		if (!file.endsWith(".json")) {
			const fileWithExt = `${file}.json`;
			if (fs.existsSync(fileWithExt)) return fileWithExt;
		}
		dir = path.dirname(dir);
	}
	return null;
};

const resolveResConfigFromFile = (cwd: string, filename: string) => {
	if (path.isAbsolute(filename))
		return fs.existsSync(filename) ? filename : null;
	return findUp(filename, cwd);
};

const __loadResConfig = (dir = process.cwd(), name = "rescript.json") => {
	const id = resolveResConfigFromFile(path.resolve(dir), name);
	if (!id) return null;
	return JSON.parse(fs.readFileSync(id, "utf8"));
};

const loadResConfig = (dir: string, name?: string) =>
	__loadResConfig(dir, name);

export { loadResConfig };
