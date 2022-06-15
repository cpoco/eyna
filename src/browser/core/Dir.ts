import * as path from "node:path"
import * as perf_hooks from "node:perf_hooks"

import { Path } from "@/browser/core/Path"
import * as Util from "@/util/Util"
import * as Native from "@eyna/native/ts/browser"

export class Dir {
	static readonly HOME: string = "home"

	private wd: string = Dir.HOME
	private dp: number = 0
	private rg: RegExp | null = null

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
		return ls[i]?.[0]?.rltv ?? null
	}

	static findIndex(ls: Native.Attributes[], rltv: string | null): number {
		if (rltv == null) {
			return 0
		}

		for (let i = 0; i < ls.length; i++) {
			if ((ls[i]?.[0]?.rltv ?? null) == rltv) {
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
				let ls: Native.Attributes[] = []
				vol.forEach((v) => {
					let attr: Native.Attributes = []
					attr.push({
						file_type: Native.AttributeFileType.drive,
						full: v.full,
						rltv: v.name,
						name: v.name,
						stem: "",
						ext: "",
						link_type: Native.AttributeLinkType.none,
						link: "",
						size: 0n,
						time: 0,
						nsec: 0,
						readonly: false,
						hidden: false,
						system: false,
					})
					ls.push(attr)
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
						size: 0n,
						time: 0,
						nsec: 0,
						readonly: false,
						hidden: false,
						system: false,
					})
					ls.push(attr)
				}
				cb(this.wd, ls, 0)
			})
		}
		else {
			this.dp = dp
			this.rg = rg
			console.log(this.wd, { dp: dp, rg: rg })
			let _time = perf_hooks.performance.now()
			Native.getDirectory(this.wd, "", false, this.dp, this.rg).then(async (dir: Native.Directory) => {
				console.log(dir.wd, "directory", `${perf_hooks.performance.now() - _time}ms`, { s: dir.s, d: dir.d, f: dir.f, e: dir.e, len: dir.ls.length })
				_time = perf_hooks.performance.now()

				let ls: Native.Attributes[] = []
				for (let absolute of dir.ls) {
					ls.push(await Native.getAttribute(absolute, dir.wd))
				}

				console.log(dir.wd, "attribute", `${perf_hooks.performance.now() - _time}ms`)
				_time = perf_hooks.performance.now()

				ls.sort((a, b) => {
					let type = _type(a, b)
					if (type == DIR_SORT) {
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

				console.log(dir.wd, "sort", `${perf_hooks.performance.now() - _time}ms`)

				cb(dir.wd, ls, dir.e)
			})
		}
	}
}

const DIR_SORT = 1024

function _type(a: Native.Attributes, b: Native.Attributes): number {
	let aa = Util.last(a)?.file_type ?? Native.AttributeFileType.none
	let bb = Util.last(b)?.file_type ?? Native.AttributeFileType.none

	if (aa == Native.AttributeFileType.none) {
		aa = Native.AttributeFileType.file
	}
	if (bb == Native.AttributeFileType.none) {
		bb = Native.AttributeFileType.file
	}
	if (aa == Native.AttributeFileType.directory && bb == Native.AttributeFileType.directory) {
		return DIR_SORT
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
	let lc = aa.localeCompare(bb, undefined, { numeric: true })
	if (lc == 0) {
		return aa.length - bb.length
	}
	return lc
}
