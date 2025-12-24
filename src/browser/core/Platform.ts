import * as process from "node:process"

export namespace Platform {
	export const win: boolean = process.platform === "win32"
	export const mac: boolean = process.platform === "darwin"
}
