import * as electron from "electron"
import * as _ from "lodash-es"
import * as fs from "node:fs"

import * as Conf from "@app/Conf"
import * as Bridge from "@bridge/Bridge"
import { Dir } from "@browser/core/Dir"
import { Storage } from "@browser/core/Storage"
import { AbstractFragment } from "@browser/fragment/AbstractFragment"
import { FilerManager } from "@browser/fragment/filer/FilerManager"
import root from "@browser/Root"
import * as Util from "@browser/util/Util"
import * as Native from "@module/native/ts/browser"

export class FilerFragment extends AbstractFragment {
	private index!: { active: number; target: number }
	private core!: FilerManager[]

	private get active(): FilerManager {
		return this.core[this.index.active]!
	}

	private get target(): FilerManager {
		return this.core[this.index.target]!
	}

	get pwd(): string[] {
		return _.map<FilerManager, string>(this.core, (f) => {
			return f.pwd
		})
	}

	constructor() {
		super()

		this.index = { active: 0, target: 1 }

		this.core = _.map<number, FilerManager>(_.range(Conf.LIST_COUNT), (i) => {
			return new FilerManager(
				i,
				(Storage.manager.data.wd ?? [])[i] ?? null,
				this.index.active == i
					? Bridge.Status.active
					: this.index.target == i
					? Bridge.Status.target
					: Bridge.Status.none,
			)
		})

		this.ipc()
		this.commandTest()
		this.commandExtension()
		this.commandList()
	}

	private on2(
		cmd: string,
		func: (active: FilerManager, target: FilerManager, ...args: string[]) => Promise<void>,
	): FilerFragment {
		super.on(cmd, (...args) => {
			return func(this.active, this.target, ...args)
		})
		return this
	}

	update() {
		this.active.update().then(() => {
			this.title()
		})
		this.target.update()
		this.core.forEach((fm) => {
			if (fm.data.status == Bridge.Status.none) {
				if (fm.pwd == this.active.pwd || fm.pwd == this.target.pwd) {
					fm.update()
				}
			}
		})
	}

	private title() {
		let a = this.active.data.ls[this.active.data.cursor] ?? []
		root.setTitle(a[0]?.full ?? this.active.data.wd)
	}

	private ipc() {
		root
			.on(Bridge.List.Dom.CH, (i: number, data: Bridge.List.Dom.Data) => {
				if (data.event == "mounted") {
					this.core[i]?.mounted(data.data.h, Conf.DYNAMIC_LINE_HEIGHT).then(() => {
						if (this.index.active == i) {
							this.title()
						}
					})
				}
				else if (data.event == "resized") {
					this.core[i]?.resized(data.data.h)
				}
			})
	}

