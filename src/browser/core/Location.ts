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
		return this._path.length == 0
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
	export enum Type {
		Home = "home",
		Filesystem = "filesystem",
		Archive = "archive",
	}

	export type Data = {
		readonly frn: string
		readonly type: Type.Home
		readonly anchor?: string
	} | {
		readonly frn: string
		readonly type: Type.Filesystem
		readonly path: string
		readonly anchor?: string
	} | {
		readonly frn: string
		readonly type: Type.Archive
		readonly path: string
		readonly entry: string
		readonly anchor?: string
	}

	export const Default: Data = {
		frn: Type.Home,
		type: Type.Home,
	}

	export function home(): string {
		return Type.Home
	}

	export function fs(path: string): string {
		return [Type.Filesystem, path].join("\0")
	}

	export function parse(frn: string | null): Data {
		if (frn == null) {
			return Default
		}
		const block = frn.split("\0")
		switch (block.at(0)) {
			case Type.Home:
				return {
					frn: frn,
					type: Type.Home,
				}
			case Type.Filesystem:
				return {
					frn: frn,
					type: Type.Filesystem,
					path: new generic(block.at(1) ?? "").full,
				}
			case Type.Archive:
				return {
					frn: frn,
					type: Type.Archive,
					path: new generic(block.at(1) ?? "").full,
					entry: new generic(block.at(2) ?? "").full,
				}
		}
		throw new Error("invalid URN")
	}

	export function updir(frn: string | null): Data {
		const data = parse(frn)
		switch (data.type) {
			case Type.Home:
				return data

			case Type.Filesystem: {
				const path = new generic(data.path)
				return path.top
					? {
						frn: Type.Home,
						type: Type.Home,
						anchor: path.root,
					}
					: {
						frn: [Type.Filesystem, path.dirname].join("\0"),
						type: Type.Filesystem,
						path: path.dirname,
						anchor: path.basename,
					}
			}

			case Type.Archive: {
				const path = new generic(data.path)
				const entry = new generic(data.entry)
				return entry.top
					? {
						frn: [Type.Filesystem, data.path].join("\0"),
						type: Type.Filesystem,
						path: path.dirname,
						anchor: path.basename,
					}
					: {
						frn: [Type.Archive, data.path, entry.dirname].join("\0"),
						type: Type.Archive,
						path: data.path,
						entry: entry.dirname,
						anchor: entry.basename,
					}
			}
		}
	}
}
