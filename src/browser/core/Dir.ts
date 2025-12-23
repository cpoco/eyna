import * as perf_hooks from "node:perf_hooks"

import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

import { Location } from "@/browser/core/Location"
import { Path } from "@/browser/core/Path"

export class Dir {
	static readonly HOME: string = "home"

	private lc: Location.Data = Location.Default
	private dp: number = 0
	private rg: RegExp | null = null

	get location(): Location.Data {
		return this.lc
	}

	change(frn: string | null) {
		this.lc = Location.parse(frn)
	}

	async list(
		dp: number,
		rg: RegExp | null,
		cb: (frn: string, st: Native.Attributes, ls: Native.Attributes[], e: number) => void,
	) {
		const location = this.lc

		_log(location.frn.split("\0"), { dp: dp, rg: rg })
		let _time = perf_hooks.performance.now()

		if (Location.isHome(location)) {
			this.dp = 0
			this.rg = null
			let st = [_attr(Native.FileType.HomeUser, Dir.HOME, Dir.HOME)]
			Native.getVolume().then(
				(vol: Native.Volume[]) => {
					_log(location.frn.split("\0"), "volume", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)
					let ls: Native.Attributes[] = []
					for (const v of vol) {
						ls.push([_attr(Native.FileType.Drive, v.full, v.name)])
					}
					ls.push([_attr(Native.FileType.HomeUser, Path.home(), "user")])
					cb(location.frn, st, ls, 0)
				},
			)
		}
		else if (Location.isFile(location)) {
			this.dp = dp
			this.rg = rg
			let st = await Native.getAttribute(location.path)
			Native.getDirectory(location.path, "", Native.Sort.DepthFirst, this.dp, this.rg).then(
				async (dir: Native.Directory) => {
					_log(location.frn.split("\0"), "directory", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`, {
						s: dir.s,
						d: dir.d,
						f: dir.f,
						e: dir.e,
						len: dir.list.length,
					})
					_time = perf_hooks.performance.now()

					const ls: Native.Attributes[] = []
					for (const attr of dir.list) {
						ls.push(await Native.getAttribute(attr.rltv, dir.full))
					}

					_log(location.frn.split("\0"), "attribute", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)
					_time = perf_hooks.performance.now()

					_sort(ls)

					_log(location.frn.split("\0"), "sort", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)

					cb(location.frn, st, ls, dir.e)
				},
			)
		}
		else if (Location.isArch(location)) {
			this.dp = 0
			this.rg = null
			let st = await Native.getAttribute(location.path)
			Native.getArchive(location.path, location.entry, this.dp).then(
				async (arc: Native.Archive) => {
					_log(location.frn.split("\0"), "archive", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`, {
						s: arc.s,
						d: arc.d,
						f: arc.f,
						e: arc.e,
						len: arc.list.length,
					})
					_time = perf_hooks.performance.now()

					const ls: Native.Attributes[] = []
					for (const attr of arc.list) {
						ls.push([attr])
					}

					_log(location.frn.split("\0"), "attribute", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)
					_time = perf_hooks.performance.now()

					_sort(ls)

					_log(location.frn.split("\0"), "sort", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)

					cb(location.frn, st, ls, arc.e)
				},
			)
		}
	}
}

function _log(...args: any) {
	console.log(`\u001b[36m[dir]\u001b[0m`, ...args)
}

function _attr(file_type: Native.FileType, full: string, name: string): Native.Attribute {
	return {
		file_type: file_type,
		full: full,
		base: "",
		rltv: name,
		name: name,
		stem: "",
		exte: "",
		link_type: Native.LinkType.None,
		link: "",
		size: 0n,
		time: 0,
		nsec: 0,
		readonly: false,
		hidden: false,
		system: false,
		cloud: false,
		entry: false,
	}
}

const GROUP_DIRECTORIES_FIRST = 1024

function _sort(ls: Native.Attributes[]) {
	ls.sort((a, b) => {
		let type = _type(a, b)
		if (type === GROUP_DIRECTORIES_FIRST) {
			return _name(a, b)
		}
		if (type === 0) {
			let ext = _ext(a, b)
			if (ext === 0) {
				return _name(a, b)
			}
			return ext
		}
		return type
	})
}

function _type(a: Native.Attributes, b: Native.Attributes): number {
	let aa = Util.last(a)?.file_type ?? Native.FileType.None
	let bb = Util.last(b)?.file_type ?? Native.FileType.None

	if (aa === Native.FileType.None) {
		aa = Native.FileType.File
	}
	if (bb === Native.FileType.None) {
		bb = Native.FileType.File
	}
	if (aa === Native.FileType.Directory && bb === Native.FileType.Directory) {
		return GROUP_DIRECTORIES_FIRST
	}

	return aa - bb
}

function _ext(a: Native.Attributes, b: Native.Attributes): number {
	let aa: string = a[0]?.exte.toLocaleLowerCase() ?? ""
	let bb: string = b[0]?.exte.toLocaleLowerCase() ?? ""
	return aa.localeCompare(bb)
}

function _name(a: Native.Attributes, b: Native.Attributes): number {
	let aa: string = a[0]?.rltv.toLocaleLowerCase() ?? ""
	let bb: string = b[0]?.rltv.toLocaleLowerCase() ?? ""
	let lc = aa.localeCompare(bb, undefined, { numeric: true })
	return lc === 0
		? aa.length - bb.length
		: lc
}
