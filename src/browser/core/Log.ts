import * as util from "node:util"

export enum Color {
	clear = "\u001b[0m",
	green = "\u001b[32m",
	blue = "\u001b[34m",
	magenta = "\u001b[35m",
	cyan = "\u001b[36m",
}

export function log(color: Color, label: string, ...args: any) {
	console.log(
		`${color}[${label}]${Color.clear}`,
		...args.map((argument: any) => {
			return typeof argument === "object"
				? util.inspect(argument, { colors: true, breakLength: Infinity, compact: true })
				: argument
		}),
	)
}
