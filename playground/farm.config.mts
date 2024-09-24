import { defineConfig } from "@farmfe/core";
import ReScript from "../packages/unplugin-rescript/src/farm";

export default defineConfig({
	plugins: [ReScript()],
});
