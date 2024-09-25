import colors from "picocolors";

export function log(
	{
		kind,
		message,
		prefix: p,
	}: { kind: "error" | "info"; message: string; prefix?: string },
	...args: unknown[]
) {
	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	});

	const prefix = [
		colors.dim(timeFormatter.format(new Date())),
		kind === "error"
			? colors.dim(colors.red(`[${[p, colors.bold("failed")].join(":")}]`))
			: colors.cyan(`[${[p, colors.bold("success")].join(":")}]`),
	].join(" ");

	message.split("\n").forEach((line, index, arr) => {
		line.length <= 2
			? console[kind](prefix.replaceAll(/.*/g, " "), line)
			: kind === "error" &&
					(line.includes("│") || arr[index - 2]?.includes("│"))
				? console[kind](prefix, colors.bold(line))
				: console[kind](prefix, line);
	});
	if (args.length > 0) {
		console.log("\n", JSON.stringify(args, null, 2), "\n");
	}
}
