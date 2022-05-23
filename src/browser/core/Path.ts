import * as electron from "electron"

import { Platform } from "@browser/core/Platform"

export namespace Path {
	export function appPath(): string {
		let path = electron.app.getAppPath()
		return Platform.win ? path.replace(/\\/g, "/") : path
	}

	export function userPath(): string {
		let path = electron.app.getPath("userData")
		return Platform.win ? path.replace(/\\/g, "/") : path
	}

	export function home(): string {
		let path = electron.app.getPath("home")
		return Platform.win ? path.replace(/\\/g, "/") : path
	}
}
