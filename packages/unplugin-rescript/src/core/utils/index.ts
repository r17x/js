import { createFilter } from "@rollup/pluginutils";

const filter = createFilter([/\.res$/], [/lib\/bs\//]);

export { filter };
export * from "./load-resconfig";
