import Environment from "unplugin-environment/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import { z } from "zod";
import Unplugin from "../packages/unplugin-rescript/src/vite";

export default defineConfig({
	plugins: [
		Inspect(),
		Unplugin(),
		Environment({
			match: "REACT_APP",
			schema: {
				REACT_APP_NAME: z.string(),
				REACT_APP_DURATION: z
					.string()
					.transform((a) => a | 0)
					.pipe(z.number().min(1)),
			},
		}),
	],
});
