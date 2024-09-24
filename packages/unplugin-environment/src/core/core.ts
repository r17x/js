import type { Match, OptionWithSchema, Options } from "@/types";
import { A, D, F, G, S, pipe } from "@mobily/ts-belt";
import { P, match } from "ts-pattern";
import type { ZodRawShape } from "zod";
import { z } from "zod";
import { zodToTs } from "zod-to-ts";
import { printTypeDefinition } from "./ast";

const exclaim = S.startsWith("!");
const dropHead = S.sliceToEnd(1);

const optionWithSchema = z.strictObject({
	match: z.union([z.string(), z.string().array()]),
	schema: z.union([z.instanceof(z.ZodType), z.record(z.any())]),
	moduleEnvName: z.string().optional().default("@env"),
});

const PoptionWithSchema = P.when(
	(a): a is OptionWithSchema => optionWithSchema.safeParse(a).success,
);

export const getOptions = (o: Options): OptionWithSchema =>
	match(o)
		.with(P.union(P.string, P.array(P.string)), (m) => ({
			match: m,
			schema: z.any(),
			moduleEnvName: "@env",
		}))
		.with(PoptionWithSchema, (a) => ({
			...a,
			moduleEnvName: a.moduleEnvName || "@env",
		}))
		.exhaustive();

const filterEnv = (env: Record<string, string>, m: Match) => {
	const ms = G.isString(m) ? [m] : m;
	const white = pipe(ms, A.filter(G.isNot(exclaim)));
	const black = pipe(ms, A.filter(exclaim), A.map(dropHead));
	const selector = (key: string) => A.some(white, (m) => S.startsWith(key, m));

	return pipe(env, D.filterWithKey(selector), D.deleteKeys(black));
};

export const getEnv = (
	env: Record<string, string>,
	options: OptionWithSchema,
) => filterEnv(env, options.match);

// TODO: need to improve for deep values in object
const isZodRawShape = P.when(
	(a): a is ZodRawShape =>
		G.isObject(a) &&
		Object.values(a).every((b) => z.instanceof(z.ZodType).parse(b)),
);

export const getTsNodeType = (options: OptionWithSchema) =>
	match(options.schema)
		.with(P.instanceOf(z.ZodType), (schema) =>
			match(zodToTs(schema).node)
				.with({ kind: 133 }, () => zodToTs(z.record(z.any(), z.any())).node)
				.otherwise(() => zodToTs(schema).node),
		)
		.with(isZodRawShape, (schema) => zodToTs(z.object(schema)).node)
		.exhaustive();

const toUndefined = () => undefined;

export const createModuleEnv = (
	env: Record<string, string>,
	options: OptionWithSchema,
) => ({
	code: `export const env = ${JSON.stringify(getEnv(env, options))}`,
});

export const resolveId = (options: OptionWithSchema) =>
	F.ifElse(
		(id: string) => id === options.moduleEnvName,
		() => options.moduleEnvName,
		toUndefined,
	);

export const load = (env: Record<string, string>, options: OptionWithSchema) =>
	F.ifElse(
		(id: string) => id === options.moduleEnvName,
		() => Promise.resolve(createModuleEnv(env, options)),
		toUndefined,
	);

// TODO: will be better to use `t.factory` from 'typescript'.
export const createModuleDTS = (
	options: OptionWithSchema,
) => `declare module "${options.moduleEnvName}" {
  export const env: ${pipe(options, getTsNodeType, printTypeDefinition)}
}`;

export { printTypeDefinition } from "./ast";
