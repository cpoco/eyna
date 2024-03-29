import * as perf_hooks from "node:perf_hooks"

import * as Bridge from "@/bridge/Bridge"
import { Dir } from "@/browser/core/Dir"
import { Scroll } from "@/browser/core/Scroll"
import root from "@/browser/Root"
import * as Native from "@eyna/native/ts/browser"
import * as Util from "@eyna/util"

export class FilerManager {
	data: Bridge.List.Data = Bridge.List.InitData()

	private dir: Dir = new Dir()
	private sc: Scroll = new Scroll()
	private history: { [abstract: string]: string | null } = {}

	// 画面高さに対してのカーソル移動数
	get mv() {
		return Math.max(1, Math.floor(this.sc.screenSize / this.sc.contentsSize) - 1)
	}

	get pwd(): string {
		return this.dir.pwd
	}

	get isHome(): boolean {
		return this.dir.isHome
	}

	constructor(public readonly id: number, wd: string | null, status: Bridge.Status = Bridge.Status.none) {
		this.dir.cd(wd)
		this.data.status = status
	}

	mounted(screenSize: number, contentsSize: number): Promise<void> {
		this.sc.screenSize = screenSize
		this.sc.contentsSize = contentsSize
		this.sc.contentsCount = 0

		return this.update()
	}

	resized(h: number) {
		if (this.sc.screenSize != h) {
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

	update(): Promise<void> {
		return new Promise(async (resolve, _reject) => {
			if (await this.sendChange(this.pwd, 0, null, this.data.cursor)) {
				this.scroll()
				this.sendScan()
				this.sendAttribute()
			}
			resolve()
		})
	}

	scroll() {
		let contPos = this.sc.contentsSize * this.data.cursor
		let drawPos = contPos - this.sc.contentsPosition
		let margin = Math.min(this.sc.contentsSize, (this.sc.screenSize - this.sc.contentsSize) / 2) // スクロール時に選択位置が端でない限りマージンを設ける
		let min = margin
		let max = this.sc.screenSize - this.sc.contentsSize - margin

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

	sendChange(wd: string, dp: number, rg: RegExp | null, cursor: number | string | null): Promise<boolean> {
		let history = Dir.findRltv(this.data.ls, this.data.cursor)
		if (history) {
			this.history[this.data.wd] = history
		}

		if (wd == Dir.HOME) {
			cursor = this.history[Dir.HOME] ?? null
		}

		let create = perf_hooks.performance.now()

		this.data.create = create
		this.data.elapse = 0
		this.data.search = true

		Native.unwatch(this.id)

		root.send<Bridge.List.Change.Send>({
			ch: Bridge.List.Change.CH,
			args: [
				this.id,
				{
					create: this.data.create,
					elapse: this.data.elapse,
					status: this.data.status,
					search: this.data.search,
					cursor: 0,
					length: 0,
					wd: wd,
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
			],
		})

		return new Promise((resolve, _reject) => {
			this.dir.cd(wd)
			this.dir.list(dp, rg, async (wd, ls, e) => {
				if (create != this.data.create) {
					resolve(false)
					return
				}

				this.data.elapse = perf_hooks.performance.now() - this.data.create
				this.data.search = false
				this.data.cursor = Util.isNumber(cursor)
					? Math.max(0, Math.min(cursor, ls.length - 1))
					: Dir.findIndex(ls, cursor ?? this.history[wd] ?? null)
				this.data.length = ls.length
				this.data.wd = wd
				this.data.ls = ls
				this.data.mk = Util.array(0, ls.length, () => false)
				this.data.watch = 0
				this.data.error = e

				resolve(true)

				if (wd == Dir.HOME) {
					return
				}

				await Util.SleepPromise(10)

				Native.watch(this.id, wd, (_id, depth, _abstract) => {
					if (create != this.data.create || dp < depth) {
						return
					}

					this.data.watch = 1
					root.send<Bridge.List.Watch.Send>({
						ch: Bridge.List.Watch.CH,
						args: [
							this.id,
							{
								watch: this.data.watch,
							},
						],
					})
				})
			})
		})
	}

	sendScan() {
		root.send<Bridge.List.Scan.Send>({
			ch: Bridge.List.Scan.CH,
			args: [
				this.id,
				{
					create: this.data.create,
					elapse: this.data.elapse,
					status: this.data.status,
					search: this.data.search,
					cursor: this.data.cursor,
					length: this.data.length,
					wd: this.data.wd,
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
			],
		})
	}

	sendActive() {
		root.send<Bridge.List.Active.Send>({
			ch: Bridge.List.Active.CH,
			args: [
				this.id,
				{
					status: this.data.status,
				},
			],
		})
	}

	sendCursor() {
		root.send<Bridge.List.Cursor.Send>({
			ch: Bridge.List.Cursor.CH,
			args: [
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
			],
		})
	}

	sendAttribute() {
		for (let i = 0; i < this.data.length; i += 1000) {
			this._sendAttribute(i, Math.min(i + 1000, this.data.length))
		}
	}

	_sendAttribute(start: number = 0, end: number = this.data.length) {
		root.send<Bridge.List.Attribute.Send>({
			ch: Bridge.List.Attribute.CH,
			args: [
				this.id,
				{
					_slice: Util.dict<Native.Attributes>(start, end, (i) => {
						return this.data.ls[i]
					}),
				},
			],
		})
	}

	sendMark(start: number = 0, end: number = this.data.length) {
		root.send<Bridge.List.Mark.Send>({
			ch: Bridge.List.Mark.CH,
			args: [
				this.id,
				{
					_slice: Util.dict<boolean>(start, end, (i) => {
						return this.data.mk[i]
					}),
				},
			],
		})
	}
}
