import path from "path";
import { fileURLToPath } from "url";
import { A, D, F, G, R, S, flow, pipe } from "@mobily/ts-belt";
import { config as dotenvConfig } from "dotenv";
import * as fs from "fs/promises";
import * as ts from "typescript";
import { z } from "zod";
import { zodToTs } from "zod-to-ts";
import { name as pkgName, version as pkgVersion } from "../../package.json";
import { log } from "./logger";
import type * as CoreType from "./types";
import { dropHead, exclaim, toJsonString, toNull, toUndefined } from "./utils";

const defaultFactory: CoreType.Data["factory"] = {
	name: pkgName,
	enforce: "pre",
};

const defaultOption =
	(moduleEnvName: string) => (match: CoreType.Options["match"]) => ({
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

export const getOptions: CoreType.GetOptions = (o) =>
	option.or(clientServerOption).parse(o) as CoreType.UOptions; // using as for type but don't worries, we have power of `zod`.

const getOptionsR = (opt: CoreType.PluginOption) =>
	R.fromExecution(() => getOptions(opt));

const isClientServer = (
	o: CoreType.UOptions,
): o is CoreType.OptionsClientServer =>
	F.both(
		o as Partial<CoreType.OptionsClientServer>,
		(opt) => G.isNotNullable(opt?.client),
		(opt) => G.isNotNullable(opt?.server),
	);

export const mapOptions = <A>(
	o: CoreType.UOptions,
	fxs: CoreType.MapOptions<A>,
) => (isClientServer(o) ? fxs.clientServer(o) : fxs.single(o));

const filterEnv: CoreType.FilterEnv = (env, m) => {
	const ms = G.isString(m) ? [m] : m;
	const white = pipe(ms, A.filter(G.isNot(exclaim)));
	const black = pipe(ms, A.filter(exclaim), A.map(dropHead));
	const selector = (key: string) => A.some(white, (m) => S.startsWith(key, m));

	return pipe(env, D.filterWithKey(selector), D.deleteKeys(black));
};

export const getEnv: CoreType.GetEnv = (env, options) => {
	const filteredEnv = filterEnv(env, options.match);

	return F.ifElse(
		options.schema.safeParse(filteredEnv),
		({ success }) => success,
		({ data }) => D.merge(filteredEnv, data),
		() => filteredEnv,
	);
};

export const createModuleEnv: CoreType.CreateModuleEnv = (env, options) => ({
	code: `export const env = ${toJsonString(getEnv(env, options))}`,
});

export const createModuleEnvServer = () => ({
	code: `
  const isServer = (() => {
    const isBrowser = typeof window !== "undefined" 
    if(isBrowser) {
      console.error("❌ Invalid accessing environment variables server in [CLIENT]");
      throw new Error("Invalid accessing environment variables server in [CLIENT]");
    }
    return !isBrowser 
  })()

  const env = new Proxy(process?.env || {}, {
    get(target, key){
      if (typeof key !== "string") return undefined;
      return target[key];
    }
  })

  export { env }
`,
});

const printer = ts.createPrinter({
	newLine: ts.NewLineKind.LineFeed,
	omitTrailingSemicolon: true,
});

const emptySourceFile = ts.createSourceFile("", "", ts.ScriptTarget.Latest);

export const printTypeDefinition = (node: ts.TypeNode) =>
	printer.printNode(ts.EmitHint.Unspecified, node, emptySourceFile);

export const createModuleDTS: CoreType.CreateModuleDTS = (env, options) =>
	pipe(
		F.ifElse(filterEnv(env, options.match), D.isEmpty, () => [], D.keys),
		A.reduce(D.makeEmpty<Record<string, z.ZodType>>(), (a, b) =>
			D.set(a, b, z.string().optional()),
		),
		(o) => z.object(o),
		(zo) =>
			zo.merge(
				z.object(D.map(options.schema?.shape || {}, (v) => v._def.out || v)),
			),
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

export const loadInclude: CoreType.LoadInclude = (options) =>
	S.endsWith(options.moduleEnvName);

export const watchChange: CoreType.WatchChange = (watchList, onChange) =>
	F.ifElse(
		(id) => A.some(watchList, F.equals(path.basename(id))),
		onChange,
		toUndefined,
	);

const factory = (options: CoreType.UOptions): CoreType.Data => ({
	options,
	env: G.isObject<CoreType.Env>(process?.env) ? process.env : {},
	factory: defaultFactory,
	watchList: [".env"],
});

const logError = (e: Error) => {
	log({
		kind: "error",
		message: e?.message || "something went wrong",
		prefix: pkgName,
	});
};

const loadEnv = (data: CoreType.Data) => {
	dotenvConfig({ processEnv: data.env });
	const exit = () =>
		pipe(
			F.both(
				data.env,
				(env) => ["true", "1"].includes(env?.CI || ""),
				(env) => env?.NODE_ENV !== "development",
			),
			F.ifElse(F.identity, () => process.exit(1), F.ignore),
		);

	const dtsPath = pipe(import.meta.url, fileURLToPath, path.dirname, (dir) =>
		path.resolve(dir, "env.d.ts"),
	);

	const writeDts = (dtsContent: string) => fs.writeFile(dtsPath, dtsContent);

	const logInfo = (message: string) => () =>
		log({
			kind: "info",
			message,
			prefix: data.factory.name,
		});

	mapOptions(data.options, {
		single: (o) =>
			pipe(
				R.fromExecution(() => o.schema.parseAsync(data.env)),
				R.tapError(logError),
				R.tap(logInfo("✓ Valid env with Schema")),
				R.map(() => writeDts(createModuleDTS(data.env, o))),
				R.tap(logInfo("✓ Generated env.d.ts")),
				R.mapWithDefault(F.ignore(), exit),
			),

		clientServer: (o) =>
			pipe(
				R.fromExecution(
					flow(
						() => [o.client, o.server],
						A.map((o) => o.schema.parseAsync(data.env)),
						(ps) => Promise.allSettled(ps),
					),
				),
				R.tapError(logError),
				R.tap(logInfo("✓ Valid env with Schema")),
				R.map(
					flow(
						() => [o.client, o.server],
						A.map((opt) => createModuleDTS(data.env, opt)),
						A.join("\n"),
						writeDts,
					),
				),
				R.tap(logInfo("✓ Generated env.d.ts")),
				R.mapWithDefault(F.ignore(), exit),
			),
	});
};

const updateFactory = (data: CoreType.Data) => {
	const watchChange_ = watchChange(data.watchList, () => {
		// NOTE: known issues in Nextjs 14.2.14 - watch is not triggered
		loadEnv(data);
	});
	const buildStart = () => {
		loadEnv(data);
	};
	const factory = mapOptions(data.options, {
		single: (o) => ({
			buildStart,
			resolveId: F.ifElse(loadInclude(o), F.identity, toNull),
			loadInclude: loadInclude(o),
			load: F.ifElse(
				F.equals(o.moduleEnvName),
				() => Promise.resolve(createModuleEnv(data.env, o)),
				toUndefined,
			),
			watchChange: watchChange_,
		}),
		clientServer: (o) => ({
			buildStart,
			resolveId: F.ifElse(
				F.either(loadInclude(o.client), loadInclude(o.server)),
				F.identity,
				toNull,
			),
			loadInclude: F.either(loadInclude(o.client), loadInclude(o.server)),
			load: F.ifElse(
				F.either(loadInclude(o.client), loadInclude(o.server)),
				F.ifElse(
					F.equals(o.client.moduleEnvName),
					() => Promise.resolve(createModuleEnv(data.env, o.client)),
					() => Promise.resolve(createModuleEnvServer()),
				),
				toUndefined,
			),
			watchChange: watchChange_,
		}),
	});
	return D.set(data, "factory", D.merge(data.factory, factory));
};

export const unpluginFactory = flow(
	getOptionsR,
	R.map(factory),
	R.map(updateFactory),
	R.mapWithDefault(defaultFactory, (data) => data.factory),
);
