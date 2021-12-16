import * as _ from "lodash-es"
import * as path from "path"

import { Path } from "@browser/core/Path"
import * as Native from "@module/native/ts/browser"

export class Dir {
	static readonly HOME: string = "home"

	private wd: string = Dir.HOME
	private dp: number = 0
	private rg: RegExp | null = null
	private ls: Native.Attributes[] = []

	get pwd(): string {
		return this.wd
	}

	static dirname(wd: string): string {
		if (wd == Dir.HOME || Dir.isRoot(wd)) {
			return Dir.HOME
		}
		else {
			return path.dirname(wd)
		}
	}

	static basename(wd: string): string {
		return this.isRoot(wd) ? wd : path.parse(wd).base
	}

	static findRltv(ls: Native.Attributes[], i: number): string | null {
		return _.get(ls, [i, 0, Native.AttributeKey.rltv], null)
	}

	static findIndex(ls: Native.Attributes[], rltv: string | null): number {
		if (rltv == null) {
			return 0
		}

		for (let i = 0; i < ls.length; i++) {
			if (_.get(ls, [i, 0, Native.AttributeKey.rltv], null) == rltv) {
				return i
			}
		}

		return 0
	}

	private static isRoot(wd: string): boolean {
		return path.isAbsolute(wd) && path.parse(wd).root == wd
	}

	cd(wd: string | null) {
		if (wd == Dir.HOME || wd == null) {
			this.wd = Dir.HOME
		}
		else {
			wd = path.posix.normalize(wd)
			if (path.isAbsolute(wd)) {
				this.wd = wd
			}
		}
	}

	list(dp: number, rg: RegExp | null, cb: (wd: string, ls: Native.Attributes[], e: number) => void) {
		if (this.wd == Dir.HOME) {
			this.dp = 0
			this.rg = null
			Native.getVolume().then((vol: Native.Volume[]) => {
				this.ls = []
				vol.forEach((v) => {
					let attr: Native.Attributes = []
					attr.push({
						file_type: Native.AttributeFileType.home,
						full: v.full,
						rltv: v.name,
						name: v.name,
						stem: "",
						ext: "",
						link_type: Native.AttributeLinkType.none,
						link: "",
						size: 0,
						time: 0,
						nsec: 0,
						readonly: false,
						hidden: false,
						system: false,
					})
					this.ls.push(attr)
				})
				{
					let attr: Native.Attributes = []
					attr.push({
						file_type: Native.AttributeFileType.homeuser,
						full: Path.home(),
						rltv: "user",
						name: "user",
						stem: "",
						ext: "",
						link_type: Native.AttributeLinkType.none,
						link: "",
						size: 0,
						time: 0,
						nsec: 0,
						readonly: false,
						hidden: false,
						system: false,
					})
					this.ls.push(attr)
				}
				cb(this.wd, this.ls, 0)
			})
		}
		else {
			let _time = Date.now()
			this.dp = dp
			this.rg = rg
			Native.getDirectory(this.wd, "", false, this.dp, this.rg).then(async (dir: Native.Directory) => {
				console.log(this.wd, this.dp, this.rg, dir.e)
				console.log(this.wd, "Native.getDirectory", `${Date.now() - _time}ms`)
				_time = Date.now()

				this.ls = []
				for (let absolute of dir.ls) {
					this.ls.push(await Native.getAttribute(absolute, this.wd))
				}

				console.log(this.wd, "Native.getAttribute", `${Date.now() - _time}ms`)
				_time = Date.now()

				this.ls.sort((a, b) => {
					let type = _type(a, b)
					if (type == 1024) {
						return _name(a, b)
					}
					if (type == 0) {
						let ext = _ext(a, b)
						if (ext == 0) {
							return _name(a, b)
						}
						return ext
					}
					return type
				})

				console.log(this.wd, "sort", `${Date.now() - _time}ms`)

				cb(this.wd, this.ls, dir.e)
			})
		}
	}
}

function _type(a: Native.Attributes, b: Native.Attributes): number {
	let aa = _.last(a)?.file_type ?? Native.AttributeFileType.none
	let bb = _.last(b)?.file_type ?? Native.AttributeFileType.none

	if (aa == Native.AttributeFileType.none) {
		aa = Native.AttributeFileType.file
	}
	if (bb == Native.AttributeFileType.none) {
		bb = Native.AttributeFileType.file
	}
	if (aa == Native.AttributeFileType.directory && bb == Native.AttributeFileType.directory) {
		return 1024
	}

	return aa - bb
}

function _ext(a: Native.Attributes, b: Native.Attributes): number {
	let aa: string = a[0]?.ext.toLocaleLowerCase() ?? ""
	let bb: string = b[0]?.ext.toLocaleLowerCase() ?? ""
	return aa.localeCompare(bb)
}

function _name(a: Native.Attributes, b: Native.Attributes): number {
	let aa: string = a[0]?.rltv.toLocaleLowerCase() ?? ""
	let bb: string = b[0]?.rltv.toLocaleLowerCase() ?? ""
	return aa.localeCompare(bb, undefined, { numeric: true })
}
