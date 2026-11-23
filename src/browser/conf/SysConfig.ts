import { Abstract } from "@/browser/conf/Abstract"
import * as Common from "@eyna/common"
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
		if (!Common.isString(this.data.styleFontFamily) || this.data.styleFontFamily.length === 0) {
			throw new Error("styleFontFamily must be non-empty string")
		}
		if (!Common.isNumber(this.data.styleFontSize) || this.data.styleFontSize <= 0) {
			throw new Error("styleFontSize must be positive")
		}
		if (!Common.isNumber(this.data.styleLineHeight) || this.data.styleLineHeight <= 0) {
			throw new Error("styleLineHeight must be positive")
		}
		if (!Common.isArray(this.data.favorites)) {
			throw new Error("favorites must be an array")
		}
		for (const f of this.data.favorites) {
			if (!Common.isString(f.name) || f.name.length === 0) {
				throw new Error("favorites.name must be non-empty string")
			}
			if (!Common.isString(f.path) || f.path.length === 0) {
				throw new Error("favorites.path must be non-empty string")
			}
			f.path = Path.expandHome(f.path)
		}
		for (const [name, conf] of Object.entries(this.data)) {
			if (!name.startsWith("extension.")) {
				continue
			}
			if (!Common.isDict(conf)) {
				throw new Error(`${name} must be an object`)
			}
			for (const os of ["win", "mac"] as const) {
				const c = conf[os]
				if (c === undefined) {
					continue
				}
				if (!Common.isDict(c)) {
					throw new Error(`${name}.${os} must be an object`)
				}
				if (!Common.isString(c.command) || c.command.length === 0) {
					throw new Error(`${name}.${os}.command must be non-empty string`)
				}
				if (!Common.isArray(c.args) || !c.args.every((a) => Common.isString(a))) {
					throw new Error(`${name}.${os}.args must be an array of string`)
				}
				c.command = Path.expandHome(c.command)
			}
		}
	}

	protected merge(base: FileFormat, layer: unknown) {
		if (!Common.isDict(layer)) {
			return
		}
		for (const [k, v] of Object.entries(layer)) {
			;(base as { [k: string]: unknown })[k] = v
		}
	}
}

export const SysConfig = new Sys()
