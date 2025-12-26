class generic {
	private readonly _root: string = ""
	private readonly _path: string[] = []

	constructor(path: string) {
		const m = path.match(/^([a-z]:\/|\/)/i)
		if (m) {
			this._root = m[1] ?? ""
		}
		const s = path.slice(this._root.length).replace(/\/+$/, "")
		if (0 < s.length) {
			this._path = s.split("/")
		}
	}

	get top(): boolean {
		return this._path.length === 0
	}

	get full(): string {
		return this._root + this._path.join("/")
	}

	get root(): string {
		return this._root
	}

	get dirname(): string {
		return this._root + this._path.slice(0, -1).join("/")
	}

	get basename(): string {
		return this._path.at(-1) ?? ""
	}
}

export namespace Location {
	export type FRN = string

	enum Type {
		Home = "home",
		File = "file",
		Arch = "arch",
	}

	type HomeData = {
		readonly frn: FRN
		readonly type: Type.Home
		readonly anchor?: string
	}

	type FileData = {
		readonly frn: FRN
		readonly type: Type.File
		readonly path: string
		readonly anchor?: string
	}

	type ArchData = {
		readonly frn: FRN
		readonly type: Type.Arch
		readonly path: string
		readonly entry: string
		readonly anchor?: string
	}

	export type Data = HomeData | FileData | ArchData

	export const Default: HomeData = {
		frn: Type.Home,
		type: Type.Home,
	}

	export function parse(frn: FRN | null): Data {
		if (frn === null) {
			return Default
		}
		const block = frn.split("\0")
		switch (block.at(0)) {
			case Type.Home:
				return {
					frn: frn,
					type: Type.Home,
				}
			case Type.File:
				return {
					frn: frn,
					type: Type.File,
					path: new generic(block.at(1) ?? "").full,
				}
			case Type.Arch:
				return {
					frn: frn,
					type: Type.Arch,
					path: new generic(block.at(1) ?? "").full,
					entry: new generic(block.at(2) ?? "").full,
				}
		}
		return Default
	}

	export function updir(frn: FRN | null): Data {
		const data = parse(frn)
		switch (data.type) {
			case Type.Home:
				return data

			case Type.File: {
				const path = new generic(data.path)
				return path.top
					? {
						frn: Type.Home,
						type: Type.Home,
						anchor: path.root,
					}
					: {
						frn: [Type.File, path.dirname].join("\0"),
						type: Type.File,
						path: path.dirname,
						anchor: path.basename,
					}
			}

			case Type.Arch: {
				const path = new generic(data.path)
				const entry = new generic(data.entry)
				return entry.top
					? {
						frn: [Type.File, path.dirname].join("\0"),
						type: Type.File,
						path: path.dirname,
						anchor: path.basename,
					}
					: {
						frn: [Type.Arch, data.path, entry.dirname].join("\0"),
						type: Type.Arch,
						path: data.path,
						entry: entry.dirname,
						anchor: entry.basename,
					}
			}
		}
	}

	export function isHome(data: Data): data is HomeData {
		return data.type === Type.Home
	}

	export function isFile(data: Data): data is FileData {
		return data.type === Type.File
	}

	export function isArch(data: Data): data is ArchData {
		return data.type === Type.Arch
	}

	export function toHome(): FRN {
		return Type.Home
	}

	export function toFile(path: string): FRN {
		return [Type.File, path].join("\0")
	}

	export function toArch(path: string, entry: string): FRN {
		return [Type.Arch, path, entry].join("\0")
	}

	export function toFileUrl(path: string): string {
		const file_path = path
			.replace(/%/g, "%25")
			.replace(/#/g, "%23")
			.replace(/\?/g, "%3F") 
		return `file://${file_path}?${new Date().getTime()}`
		// return `eyna://blob/${Type.File}/${encodeURIComponent(path)}?${new Date().getTime()}`
	}

	export function toArchUrl(path: string, entry: string): string {
		return `eyna://blob/${Type.Arch}/${encodeURIComponent(path)}/${encodeURIComponent(entry)}?${new Date().getTime()}`
	}
}