	private commandTest() {
		this
			.on2("list.test", (active, target) => {
				root.runExtension("list.test.js", {
					active: {
						wd: active.pwd,
						cursor: active.data.ls[active.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, active.data.length), (ret, i) => {
							if (active.data.mk[i]) {
								ret.push(active.data.ls[i]!)
							}
							return ret
						}, []),
					},
					target: {
						wd: target.pwd,
						cursor: target.data.ls[target.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, target.data.length), (ret, i) => {
							if (target.data.mk[i]) {
								ret.push(target.data.ls[i]!)
							}
							return ret
						}, []),
					},
				})
				return Promise.resolve()
			})
	}

	private commandExtension() {
		this.on2("list.extension", (active, target, file) => {
			root.runExtension(`${file}.js`, {
				active: {
					wd: active.pwd,
					cursor: active.data.ls[active.data.cursor] ?? null,
					select: _.reduce<number, Native.Attributes[]>(_.range(0, active.data.length), (ret, i) => {
						if (active.data.mk[i]) {
							ret.push(active.data.ls[i]!)
						}
						return ret
					}, []),
				},
				target: {
					wd: target.pwd,
					cursor: target.data.ls[target.data.cursor] ?? null,
					select: _.reduce<number, Native.Attributes[]>(_.range(0, target.data.length), (ret, i) => {
						if (target.data.mk[i]) {
							ret.push(target.data.ls[i]!)
						}
						return ret
					}, []),
				},
			})
			this.title()
			return Promise.resolve()
		})
	}

	private commandList() {
		this
			.on2("list.up", (active, _target) => {
				if (active.data.ls.length == 0) {
					return Promise.resolve()
				}

				active.data.cursor = Math.max(active.data.cursor - 1, 0)
				active.scroll()
				active.sendCursor()
				this.title()
				return Promise.resolve()
			})
			.on2("list.pageup", (active, _target) => {
				if (active.data.ls.length == 0) {
					return Promise.resolve()
				}

				active.data.cursor = Math.max(active.data.cursor - active.mv, 0)
				active.scroll()
				active.sendCursor()
				this.title()
				return Promise.resolve()
			})
			.on2("list.down", (active, _target) => {
				if (active.data.ls.length == 0) {
					return Promise.resolve()
				}

				active.data.cursor = Math.min(active.data.cursor + 1, active.data.ls.length - 1)
				active.scroll()
				active.sendCursor()
				this.title()
				return Promise.resolve()
			})
			.on2("list.pagedown", (active, _target) => {
				if (active.data.ls.length == 0) {
					return Promise.resolve()
				}

				active.data.cursor = Math.min(
					active.data.cursor + active.mv,
					active.data.ls.length - 1,
				)
				active.scroll()
				active.sendCursor()
				this.title()
				return Promise.resolve()
			})
			.on2("list.left", (_active, _target) => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + Conf.LIST_COUNT - 1) % Conf.LIST_COUNT
				this.core.forEach((fm, i) => {
					fm.data.status = this.index.active == i
						? Bridge.Status.active
						: this.index.target == i
						? Bridge.Status.target
						: Bridge.Status.none
					fm.sendActive()
				})
				this.title()
				return Promise.resolve()
			})
			.on2("list.right", (_active, _target) => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + 1) % Conf.LIST_COUNT
				this.core.forEach((fm, i) => {
					fm.data.status = this.index.active == i
						? Bridge.Status.active
						: this.index.target == i
						? Bridge.Status.target
						: Bridge.Status.none
					fm.sendActive()
				})
				this.title()
				return Promise.resolve()
			})
			.on2("list.update", (active, _target) => {
				return new Promise(async (resolve, _reject) => {
					await active.update()
					this.title()
					resolve()
				})
			})
			.on2("list.mark", (active, _target) => {
				let attr = Util.first(active.data.ls[active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}

				active.data.mk[active.data.cursor] = !active.data.mk[active.data.cursor]
				active.sendMark(active.data.cursor, active.data.cursor + 1)
				return Promise.resolve()
			})
			.on2("list.find", (active, _target) => {
				return new Promise(async (resolve, _reject) => {
					let find = await root.find({ type: "find", title: active.pwd, rg: "^.+$", dp: "0" })
					if (find == null) {
						resolve()
						return
					}
					if (await active.sendChange(active.pwd, Number(find.dp), new RegExp(find.rg), null)) {
						active.scroll()
						active.sendScan()
						active.sendAttribute()
					}
					this.title()
					resolve()
				})
			})
			.on2("list.select", (active, _target) => {
				return new Promise(async (resolve, _reject) => {
					let attr = Util.first(active.data.ls[active.data.cursor])
					let trgt = Util.last(active.data.ls[active.data.cursor])
					if (attr == null || trgt == null) {
						resolve()
						return
					}
					// drive
					// homeuser
					// directory
					// link(symbolic or junction) -> directory
					if (
						attr.file_type == Native.AttributeFileType.drive
						|| attr.file_type == Native.AttributeFileType.homeuser
						|| attr.file_type == Native.AttributeFileType.directory
						|| attr.file_type == Native.AttributeFileType.link
							&& trgt.file_type == Native.AttributeFileType.directory
					) {
						if (await active.sendChange(attr.full, 0, null, null)) {
							active.scroll()
							active.sendScan()
							active.sendAttribute()
						}
						this.title()
						resolve()
					}
					// file(shortcut or bookmark) -> directory
					else if (
						attr.file_type == Native.AttributeFileType.file
						&& trgt.file_type == Native.AttributeFileType.directory
					) {
						if (await active.sendChange(trgt.full, 0, null, null)) {
							active.scroll()
							active.sendScan()
							active.sendAttribute()
						}
						this.title()
						resolve()
					}
					// file
					// file(shortcut or bookmark) -> file
					// link(symbolic or junction) -> file
					else if (
						trgt.file_type == Native.AttributeFileType.file
					) {
						let data = ""
						if (trgt.size <= 1_000_000) {
							data = fs.readFileSync(trgt.full, "utf8")
						}
						else {
							data = "file too large"
						}
						root.viewer({
							type: "text",
							path: trgt.full,
							size: trgt.size,
							data: data,
						})
						resolve()
					}
				})
			})
			.on2("list.updir", (active, _target) => {
				return new Promise(async (resolve, _reject) => {
					if (await active.sendChange(Dir.dirname(active.pwd), 0, null, Dir.basename(active.pwd))) {
						active.scroll()
						active.sendScan()
						active.sendAttribute()
					}
					this.title()
					resolve()
				})
			})
			.on2("list.targetequal", (active, target) => {
				return new Promise(async (resolve, _reject) => {
					if (await target.sendChange(active.pwd, 0, null, null)) {
						target.scroll()
						target.sendScan()
						target.sendAttribute()
					}
					resolve()
				})
			})
			.on2("list.targetselect", (active, target) => {
				return new Promise(async (resolve, _reject) => {
					let attr = Util.first(active.data.ls[active.data.cursor])
					let trgt = Util.last(active.data.ls[active.data.cursor])
					if (attr == null || trgt == null) {
						resolve()
						return
					}
					// drive
					// homeuser
					// directory
					// link(symbolic or junction) -> directory
					if (
						attr.file_type == Native.AttributeFileType.drive
						|| attr.file_type == Native.AttributeFileType.homeuser
						|| attr.file_type == Native.AttributeFileType.directory
						|| attr.file_type == Native.AttributeFileType.link
							&& trgt.file_type == Native.AttributeFileType.directory
					) {
						if (await target.sendChange(attr.full, 0, null, null)) {
							target.scroll()
							target.sendScan()
							target.sendAttribute()
						}
						resolve()
					}
					// file(shortcut or bookmark) -> directory
					else if (
						attr.file_type == Native.AttributeFileType.file
						&& trgt.file_type == Native.AttributeFileType.directory
					) {
						if (await target.sendChange(trgt.full, 0, null, null)) {
							target.scroll()
							target.sendScan()
							target.sendAttribute()
						}
						resolve()
					}
				})
			})
			.on2("list.shellopne", (active, _target) => {
				let attr = Util.first(active.data.ls[active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}
				electron.shell.openPath(attr.full)
				return Promise.resolve()
			})
			.on2("list.shellproperty", (active, _target) => {
				let attr = Util.first(active.data.ls[active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}
				Native.openProperties(attr.full)
				return Promise.resolve()
			})
	}
}
