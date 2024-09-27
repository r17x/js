import path from "path";
import { A, D, F, G, S, pipe } from "@mobily/ts-belt";
import { z } from "zod";
import { SyntaxKind, printTypeDefinition, zodToTs } from "./ast";
import type { Options, PluginOption } from "./types";

const toUndefined = () => undefined;
const exclaim = S.startsWith("!");
const dropHead = S.sliceToEnd(1);

const matchSchema = z.string().min(1).or(z.string().min(1).array());

const defaultOption = (match: Options["match"]) => ({
	match,
	schema: z.record(z.string().optional()),
	moduleEnvName: "@env",
});

const strictOption = z.strictObject({
	match: matchSchema,
	schema: z
		.record(z.instanceof(z.ZodType))
		.transform((a) => z.object(a))
		.or(z.instanceof(z.ZodObject)),
	moduleEnvName: z.string().optional().default("@env"),
});

const option = matchSchema.transform(defaultOption).or(strictOption);

export const getOptions = (o: PluginOption): Options =>
	option.parse(o) as Options; // using as for type but don't worries, we have power of `zod`.

const filterEnv = (env: Record<string, string>, m: Options["match"]) => {
	const ms = G.isString(m) ? [m] : m;
	const white = pipe(ms, A.filter(G.isNot(exclaim)));
	const black = pipe(ms, A.filter(exclaim), A.map(dropHead));
	const selector = (key: string) => A.some(white, (m) => S.startsWith(key, m));

	return pipe(env, D.filterWithKey(selector), D.deleteKeys(black));
};

export const getEnv = (env: Record<string, string>, options: Options) => {
	const filteredEnv = filterEnv(env, options.match);

	return F.ifElse(
		options.schema.safeParse(filteredEnv),
		({ success }) => success,
		({ data }) => D.merge(filteredEnv, data),
		() => filteredEnv,
	);
};

export const createModuleEnv = (
	env: Record<string, string>,
	options: Options,
) => ({
	code: `export const env = ${JSON.stringify(getEnv(env, options))}`,
});

export const createModuleDTS = (
	env: Record<string, string>,
	options: Options,
) =>
	pipe(
		D.keys(filterEnv(env, options.match)),
		A.reduce(D.makeEmpty<Record<string, z.ZodType>>(), (a, b) =>
			D.set(a, b, z.string().optional()),
		),
		z.object,
		(zo) => zo.merge(options.schema),
		zodToTs,
		({ node }) => node,
		printTypeDefinition,
		(typeDef) => [
			// TODO: will be better to use `t.factory` from 'typescript'.
			`declare module "${options.moduleEnvName}" {`,
			`export const env: ${typeDef}`,
			"}",
		],
		A.join("\n"),
		S.replaceAll("?: string | undefined", "?: string"),
	);

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

export const watchChange = (
	watchList: string[],
	onChange: (id: string) => void,
) =>
	F.ifElse(
		(id: string) => A.some(watchList, (x) => S.includes(path.basename(id), x)),
		onChange,
		toUndefined,
	);

export const build = (env: Record<string, string>, options: Options) =>
	options.schema.safeParseAsync(env).then(
		F.ifElse(
			({ success }) => success,
			(a) => Promise.resolve(a),
			(e) => Promise.reject(e?.error),
		),
	);

export { printTypeDefinition } from "./ast";
