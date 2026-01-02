import * as perf_hooks from "node:perf_hooks"
import * as timers from "node:timers/promises"

import * as Bridge from "@/bridge/Bridge"
import { Dir } from "@/browser/core/Dir"
import { Location } from "@/browser/core/Location"
import { Scroll } from "@/browser/core/Scroll"
import root from "@/browser/Root"
import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

export class FilerManager {
	readonly data: Bridge.List.Data = Bridge.List.InitData()

	private readonly dir: Dir = new Dir()
	private readonly sc: Scroll = new Scroll()
	private readonly mk: Set<string> = new Set()
	private readonly history: Map<string, string> = new Map()

	private watch_run: boolean = false
	private readonly watch_queue: string[] = []

	// 画面高さに対してのカーソル移動数
	get mv() {
		return Math.max(1, Math.floor(this.sc.screenSize / this.sc.contentsSize) - 1)
	}

	get location(): Location.Data {
		return this.dir.location
	}

	constructor(public readonly id: number, frn: string | null, status: Bridge.Status = Bridge.Status.None) {
		this.dir.change(frn)
		this.mk.clear()
		this.data.status = status
	}

	async run(): Promise<void> {
		this.watch_run = true
		while (this.watch_run) {
			if (this.watch_queue.length === 0) {
				await timers.setTimeout(100)
				continue
			}
			if (this.data.frn !== this.watch_queue.shift()) {
				continue
			}

			if (this.data.elapse <= 100 && this.data.ls.length <= 100) {
				await this.update(false)
			}
			else {
				this.data.watch = 1
				root.send(Bridge.List.Watch.CH, this.id, { watch: this.data.watch })
			}
		}
	}

	exit() {
		this.watch_run = false
		Native.unwatch(this.id)
	}

	mounted(screenSize: number, contentsSize: number): Promise<void> {
		this.sc.screenSize = screenSize
		this.sc.contentsSize = contentsSize
		this.sc.contentsCount = 0

		return this.update(false)
	}

	resized(h: number) {
		if (this.sc.screenSize !== h) {
			this.sc.screenSize = h
			this.scroll()
			this.sendCursor()
		}
	}

	cursorUp(mv: number = 1) {
		this.data.cursor = Math.max(this.data.cursor - mv, 0)
	}

	cursorDown(mv: number = 1) {
		this.data.cursor = Math.min(this.data.cursor + mv, this.data.ls.length - 1)
	}

	markToggle() {
		this.data.mk[this.data.cursor] = !this.data.mk[this.data.cursor]

		const attr = Util.first(this.data.ls[this.data.cursor])
		if (attr) {
			if (this.data.mk[this.data.cursor]) {
				this.mk.add(attr.rltv)
			}
			else {
				this.mk.delete(attr.rltv)
			}
		}
	}

	markAll(mk: boolean) {
		this.data.mk.fill(mk)

		if (mk) {
			for (const attrs of this.data.ls) {
				const attr = Util.first(attrs)
				if (attr) {
					this.mk.add(attr.rltv)
				}
			}
		}
		else {
			this.mk.clear()
		}
	}

	update(forceMarkClear: boolean): Promise<void> {
		return new Promise(async (resolve, _reject) => {
			if (await this.sendChange(this.location.frn, 0, null, this.data.cursor, forceMarkClear)) {
				this.scroll()
				this.sendScan()
				this.sendAttrAll()
				this.sendMarkAll()
			}
			resolve()
		})
	}

	scroll() {
		const contPos = this.sc.contentsSize * this.data.cursor
		const drawPos = contPos - this.sc.contentsPosition
		const margin = Math.min(this.sc.contentsSize, (this.sc.screenSize - this.sc.contentsSize) / 2) // スクロール時に選択位置が端でない限りマージンを設ける
		const min = margin
		const max = this.sc.screenSize - this.sc.contentsSize - margin

		// 移動後の選択位置がスクロール外になる場合はスクロールして位置調整
		if (drawPos < min) {
			this.sc.contentsPosition = contPos - min
		}
		else if (max < drawPos) {
			this.sc.contentsPosition = contPos - max
		}

		this.sc.contentsCount = this.data.length
		this.sc.update()
	}

	private updateHistory() {
		const rltv = this.data.ls[this.data.cursor]?.[0]?.rltv ?? null
		if (rltv) {
			this.history.set(this.data.frn, rltv)
		}
	}

	private resolveCursor(frn: string, ls: Native.Attributes[], cursor: number | string | null): number {
		if (Util.isNumber(cursor)) {
			return Math.max(0, Math.min(cursor, Math.max(0, ls.length - 1)))
		}

		const rltv = cursor ?? this.history.get(frn) ?? null
		for (const [i, attr] of ls.entries()) {
			if (attr[0]?.rltv === rltv) {
				return i
			}
		}

		return 0
	}

