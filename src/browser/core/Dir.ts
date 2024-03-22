import * as path from "node:path"
import * as perf_hooks from "node:perf_hooks"

import * as Native from "@eyna/native/ts/browser"
import * as Util from "@eyna/util"

import { Path } from "@/browser/core/Path"

export class Dir {
	static readonly HOME: string = "home"

	private wd: string = Dir.HOME
	private dp: number = 0
	private rg: RegExp | null = null

	get pwd(): string {
		return this.wd
	}

	get isHome(): boolean {
		return this.wd == Dir.HOME
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

	async list(
		dp: number,
		rg: RegExp | null,
		cb: (wd: string, st: Native.Attributes, ls: Native.Attributes[], e: number) => void,
	) {
		if (this.wd == Dir.HOME) {
			this.dp = 0
			this.rg = null
			let _time = perf_hooks.performance.now()
			let st = [{
				file_type: Native.AttributeFileType.HomeUser,
				full: Dir.HOME,
				base: "",
				rltv: Dir.HOME,
				name: Dir.HOME,
				stem: "",
				ext: "",
				link_type: Native.AttributeLinkType.None,
				link: "",
				size: 0n,
				time: 0,
				nsec: 0,
				readonly: false,
				hidden: false,
				system: false,
				pseudo: false,
			}]
			Native.getVolume().then((vol: Native.Volume[]) => {
				console.log(`\u001b[36m[dir]\u001b[0m`, "volume", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)
				let ls: Native.Attributes[] = []
				vol.forEach((v) => {
					ls.push([{
						file_type: Native.AttributeFileType.Drive,
						full: v.full,
						base: "",
						rltv: v.name,
						name: v.name,
						stem: "",
						ext: "",
						link_type: Native.AttributeLinkType.None,
						link: "",
						size: 0n,
						time: 0,
						nsec: 0,
						readonly: false,
						hidden: false,
						system: false,
						pseudo: false,
					}])
				})
				ls.push([{
					file_type: Native.AttributeFileType.HomeUser,
					full: Path.home(),
					base: "",
					rltv: "user",
					name: "user",
					stem: "",
					ext: "",
					link_type: Native.AttributeLinkType.None,
					link: "",
					size: 0n,
					time: 0,
					nsec: 0,
					readonly: false,
					hidden: false,
					system: false,
					pseudo: false,
				}])
				cb(this.wd, st, ls, 0)
			})
		}
		else {
			this.dp = dp
			this.rg = rg
			console.log(`\u001b[36m[dir]\u001b[0m`, `"${this.wd}"`, { dp: dp, rg: rg })
			let _time = perf_hooks.performance.now()
			let st = await Native.getAttribute(this.wd)
			Native.getDirectory(this.wd, "", false, this.dp, this.rg).then(async (dir: Native.Directory) => {
				console.log(
					`\u001b[36m[dir]\u001b[0m`,
					`"${dir.full}"`,
					"directory",
					`${(perf_hooks.performance.now() - _time).toFixed(3)}ms`,
					{
						s: dir.s,
						d: dir.d,
						f: dir.f,
						e: dir.e,
						len: dir.list.length,
					},
				)
				_time = perf_hooks.performance.now()

				let ls: Native.Attributes[] = []
				for (let attr of dir.list) {
					ls.push(await Native.getAttribute(attr.rltv, dir.full))
				}

				console.log(
					`\u001b[36m[dir]\u001b[0m`,
					`"${dir.full}"`,
					"attribute",
					`${(perf_hooks.performance.now() - _time).toFixed(3)}ms`,
				)
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

				console.log(
					`\u001b[36m[dir]\u001b[0m`,
					`"${dir.full}"`,
					"sort",
					`${(perf_hooks.performance.now() - _time).toFixed(3)}ms`,
				)

				cb(dir.full, st, ls, dir.e)
			})
		}
	}
}

const DIR_SORT = 1024

function _type(a: Native.Attributes, b: Native.Attributes): number {
	let aa = Util.last(a)?.file_type ?? Native.AttributeFileType.None
	let bb = Util.last(b)?.file_type ?? Native.AttributeFileType.None

	if (aa == Native.AttributeFileType.None) {
		aa = Native.AttributeFileType.File
	}
	if (bb == Native.AttributeFileType.None) {
		bb = Native.AttributeFileType.File
	}
	if (aa == Native.AttributeFileType.Directory && bb == Native.AttributeFileType.Directory) {
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
