import * as Bridge from "@/bridge/Bridge"
import { Dir } from "@/browser/core/Dir"
import { Scroll } from "@/browser/core/Scroll"
import root from "@/browser/Root"
import * as Native from "@eyna/native/ts/browser"
import * as Util from "@eyna/util/ts/Util"

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

	constructor(public readonly id: number, wd: string | null, status: Bridge.StatusValues = Bridge.Status.none) {
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

		let update = Date.now()

		this.data.update = update
		this.data.spinner = true

		Native.unwatch(this.id)

		root.send<Bridge.List.Change.Send>({
			ch: "filer-change",
			args: [
				this.id,
				{
					status: this.data.status,
					update: this.data.update,
					spinner: this.data.spinner,
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
			this.dir.list(dp, rg, (wd, ls, e) => {
				if (update != this.data.update) {
					resolve(false)
					return
				}

				this.data.spinner = false
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

				Native.watch(this.id, wd, (_id, depth, _abstract) => {
					if (update != this.data.update || dp < depth) {
						return
					}

					this.data.watch = 1
					root.send<Bridge.List.Watch.Send>({
						ch: "filer-watch",
						args: [
							this.id,
							{
								update: this.data.update,
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
			ch: "filer-scan",
			args: [
				this.id,
				{
					spinner: this.data.spinner,
					status: this.data.status,
					update: this.data.update,
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
			ch: "filer-status",
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
			ch: "filer-cursor",
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
			ch: "filer-attribute",
			args: [
				this.id,
				{
					update: this.data.update,
					_slice: Util.dict<Native.Attributes>(start, end, (i) => {
						return this.data.ls[i]
					}),
				},
			],
		})
	}

	sendMark(start: number = 0, end: number = this.data.length) {
		root.send<Bridge.List.Mark.Send>({
			ch: "filer-mark",
			args: [
				this.id,
				{
					update: this.data.update,
					_slice: Util.dict<boolean>(start, end, (i) => {
						return this.data.mk[i]
					}),
				},
			],
		})
	}
}
