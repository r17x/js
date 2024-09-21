import type * as ReScriptV11 from "./rescript-v11";

export type Options = {
	command?: {
		build?: string;
	};
	cwd: string;
	rescriptConfig: string;
};

export type ContextOptions = Options & {
	cwd: string;
	compilerOptions: ReScriptV11.ReScriptBuildConfiguration & { suffix: string };
	command: {
		build: string;
	};
};

export * as ReScriptV11 from "./rescript-v11";
export * as ReScriptV10 from "./rescript-v10";
