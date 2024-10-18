import { D, R, flow, pipe } from "@mobily/ts-belt";
import { z } from "zod";
import { name as pkgName } from "../../package.json";
import type * as CoreType from "./types";

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

// TODO:
// * handle virtual modules
// * dead-code elimination by value of record `options`
//   * handle function as value when return promise binary value
//   * handle function as value when return binary value
const createFactory: CoreType.CreateFactory = (_options) => defaultFactory;

const getOptionsR = (opt: CoreType.PluginOption) =>
	R.fromExecution(() => option.parse(opt));

export const unpluginFactory = flow(
	getOptionsR,
	R.map((options) =>
		pipe(
			D.makeEmpty(),
			D.set("options", options),
			D.set("factory", createFactory(options)),
		),
	),
	// R.map(factory),
	// R.map(updateFactory),
	R.mapWithDefault(defaultFactory, (data) => data.factory),
);
