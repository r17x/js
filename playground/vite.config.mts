import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import Unplugin from "../packages/unplugin-rescript/src/vite";
// import Environment from "../packages/unplugin-environment/src/vite";
// import { z } from "zod";

export default defineConfig({
	plugins: [
		Inspect(),
		Unplugin(),
		// Environment({
		// 	match: "REACT_APP",
		// 	schema: {
		// 		REACT_APP_NAME: z.string(),
		// 		REACT_APP_DURATION: z.number(),
		// 	},
		// }),
	],
});
