import * as _ from "lodash-es"

import * as Bridge from "@bridge/Bridge"
import { Dir } from "@browser/core/Dir"
import { Scroll } from "@browser/core/Scroll"
import root from "@browser/Root"

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

	constructor(public id: number, wd: string | null, status: Bridge.Status = Bridge.Status.none) {
		this.dir.cd(wd)
		this.dir.list(0, null, (wd, ls, e) => {
			this.data.update = Date.now()
			this.data.status = status
			this.data.length = ls.length
			this.data.wd = wd
			this.data.ls = ls
			this.data.mk = _.map<number, boolean>(_.range(ls.length), () => false)
			this.data.error = e
		})
	}

	mounted(screenSize: number, contentsSize: number) {
		this.sc.screenSize = screenSize
		this.sc.contentsSize = contentsSize
		this.sc.contentsCount = 0
		this.scroll()
		this.sendScan()
		this.sendAttribute()
	}

	resized(h: number) {
		if (this.sc.screenSize != h) {
			this.sc.screenSize = h
			this.scroll()
			this.sendCursor()
		}
	}

	update(): Promise<void> {
		return new Promise((resolve, _reject) => {
			let wd = this.pwd
			this.sendChange(wd)
			this.change(wd, 0, null, this.data.cursor, () => {
				this.scroll()
				this.sendScan()
				this.sendAttribute()
				resolve()
			})
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

	change(cd: string, dp: number, rg: RegExp | null, cursor: number | string | null, cb: () => void) {
		_.unset(this.history, this.data.wd)
		_.assign(this.history, { [this.data.wd]: Dir.findRltv(this.data.ls, this.data.cursor) })
		this.dir.cd(cd)
		this.dir.list(dp, rg, (wd, ls, e) => {
			this.data.update = Date.now()
			this.data.cursor = _.isNumber(cursor)
				? Math.max(0, Math.min(cursor, ls.length - 1))
				: Dir.findIndex(ls, cursor ?? this.history[wd] ?? null)
			this.data.length = ls.length
			this.data.wd = wd
			this.data.ls = ls
			this.data.mk = _.map<number, boolean>(_.range(ls.length), () => false)
			this.data.error = e
			cb()
		})
	}

	sendChange(wd: string) {
		root.send<Bridge.List.Change.Send>({
			ch: "filer-change",
			args: [
				this.id,
				{
					status: this.data.status,
					update: 0,
					cursor: 0,
					length: -1, // スピナー表示
					wd: wd,
					ls: [],
					mk: [],
					drawCount: 0,
					drawIndex: 0,
					drawPosition: 0,
					drawSize: this.sc.contentsSize,
					knobPosition: 0,
					knobSize: 0,
					error: 0,
				},
			],
		})
	}

	sendScan() {
		root.send<Bridge.List.Scan.Send>({
			ch: "filer-scan",
			args: [
				this.id,
				{
					status: this.data.status,
					update: this.data.update,
					cursor: this.data.cursor,
					length: this.data.length,
					wd: this.data.wd,
					ls: [], // renderer 側で要素作成
					mk: [], // renderer 側で要素作成
					drawCount: Math.min(this.sc.drawCount(), this.data.length),
					drawIndex: this.sc.drawIndex(0),
					drawPosition: this.sc.drawPosition(0),
					drawSize: this.sc.contentsSize,
					knobPosition: this.sc.knobPosition,
					knobSize: this.sc.knobSize,
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

	sendAttribute(start: number = 0, end: number = this.data.length) {
		root.send<Bridge.List.Attribute.Send>({
			ch: "filer-attribute",
			args: [
				this.id,
				{
					update: this.data.update,
					_slice: _.reduce(_.range(start, end), (ret, it) => {
						return _.assign(ret, { [it]: { ls: this.data.ls[it] } })
					}, {}),
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
					_slice: _.reduce(_.range(start, end), (ret, it) => {
						return _.assign(ret, { [it]: { mk: this.data.mk[it] } })
					}, {}),
				},
			],
		})
	}
}
