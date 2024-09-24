module.exports = {
	name: "plugin-format-after-install",
	factory: (require) => {
		const { execute } = require("@yarnpkg/shell");
		return {
			hooks: {
				afterAllInstalled: async (project) => {
					const biome = Array.from(project.storedPackages.values()).find(
						(pkg) => pkg.name === "biome" && pkg.scope === "biomejs",
					);
					if (biome) {
						const root = project.workspaces[0];
						const packageJsons = project.workspaces
							.map((myProject) => `${myProject.cwd}/package.json`)
							.join(" ");
						process.exitCode = await execute(
							`yarn --cwd ${root.cwd} biome check --write ${packageJsons}`,
						);
					}
				},
			},
		};
	},
};
