import type { Options, PluginOption } from "@/types";
import { A, D, F, G, S, pipe } from "@mobily/ts-belt";
import { z } from "zod";
import { SyntaxKind, printTypeDefinition, zodToTs } from "./ast";

const exclaim = S.startsWith("!");
const dropHead = S.sliceToEnd(1);

const matchSchema = z.string().min(1).or(z.string().min(1).array());

const option = matchSchema
	.transform((match) => ({
		match,
		schema: z.any(),
		moduleEnvName: "@env",
	}))
	.or(
		z.strictObject({
			match: matchSchema,
			schema: z
				.record(z.any())
				.transform((a) => z.object(a))
				.or(z.instanceof(z.ZodType)),
			moduleEnvName: z.string().optional().default("@env"),
		}),
	);

export const getOptions = (o: PluginOption): Options => option.parse(o);

const filterEnv = (env: Record<string, string>, m: Options["match"]) => {
	const ms = G.isString(m) ? [m] : m;
	const white = pipe(ms, A.filter(G.isNot(exclaim)));
	const black = pipe(ms, A.filter(exclaim), A.map(dropHead));
	const selector = (key: string) => A.some(white, (m) => S.startsWith(key, m));

	return pipe(env, D.filterWithKey(selector), D.deleteKeys(black));
};

export const getEnv = (env: Record<string, string>, options: Options) =>
	filterEnv(env, options.match);

export const getTsNodeType = (options: Options) =>
	F.ifElse(
		zodToTs(options.schema).node,
		({ kind }) => kind === SyntaxKind.AnyKeyword,
		() => zodToTs(z.record(z.any(), z.any())).node,
		F.identity,
	);

const toUndefined = () => undefined;

export const createModuleEnv = (
	env: Record<string, string>,
	options: Options,
) => ({
	code: `export const env = ${JSON.stringify(getEnv(env, options))}`,
});

// TODO: will be better to use `t.factory` from 'typescript'.
export const createModuleDTS = (options: Options) => `declare module "${
	options.moduleEnvName
}" {
  export const env: ${pipe(options, getTsNodeType, printTypeDefinition)}
}`;

export const resolveId = (options: Options) =>
	F.ifElse(
		(id: string) => id === options.moduleEnvName,
		() => options.moduleEnvName,
		toUndefined,
	);

export const load = (env: Record<string, string>, options: Options) =>
	F.ifElse(
		(id: string) => id === options.moduleEnvName,
		() => Promise.resolve(createModuleEnv(env, options)),
		toUndefined,
	);

export const build = (env: Record<string, string>, options: Options) => {};
// F.once(() => import("fs/promises"))()
// .then(fs => [
// ]).then(([a,b]) =>  )

export { printTypeDefinition } from "./ast";
