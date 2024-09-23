import type { Options } from "@/types";

class Context {
	options: Options;
	env: unknown;

	constructor(options: Options) {
		this.options = options;
	}

	getNewId(_id: string) {}

	resolveId(_id: string, _importer?: string) {}

	filter(_id: string) {}

	log(_kind: "error" | "info", _message: string) {}

	async build() {}

	watchChange(_id: string, _change: string) {}
}

export { Context };
