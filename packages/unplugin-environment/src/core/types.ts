import type { ZodObject, ZodRawShape } from "zod";

export type Match = string | string[];
/**
 * @description Options with schema and will "strict" validate the env variable
 * @example
 * ```ts
 * const optionWithSchema = {
 *   match: 'REACT_APP',
 *   schema: { APP_NAME: z.string() }
 *   //  moduleEnvName: will be '@env' for accessing env
 *   //  import {env} from '@env'
 *   //  env.APP_NAME
 * }
 *
 * const optionWithSchemaAndModuleEnvName = {
 *   match: 'REACT_APP',
 *   schema: { APP_NAME: z.string() },
 *   moduleEnvName: '@myenv'
 *   //  import { env } from '@myenv'
 *   //  env.APP_NAME
 * }
 * ```
 */
export type Options = {
	match: Match;
	schema: ZodObject<ZodRawShape>;
	moduleEnvName: string;
};

type SchemaOption = {
	match: Match;
	schema: ZodObject<ZodRawShape> | ZodRawShape;
	/**
	 * @default '@env'
	 */
	moduleEnvName?: string;
};

export type PluginOption = Match | SchemaOption;
