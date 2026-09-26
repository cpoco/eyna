import * as perf_hooks from "node:perf_hooks"

import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

import { SysConfig } from "@/browser/conf/SysConfig"
import { Location } from "@/browser/core/Location"

type ListResolve = {
	frn: string
	git: string
	st: Native.Attributes
	ls: Native.Attributes[]
	e: number
}

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
	): Promise<ListResolve> {
		const deferred = new Util.DeferredPromise<ListResolve>()

		const location = this.lc

		_log(location.frn.split("\0"), { dp: dp, rg: rg })
		let _time = perf_hooks.performance.now()

		if (Location.isHome(location)) {
			this.dp = 0
			this.rg = null
			const st = [_attr(Native.FileType.Favorite, Dir.HOME, Dir.HOME)]
			const vol = await Native.getVolume()
			_log(location.frn.split("\0"), "volume", `${(perf_hooks.performance.now() - _time).toFixed(3)}ms`)
			const ls: Native.Attributes[] = []
			for (const v of vol) {
				ls.push([_attr(Native.FileType.Drive, v.full, v.name)])
			}
			for (const f of SysConfig.data.favorites) {
				ls.push([_attr(Native.FileType.Favorite, f.path, f.name)])
			}

			deferred.resolve({
				frn: location.frn,
				git: "",
				st: st,
				ls: ls,
				e: 0,
			})
		}
		else if (Location.isFile(location)) {
			this.dp = dp
			this.rg = rg
			const st = await Native.getAttribute(location.path)
			const dir = await Native.getDirectory(location.path, "", Native.Sort.DepthFirst, this.dp, this.rg)
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

			deferred.resolve({
				frn: location.frn,
				git: dir.x?.git_brch ?? "",
				st: st,
				ls: ls,
				e: dir.e,
			})
		}
		else if (Location.isArch(location)) {
			this.dp = 0
			this.rg = null
			const st = await Native.getAttribute(location.path)
			const arc = await Native.getArchive(location.path, location.entry, this.dp)
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

			deferred.resolve({
				frn: location.frn,
				git: "",
				st: st,
				ls: ls,
				e: arc.e + (arc.henc ? 1 : 0),
			})
		}

		return deferred.promise
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
		ctime: 0n,
		mtime: 0n,
	}
}

const GROUP_DIRECTORIES_FIRST = 1024

function _sort(ls: Native.Attributes[]) {
	ls.sort((a, b) => {
		const type = _type(a, b)
		if (type === GROUP_DIRECTORIES_FIRST) {
			return _name(a, b)
		}
		if (type === 0) {
			const ext = _ext(a, b)
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
	const aa: string = a[0]?.exte.toLocaleLowerCase() ?? ""
	const bb: string = b[0]?.exte.toLocaleLowerCase() ?? ""
	return aa.localeCompare(bb)
}

function _name(a: Native.Attributes, b: Native.Attributes): number {
	const aa: string = a[0]?.rltv.toLocaleLowerCase() ?? ""
	const bb: string = b[0]?.rltv.toLocaleLowerCase() ?? ""
	const lc = aa.localeCompare(bb, undefined, { numeric: true })
	return lc === 0
		? aa.length - bb.length
		: lc
}
