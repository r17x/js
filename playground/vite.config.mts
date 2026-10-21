import Flag from "../packages/unplugin-flag/src/vite";
import Environment from "../packages/unplugin-environment/src/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import { z } from "zod";
import Unplugin from "../packages/unplugin-rescript/src/vite";

export default defineConfig({
	plugins: [
		Flag({
			HOME_V1: "off",
			HOME_V2: "on",
		}),
		Inspect(),
		Unplugin(),
		Environment({
			match: "NEXT_",
			schema: {
				NEXT_PUBLIC_APP: z.string(),
			},
		}),
	],
});
