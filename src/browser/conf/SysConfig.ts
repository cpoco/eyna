import { Abstract } from "@/browser/conf/Abstract"
import * as Util from "@eyna/util"
import { Path } from "../core/Path"

type FileFormat = {
	styleFontFamily: string
	styleFontSize: number
	styleLineHeight: number
	favorites: { name: string; path: string }[]
	[key: `extension.${string}`]: { win?: ExtensionCommand; mac?: ExtensionCommand }
}

export type ExtensionCommand = {
	command: string
	args: string[]
}

class Sys extends Abstract<FileFormat> {
	postLoad() {
		if (!Util.isString(this.data.styleFontFamily) || this.data.styleFontFamily.length === 0) {
			throw new Error("styleFontFamily must be non-empty string")
		}
		if (!Util.isNumber(this.data.styleFontSize) || this.data.styleFontSize <= 0) {
			throw new Error("styleFontSize must be positive")
		}
		if (!Util.isNumber(this.data.styleLineHeight) || this.data.styleLineHeight <= 0) {
			throw new Error("styleLineHeight must be positive")
		}
		if (!Util.isArray(this.data.favorites)) {
			throw new Error("favorites must be an array")
		}
		for (const f of this.data.favorites) {
			if (!Util.isString(f.name) || f.name.length === 0) {
				throw new Error("favorites.name must be non-empty string")
			}
			if (!Util.isString(f.path) || f.path.length === 0) {
				throw new Error("favorites.path must be non-empty string")
			}

			if (f.path === "~") {
				f.path = Path.home()
			}
			else if (f.path.startsWith("~/")) {
				f.path = Path.home(f.path.slice(2))
			}
		}
		for (const [name, conf] of Object.entries(this.data)) {
			if (!name.startsWith("extension.")) {
				continue
			}
			if (!Util.isDict(conf)) {
				throw new Error(`${name} must be an object`)
			}
			for (const os of ["win", "mac"] as const) {
				const c = conf[os]
				if (c === undefined) {
					continue
				}
				if (!Util.isDict(c)) {
					throw new Error(`${name}.${os} must be an object`)
				}
				if (!Util.isString(c.command) || c.command.length === 0) {
					throw new Error(`${name}.${os}.command must be non-empty string`)
				}
				if (!Util.isArray(c.args) || !c.args.every((a) => Util.isString(a))) {
					throw new Error(`${name}.${os}.args must be an array of string`)
				}

				if (c.command === "~") {
					c.command = Path.home()
				}
				else if (c.command.startsWith("~/")) {
					c.command = Path.home(c.command.slice(2))
				}
			}
		}
	}

	protected merge(base: FileFormat, layer: unknown) {
		if (!Util.isDict(layer)) {
			return
		}
		for (const [k, v] of Object.entries(layer)) {
			;(base as { [k: string]: unknown })[k] = v
		}
	}
}

export const SysConfig = new Sys()
