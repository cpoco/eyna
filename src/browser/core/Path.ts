import * as electron from "electron"
import * as path from "node:path"
import * as url from "node:url"

import { Platform } from "@/browser/core/Platform"

export namespace Path {
	export function generic(p: string): string {
		return Platform.win ? p.replace(/\\/g, "/") : p
	}

	export function preferred(p: string): string {
		return Platform.win ? p.replace(/\//g, "\\") : p
	}

	export function app(...paths: string[]): string {
		return generic(path.join(electron.app.getAppPath(), ...paths))
	}

	export function data(...paths: string[]): string {
		return generic(path.join(electron.app.getPath("userData"), ...paths))
	}

	export function home(...paths: string[]): string {
		return generic(path.join(electron.app.getPath("home"), ...paths))
	}

	export function toFileURL(path: string): string {
		return url.pathToFileURL(path).toString()
	}
}
