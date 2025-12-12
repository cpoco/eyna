class generic {
	private _root: string = ""
	private _path: string[] = []

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

enum LocationType {
	Home = "home",
	Filesystem = "filesystem",
	Archive = "archive",
}

export type Location = {
	type: LocationType
	path: string
	entry: string
	anchor?: string
}

export namespace Location {
	export function parse(urn: string): Location {
		const block = urn.split("\0")
		switch (block.at(0)) {
			case LocationType.Home:
				return {
					type: LocationType.Home,
					path: "",
					entry: "",
				}
			case LocationType.Filesystem:
				return {
					type: LocationType.Filesystem,
					path: new generic(block.at(1) ?? "").full,
					entry: "",
				}
			case LocationType.Archive:
				return {
					type: LocationType.Archive,
					path: new generic(block.at(1) ?? "").full,
					entry: new generic(block.at(2) ?? "").full,
				}
		}
		throw new Error("invalid URN")
	}

	export function updir(location: Location): Location {
		switch (location.type) {
			case LocationType.Home:
				return location	

			case LocationType.Filesystem: {
				const path = new generic(location.path)
				return path.top
					? {
						type: LocationType.Home,
						path: "",
						entry: "",
						anchor: path.root,
					}
					: {
						type: LocationType.Filesystem,
						path: path.dirname,
						entry: "",
						anchor: path.basename
					}
			}

			case LocationType.Archive: {
				const path = new generic(location.path)
				const entry = new generic(location.entry)
				return entry.top
					? {
						type: LocationType.Filesystem,
						path: path.dirname,
						entry: "",
						anchor: path.basename
					}
					: {
						type: LocationType.Archive,
						path: location.path,
						entry: entry.dirname,
						anchor: entry.basename,
					}
			}
		}
	}
}
