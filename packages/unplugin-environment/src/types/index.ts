type Match = string | string[];
type Option = Match;
type OptionWithSchema = {
	match: Match;
	schema: unknown;
};

/**
 * Environment option
 * @example
 * ```ts
 * const withOptionSimple = Environment('REACT_APP_*') // we assume that prefix is REACT_APP.
 * const withOptionSimples = Environment(['REACT_APP_*', 'NEXT_PUBLIC_*', 'VITE_APP_*', 'PUBLIC_*']) // many prefixes matcher.
 * const withOptionStrict = Environment({
 *   match: 'REACT_APP',
 *   // add schema to validate environment variable
 *   // it will throw error if the environment variable is not valid at build time.
 *   schema: z.shape({
 *     REACT_APP_API_URL: z.string(),
 *     REACT_APP_API_TOKEN: z.string(),
 *   })
 * })
 * ```
 */
export type Options = Option | OptionWithSchema;