	private sendTitle(forceLocation: boolean = false) {
		if (this.data.status !== Bridge.Status.Active) {
			return
		}

		const selected = forceLocation
			? null
			: this.data.ls[this.data.cursor]?.[0]?.full ?? null

		if (selected !== null) {
			root.send(
				Bridge.List.Title.CH,
				this.id,
				{
					title: selected,
					err: false,
				},
			)
		}
		else if (Location.isHome(this.location)) {
			root.send(
				Bridge.List.Title.CH,
				this.id,
				{
					title: this.location.type,
					err: false,
				},
			)
		}
		else if (Location.isFile(this.location)) {
			root.send(
				Bridge.List.Title.CH,
				this.id,
				{
					title: this.location.path,
					err: this.data.st[0]?.file_type === Native.FileType.None,
				},
			)
		}
	}

	sendChange(
		frn: string,
		dp: number,
		rg: RegExp | null,
		cursor: number | string | null,
		forceMarkClear: boolean,
	): Promise<boolean> {
		this.updateHistory()

		const next = Location.parse(frn)

		const create = perf_hooks.performance.now()

		this.data.create = create
		this.data.elapse = 0
		this.data.search = true

		Native.unwatch(this.id)
		if (Location.isFile(next)) {
			Native.watch(this.id, next.path, (_id, depth, _abstract) => {
				if (create !== this.data.create || dp < depth) {
					return
				}
				if (this.watch_queue.length === 0 || this.watch_queue[this.watch_queue.length - 1] !== next.frn) {
					this.watch_queue.push(next.frn)
				}
			})
		}

		this.sendTitle(true)
		root.send(
			Bridge.List.Change.CH,
			this.id,
			{
				create: this.data.create,
				elapse: this.data.elapse,
				status: this.data.status,
				search: this.data.search,
				cursor: 0,
				length: 0,
				frn: next.frn,
				st: [],
				ls: [],
				mk: [],
				drawCount: 0,
				drawIndex: 0,
				drawPosition: 0,
				drawSize: this.sc.contentsSize,
				knobPosition: 0,
				knobSize: 0,
				watch: 0,
				error: 0,
			},
		)

		return new Promise(async (resolve, _reject) => {
			if (this.dir.location.frn !== frn || forceMarkClear) {
				this.mk.clear()
			}
			this.dir.change(frn)
			await this.dir.list(dp, rg, async (frn, st, ls, e) => {
				if (create !== this.data.create) {
					resolve(false)
					return
				}

				this.data.elapse = perf_hooks.performance.now() - this.data.create
				this.data.search = false
				this.data.cursor = this.resolveCursor(frn, ls, cursor)
				this.data.length = ls.length
				this.data.frn = frn
				this.data.st = st
				this.data.ls = ls
				this.data.mk = Util.array(0, ls.length, (i) => {
					const attr = Util.first(ls[i])
					return attr ? this.mk.has(attr.rltv) : false
				})
				this.data.watch = 0
				this.data.error = e

				resolve(true)
			})
		})
	}

	sendScan() {
		this.sendTitle()
		root.send(
			Bridge.List.Scan.CH,
			this.id,
			{
				create: this.data.create,
				elapse: this.data.elapse,
				status: this.data.status,
				search: this.data.search,
				cursor: this.data.cursor,
				length: this.data.length,
				frn: this.data.frn,
				st: this.data.st,
				ls: [],
				mk: [],
				drawCount: Math.min(this.sc.drawCount(), this.data.length),
				drawIndex: this.sc.drawIndex(0),
				drawPosition: this.sc.drawPosition(0),
				drawSize: this.sc.contentsSize,
				knobPosition: this.sc.knobPosition,
				knobSize: this.sc.knobSize,
				watch: this.data.watch,
				error: this.data.error,
			},
		)
	}

	sendActive() {
		this.sendTitle()
		root.send(Bridge.List.Active.CH, this.id, { status: this.data.status })
	}

	sendCursor() {
		this.sendTitle()
		root.send(
			Bridge.List.Cursor.CH,
			this.id,
			{
				cursor: this.data.cursor,
				drawCount: Math.min(this.sc.drawCount(), this.data.length),
				drawIndex: this.sc.drawIndex(0),
				drawPosition: this.sc.drawPosition(0),
				drawSize: this.sc.contentsSize,
				knobPosition: this.sc.knobPosition,
				knobSize: this.sc.knobSize,
			},
		)
	}

	sendAttrAll() {
		for (let i = 0; i < this.data.length; i += 1000) {
			this.sendAttr(i, Math.min(i + 1000, this.data.length))
		}
	}

	sendAttr(start: number = 0, end: number = this.data.length) {
		root.send(
			Bridge.List.Attribute.CH,
			this.id,
			{
				_slice: Util.dict<Native.Attributes>(start, end, (i) => {
					return this.data.ls[i]
				}),
			},
		)
	}

	sendMarkAll() {
		for (let i = 0; i < this.data.length; i += 1000) {
			this.sendMark(i, Math.min(i + 1000, this.data.length))
		}
	}

	sendMark(start: number = 0, end: number = this.data.length) {
		root.send(
			Bridge.List.Mark.CH,
			this.id,
			{
				_slice: Util.dict<boolean>(start, end, (i) => {
					return this.data.mk[i]
				}),
			},
		)
	}
}
