import type { UnpluginFactory, UnpluginOptions } from "unplugin";

export type BinaryValue = boolean | "on" | "off";
export type PromiseLikeBinaryValue = PromiseLike<BinaryValue>;

type UnaryFunction<T> = () => T;

type FlagValue =
	| BinaryValue
	| UnaryFunction<BinaryValue>
	| UnaryFunction<PromiseLikeBinaryValue>;

/**
 * @example
 * ```ts
 * Flag({
 *    USER_PROFILE_V2: 'on',
 *    USER_PROFILE_V3: () => 'on',
 *    USER_PROFILE_V4: () => Promise.resolve('on'),
 * })
 * ```
 */
export type PluginOption = Record<string, FlagValue>;

export type UnpluginEnvironmentFactory = UnpluginFactory<PluginOption>;

export type Data = {
	options: PluginOption;
	factory: UnpluginOptions;
};
