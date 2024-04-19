import * as electron from "electron"
import * as path from "node:path"
import * as url from "node:url"

import { Platform } from "@/browser/core/Platform"

export namespace Path {
	export function generic(p: string): string {
		return path.posix.normalize(p)
	}

	export function preferred(p: string): string {
		return Platform.win
			? path.win32.normalize(p)
			: path.posix.normalize(p)
	}

	export function app(): string {
		return generic(electron.app.getAppPath())
	}

	export function data(): string {
		return generic(electron.app.getPath("userData"))
	}

	export function home(): string {
		return generic(electron.app.getPath("home"))
	}

	export function toFileURL(path: string): string {
		return url.pathToFileURL(path).toString()
	}
}
