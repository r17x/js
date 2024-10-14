import { A, D, F, G, N, O, R, S, flow, pipe } from "@mobily/ts-belt";
import { z } from "zod";
import { name as pkgName } from "../../package.json";
import type * as CoreType from "./types";
import * as ast from "./ast";
import * as utils from "@utils";

type U = ReturnType<CoreType.CreateFactory>;
type FV = CoreType.FlagValue;

const binaryValue = z.boolean().or(z.enum(["on", "off"]));
const unaryFunction = z.function();
const optionValue = binaryValue
	.or(unaryFunction.returns(z.promise(binaryValue)))
	.or(unaryFunction.returns(binaryValue));
export const option = z.record(optionValue);

const defaultFactory: CoreType.Data["factory"] = {
	name: pkgName,
	enforce: "pre",
};

const valToBoolean = F.ifElse<
	readonly [string, FV],
	O.Option<{ key: string; value: boolean }>
>(
	([_, value]) => F.either(value, G.isBoolean, G.isString),
	([key, value]) =>
		O.Some({
			key,
			value: G.isString(value) ? value === "on" : (value as boolean),
		}),
	() => O.None,
);

// TODO:
// * dead-code elimination by value of record `options`
//   * handle function as value when return promise binary value
//   * handle function as value when return binary value
const createFactory: CoreType.CreateFactory = (data) => {
	const state = new Set<string>();
	const flagModule = ast.createFlagModule(data);
	const addModuleIDToState = (importIn?: string) => {
		importIn && state.add(importIn);
	};
	const load = F.ifElse(
		F.equals(data.options.moduleFlagName),
		() => Promise.resolve({ code: flagModule.toString() }),
		utils,
	);

	const flags = pipe(
		data.flagConfig,
		D.toPairs,
		A.filterMap(valToBoolean),
		F.toMutable,
	);

	// when user import `@flag` or `moduleFlagName` in codebase
	// we MUST resolve it.
	const resolveId: U["resolveId"] = (id, importIn, _option) =>
		F.ifElse(
			id,
			F.equals(data.options.moduleFlagName),
			F.tap(F.identity, () => addModuleIDToState(importIn)),
			() => undefined,
		);

	const transform: U["transform"] = (code: string, id: string) =>
		F.ifElse(
			id,
			F.both(state.has, () => N.gt(S.length(code), 0)),
			(i) =>
				Promise.resolve(() => ({
					code: ast.transform(code, i, flags),
				})).then((f) => f()),
			() => undefined,
		);

	return D.merge(data.factory, { load, resolveId, transform });
};

const getOptions: CoreType.GetOptions = (opt) => ({
	flagConfig: option.parse(opt),
	factory: defaultFactory,
	options: {
		moduleFlagName: "@flag",
	},
});

export const unpluginFactory = flow(
	F.identity<CoreType.PluginOption>,
	(opt) => () => getOptions(opt),
	R.fromExecution,
	R.map((data) => D.set(data, "factory", createFactory(data))),
	R.mapWithDefault(defaultFactory, (data) => data.factory),
);
