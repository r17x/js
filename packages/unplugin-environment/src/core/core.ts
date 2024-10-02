import path from "path";
import { A, D, F, G, S, pipe } from "@mobily/ts-belt";
import { z } from "zod";
import { name as pkgName, version as pkgVersion } from "../../package.json";
import { printTypeDefinition, zodToTs } from "./ast";
import type {
	Match,
	Options,
	OptionsClientServer,
	PluginOption,
	UOptions,
} from "./types";

const toUndefined = () => undefined;
const exclaim = S.startsWith("!");
const dropHead = S.sliceToEnd(1);

const defaultOption = (moduleEnvName: string) => (match: Options["match"]) => ({
	match,
	schema: z.record(z.string(), z.string().optional()),
	moduleEnvName,
});

// allow user to fill match with `match: string | string[]`
const match = z.string().min(1).or(z.string().min(1).array());
// allow user to customize module name of env with default `@env`
const moduleEnvName = z.string().min(1).optional();
// allow user to fill  `schema` with `schema: z.object({key: ZodType})`
// or `schema: {key: ZodType}`.
export const schema = z
	.instanceof(z.ZodObject)
	.or(
		z.record(z.string(), z.instanceof(z.ZodType)).transform((a) => z.object(a)),
	);

const strictOption = z.object({
	match: match,
	schema: schema,
	moduleEnvName: moduleEnvName.default("@env"),
});

const option = match.transform(defaultOption("@env")).or(strictOption);

const clientServerOption = z.object({
	client: match.transform(defaultOption("@env/client")).or(
		z.object({
			match: match,
			schema: schema,
			moduleEnvName: moduleEnvName.default("@env/client"),
		}),
	),
	server: match.transform(defaultOption("@env/server")).or(
		z.object({
			match: match,
			schema: schema,
			moduleEnvName: moduleEnvName.default("@env/server"),
		}),
	),
});

export const getOptions = (o: PluginOption): UOptions =>
	option.or(clientServerOption).parse(o) as UOptions; // using as for type but don't worries, we have power of `zod`.

const isClientServer = (o: UOptions): o is OptionsClientServer =>
	clientServerOption.safeParse(o).success;

export const mapOptions = <A>(
	o: UOptions,
	{
		single: a,
		clientServer: b,
	}: {
		single: (a: Options) => A;
		clientServer: (a: OptionsClientServer) => A;
	},
) => (isClientServer(o) ? b(o) : a(o));

const filterEnv = (env: Record<string, string>, m: Match) => {
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

export const createModuleEnvServer = (
	env: Record<string, string>,
	options: Options,
) => ({
	code: `
  const isServer = (() => {
    const isBrowser = typeof window !== "undefined" 
    if(isBrowser) {
      console.error("❌ Invalid accessing environment variables server in [CLIENT]");
      throw new Error("Invalid accessing environment variables server in [CLIENT]");
    }
    return !isBrowser 
  })()

  const _env = (() => process?.env || {})

  const env = new Proxy(_env, {
    get(target, key){
      if (typeof prop !== "string") return undefined;
      const serverKeys = ${JSON.stringify(D.keys(filterEnv(env, options.match)))};
      return target[key];
    }
  })

  export { env }
`,
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
		(o) => z.object(o),
		(zo) =>
			zo.merge(z.object(D.map(options.schema.shape, (v) => v._def.out || v))),
		zodToTs,
		({ node }) => node,
		printTypeDefinition,
		(typeDef) => [
			`// DO NOT EDIT THIS FILE. IT IS GENERATED BY \`${pkgName}@${pkgVersion}\` - see https://npm.im/${pkgName}`,
			"",
			// TODO: will be better to use `t.factory` from 'typescript'.
			`declare module "${options.moduleEnvName}" {`,
			`export const env: ${typeDef}`,
			"}",
		],
		A.join("\n"),
		S.replaceAll("?: string | undefined", "?: string"),
	);

// NOTE: must be adjust for this function when need to load `@env/*`.
export const loadInclude = (options: Options) =>
	S.endsWith(options.moduleEnvName);

export const resolveId = (options: Options) =>
	F.ifElse(
		loadInclude(options),
		() => options.moduleEnvName,
		() => null,
	);

export const load = (env: Record<string, string>, options: UOptions) =>
	mapOptions(options, {
		single: (o) =>
			F.ifElse(
				(id: string) => id === o.moduleEnvName,
				() => Promise.resolve(createModuleEnv(env, o)),
				toUndefined,
			),
		clientServer: (o) =>
			F.ifElse(
				F.anyPass([loadInclude(o.client), loadInclude(o.server)]),
				(id) =>
					Promise.resolve(
						id === o.client.moduleEnvName
							? createModuleEnv(env, o.client)
							: createModuleEnvServer(env, o.server),
					),
				toUndefined,
			),
	});

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
