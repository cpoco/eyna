import * as electron from "electron"

import { Platform } from "@/browser/core/Platform"

export namespace Path {
	export function generic(path: string): string {
		return Platform.win ? path.replace(/\\/g, "/") : path
	}

	export function preferred(path: string): string {
		return Platform.win ? path.replace(/\//g, "\\") : path
	}

	export function appPath(): string {
		return generic(electron.app.getAppPath())
	}

	export function userPath(): string {
		return generic(electron.app.getPath("userData"))
	}

	export function home(): string {
		return generic(electron.app.getPath("home"))
	}
}
