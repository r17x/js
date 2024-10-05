import type { UnpluginFactory, UnpluginOptions } from "unplugin";
import type { ZodObject, ZodRawShape } from "zod";

/**
 * @description Match option defines the prefixes for the environment variables that will be loaded. You can pass a single string, an array of strings for multiple prefixes, or exclude variables using a ! before the prefix.
 * @example
 * ```ts
 * Environment("PREFIX_APP")
 * Environment(["PREFIX_APP", "PREFIX2"])
 * Environment(["PREFIX_APP", "PREFIX2", "!PREFIX3"])
 * ````
 */
export type Match = string | string[];

type ClientServer<T> = { client: T; server: T };
/**
 * @description Options with schema and will "strict" validate the env variable
 * @example
 * ```ts
 * Environment({
 *   match: 'REACT_APP',
 *   schema: { APP_NAME: z.string() }
 * })
 *
 * Environment({
 *   match: 'REACT_APP',
 *   schema: { APP_NAME: z.string() },
 *   moduleEnvName: '@myenv'
 * })
 * ```
 */
export type Options = {
	match: Match;
	schema: ZodObject<ZodRawShape>;
	moduleEnvName: string;
};

export type OptionsClientServer = ClientServer<Options>;
export type UOptions = Options | OptionsClientServer;

export type SchemaOption = {
	match: Match;
	schema: ZodObject<ZodRawShape> | ZodRawShape;
	/**
   @default '@env'
  */
	moduleEnvName?: string;
};

export type SchemaClientServerOption = ClientServer<Match | SchemaOption>;

/**
 * @example
 * ```ts
 * // When you need only one prefix.
 * Environment("PREFIX_APP")
 * // When you need multiple prefixes.
 * Environment(["PREFIX_APP", "PREFIX2"])
 * // When you need validation for the env variables.
 * Environment({
 *   match: 'PREFIX_APP',
 *   schema: { PREFIX_APP_NAME: z.string() }
 * })
 * // When you want to customize the module name for accessing the env variables.
 * Environment({
 *   match: 'REACT_APP',
 *   schema: { PREFIX_APP_NAME: z.string() },
 *   moduleEnvName: '@myenv'
 * })
 * // When you need different environment for client and server.
 * Environment({
 *  client: {
 *   match: 'CLIENT_APP',
 *   schema: { CLIENT_APP_NAME: z.string() },
 *   moduleEnvName: '@myenv/client'
 *  },
 *  server: {
 *   match: 'SERVER_APP',
 *   schema: { DB_URL: z.url() },
 *   moduleEnvName: '@myenv/server'
 *  }*
 * })
 * ```
 */
export type PluginOption = Match | SchemaOption | SchemaClientServerOption;

export type UnpluginEnvironmentFactory = UnpluginFactory<PluginOption>;

export type GetOptions = (o: PluginOption) => UOptions;

export type MapOptions<A> = {
	single: (a: Options) => A;
	clientServer: (a: OptionsClientServer) => A;
};

export type Env = Record<string, string>;

export type GetEnv = (env: Env, options: Options) => Env;

export type FilterEnv = (env: Env, m: Match) => Env;

export type Code = { code: string };

export type CreateModuleEnv = (env: Env, options: Options) => Code;

export type CreateModuleDTS = (env: Env, options: Options) => string;

export type LoadInclude = (options: Options) => (id: string) => boolean;

type OnChange = (id: string) => void;

export type WatchChange = (watchList: string[], onChange: OnChange) => OnChange;

export type Data = {
	options: UOptions;
	env: Env;
	factory: UnpluginOptions;
	watchList: string[];
};
