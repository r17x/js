import type { ZodRawShape, ZodTypeAny } from "zod";

export type Match = string | string[];
type Option = Match;

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
export type OptionWithSchema = {
	match: Match;
	schema: ZodTypeAny | ZodRawShape;
	moduleEnvName?: string;
};

export type Options = Option | OptionWithSchema;
