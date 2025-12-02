import * as electron from "electron"

import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

import * as Conf from "@/app/Conf"
import * as Bridge from "@/bridge/Bridge"
import { AppConfig } from "@/browser/conf/AppConfig"
import { Dir } from "@/browser/core/Dir"
import { Path } from "@/browser/core/Path"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import { FilerManager } from "@/browser/fragment/filer/FilerManager"
import root from "@/browser/Root"

export class FilerFragment extends AbstractFragment {
	private index!: { active: number; target: number }
	private core!: FilerManager[]

	private get active(): FilerManager {
		return this.core[this.index.active]!
	}

	private get target(): FilerManager {
		return this.core[this.index.target]!
	}

	constructor() {
		super()

		this.index = { active: 0, target: 1 }

		this.core = Util.array(0, Conf.LIST_COUNT, (i) => {
			return new FilerManager(
				i,
				(AppConfig.data.wd ?? [])[i] ?? null,
				this.index.active == i
					? Bridge.Status.Active
					: this.index.target == i
					? Bridge.Status.Target
					: Bridge.Status.None,
			)
		})

		for (const fm of this.core) {
			fm.run()
		}

		this.ipc()
		this.commandExtension()
		this.commandList()
		this.commandListMedia()
	}

	exit(): string[] {
		return this.core.map((f) => {
			f.exit()
			return f.pwd
		})
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
		this.active.update(true)
		this.target.update(false)
		for (const fm of this.core) {
			if (fm.data.status == Bridge.Status.None) {
				if (fm.pwd == this.active.pwd || fm.pwd == this.target.pwd) {
					fm.update(false)
				}
			}
		}
	}

	private ipc() {
		root
			.on(Bridge.List.Dom.CH, (i, data) => {
				if (data.event == "mounted") {
					this.core[i]?.mounted(data.h, AppConfig.data.cssLineHeight ?? Conf.LINE_HEIGHT)
				}
				else if (data.event == "resized") {
					this.core[i]?.resized(data.h)
				}
			})
			.on(Bridge.List.Drag.CH, (_i, data) => {
				root.drag(data.full)
			})
	}

	private commandExtension() {
		this.on2("list.extension", (active, target, file) => {
			return root.runExtension(file, {
				active: (active.data.search || active.isHome) ? null : {
					wd: active.pwd,
					cursor: active.data.ls[active.data.cursor] ?? null,
					select: Util.array(0, active.data.length, (i) => {
						return active.data.mk[i] ? active.data.ls[i]! : undefined
					}),
				},
				target: (target.data.search || target.isHome) ? null : {
					wd: target.pwd,
					cursor: target.data.ls[target.data.cursor] ?? null,
					select: Util.array(0, target.data.length, (i) => {
						return target.data.mk[i] ? target.data.ls[i]! : undefined
					}),
				},
			})
		})
	}

	private commandList() {
		this
			.on2("list.up", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				active.cursorUp()
				active.scroll()
				active.sendCursor()
				return Promise.resolve()
			})
			.on2("list.pageup", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				active.cursorUp(active.mv)
				active.scroll()
				active.sendCursor()
				return Promise.resolve()
			})
			.on2("list.down", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				active.cursorDown()
				active.scroll()
				active.sendCursor()
				return Promise.resolve()
			})
			.on2("list.pagedown", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				active.cursorDown(active.mv)
				active.scroll()
				active.sendCursor()
				return Promise.resolve()
			})
			.on2("list.left", (_active, _target) => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + Conf.LIST_COUNT - 1) % Conf.LIST_COUNT
				for (const [i, fm] of this.core.entries()) {
					fm.data.status = this.index.active == i
						? Bridge.Status.Active
						: this.index.target == i
						? Bridge.Status.Target
						: Bridge.Status.None
					fm.sendActive()
				}
				return Promise.resolve()
			})
			.on2("list.right", (_active, _target) => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + 1) % Conf.LIST_COUNT
				for (const [i, fm] of this.core.entries()) {
					fm.data.status = this.index.active == i
						? Bridge.Status.Active
						: this.index.target == i
						? Bridge.Status.Target
						: Bridge.Status.None
					fm.sendActive()
				}
				return Promise.resolve()
			})
			.on2("list.update", (active, _target) => {
				if (active.data.search) {
					return Promise.resolve()
				}
				return new Promise(async (resolve, _reject) => {
					await active.update(false)
					resolve()
				})
			})
			.on2("list.mark", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0 || active.isHome) {
					return Promise.resolve()
				}
				active.markToggle()
				active.sendMark(active.data.cursor, active.data.cursor + 1)
				return Promise.resolve()
			})
			.on2("list.markall", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0 || active.isHome) {
					return Promise.resolve()
				}
				active.markAll(true)
				active.sendMarkAll()
				return Promise.resolve()
			})
			.on2("list.markclear", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0 || active.isHome) {
					return Promise.resolve()
				}
				active.markAll(false)
				active.sendMarkAll()
				return Promise.resolve()
			})
			.on2("list.find", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0 || active.isHome) {
					return Promise.resolve()
				}
				return new Promise(async (resolve, _reject) => {
					let find = await root.find({ type: "find", title: active.pwd, rg: "^.+$", dp: "0" })
					if (find == null) {
						resolve()
						return
					}
					if (
						await active.sendChange(
							active.pwd,
							Number(find.dp),
							find.rg == "" ? null : new RegExp(find.rg),
							null,
							false,
						)
					) {
						active.scroll()
						active.sendScan()
						active.sendAttrAll()
					}
					resolve()
				})
			})
			.on2("list.diff", (active, target) => {
				if (active.data.search || active.data.ls.length == 0 || target.data.search || target.data.ls.length == 0) {
					return Promise.resolve()
				}
				return new Promise(async (resolve, reject) => {
					let lattr: Native.Attribute | null = null
					let ltrgt: Native.Attribute | null = null
					let rattr: Native.Attribute | null = null
					let rtrgt: Native.Attribute | null = null
					if (this.index.active < this.index.target) {
						lattr = Util.first(active.data.ls[active.data.cursor])
						ltrgt = Util.last(active.data.ls[active.data.cursor])
						rattr = Util.first(target.data.ls[target.data.cursor])
						rtrgt = Util.last(target.data.ls[target.data.cursor])
					}
					else {
						lattr = Util.first(target.data.ls[target.data.cursor])
						ltrgt = Util.last(target.data.ls[target.data.cursor])
						rattr = Util.first(active.data.ls[active.data.cursor])
						rtrgt = Util.last(active.data.ls[active.data.cursor])
					}
					if (
						lattr == null || ltrgt == null || rattr == null || rtrgt == null
						|| ltrgt.file_type != Native.AttributeFileType.File
						|| rtrgt.file_type != Native.AttributeFileType.File
						|| ltrgt.full == rtrgt.full
					) {
						resolve()
						return
					}
					if (Conf.VIEWER_SIZE_LIMIT < ltrgt.size || Conf.VIEWER_SIZE_LIMIT < rtrgt.size) {
						reject("file too large")
						return
					}
					root.viewer({
						type: Bridge.Viewer.Type.Diff,
						mime: [],
						path: [ltrgt.full, rtrgt.full],
						size: [ltrgt.size, rtrgt.size],
					})
					resolve()
				})
			})
			.on2("list.hex", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				return new Promise(async (resolve, reject) => {
					let attr = Util.first(active.data.ls[active.data.cursor])
					let trgt = Util.last(active.data.ls[active.data.cursor])
					if (attr == null || trgt == null) {
						resolve()
						return
					}
					if (trgt.file_type == Native.AttributeFileType.File) {
						if (Conf.VIEWER_SIZE_LIMIT < trgt.size) {
							reject("file too large")
							return
						}
						root.viewer({
							type: Bridge.Viewer.Type.Hex,
							mime: [],
							path: [trgt.full],
							size: [trgt.size],
						})
					}
					resolve()
				})
			})
			.on2("list.select", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				return new Promise(async (resolve, reject) => {
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
						attr.file_type == Native.AttributeFileType.Drive
						|| attr.file_type == Native.AttributeFileType.HomeUser
						|| attr.file_type == Native.AttributeFileType.Directory
						|| attr.file_type == Native.AttributeFileType.Link
							&& trgt.file_type == Native.AttributeFileType.Directory
					) {
						if (await active.sendChange(attr.full, 0, null, null, false)) {
							active.scroll()
							active.sendScan()
							active.sendAttrAll()
						}
						resolve()
					}
					// file(shortcut or bookmark) -> directory
					else if (
						attr.file_type == Native.AttributeFileType.File
						&& trgt.file_type == Native.AttributeFileType.Directory
					) {
						if (await active.sendChange(trgt.full, 0, null, null, false)) {
							active.scroll()
							active.sendScan()
							active.sendAttrAll()
						}
						resolve()
					}
					// file
					// file(shortcut or bookmark) -> file
					// link(symbolic or junction) -> file
					else if (
						trgt.file_type == Native.AttributeFileType.File
					) {
						if (Conf.ARCHIVE_EXTE.test(trgt.exte)) {
							// WIP
						}
						else if (Conf.VIEWER_IMAGE_EXTE.test(trgt.exte)) {
							root.viewer({
								type: Bridge.Viewer.Type.Image,
								mime: [],
								path: [trgt.full],
								size: [trgt.size],
							})
						}
						else if (Conf.VIEWER_AUDIO_EXTE.test(trgt.exte)) {
							root.viewer({
								type: Bridge.Viewer.Type.Audio,
								mime: [],
								path: [trgt.full],
								size: [trgt.size],
							})
						}
						else if (Conf.VIEWER_VIDEO_EXTE.test(trgt.exte)) {
							root.viewer({
								type: Bridge.Viewer.Type.Video,
								mime: [],
								path: [trgt.full],
								size: [trgt.size],
							})
						}
						else if (Conf.VIEWER_PDF_EXTE.test(trgt.exte)) {
							root.viewer({
								type: Bridge.Viewer.Type.Embed,
								mime: ["application/pdf"],
								path: [trgt.full],
								size: [trgt.size],
							})
						}
						else {
							if (Conf.VIEWER_SIZE_LIMIT < trgt.size) {
								reject("file too large")
								return
							}
							root.viewer({
								type: Bridge.Viewer.Type.Text,
								mime: [],
								path: [trgt.full],
								size: [trgt.size],
							})
						}
						resolve()
					}
				})
			})
			.on2("list.updir", (active, _target) => {
				return new Promise(async (resolve, _reject) => {
					if (await active.sendChange(Dir.dirname(active.pwd), 0, null, Dir.basename(active.pwd), false)) {
						active.scroll()
						active.sendScan()
						active.sendAttrAll()
					}
					resolve()
				})
			})
			.on2("list.targetequal", (active, target) => {
				return new Promise(async (resolve, _reject) => {
					if (await target.sendChange(active.pwd, 0, null, null, false)) {
						target.scroll()
						target.sendScan()
						target.sendAttrAll()
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
						attr.file_type == Native.AttributeFileType.Drive
						|| attr.file_type == Native.AttributeFileType.HomeUser
						|| attr.file_type == Native.AttributeFileType.Directory
						|| attr.file_type == Native.AttributeFileType.Link
							&& trgt.file_type == Native.AttributeFileType.Directory
					) {
						if (await target.sendChange(attr.full, 0, null, null, false)) {
							target.scroll()
							target.sendScan()
							target.sendAttrAll()
						}
						resolve()
					}
					// file(shortcut or bookmark) -> directory
					else if (
						attr.file_type == Native.AttributeFileType.File
						&& trgt.file_type == Native.AttributeFileType.Directory
					) {
						if (await target.sendChange(trgt.full, 0, null, null, false)) {
							target.scroll()
							target.sendScan()
							target.sendAttrAll()
						}
						resolve()
					}
				})
			})
			.on2("list.shellopen", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				let attr = Util.first(active.data.ls[active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}
				electron.shell.openPath(Path.preferred(attr.full))
				return Promise.resolve()
			})
			.on2("list.shellproperty", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				let attr = Util.first(active.data.ls[active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}
				Native.openProperties(attr.full)
				return Promise.resolve()
			})
	}

	private commandListMedia() {
		this
			.on2("list.mediaup", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}
				for (let i = active.data.cursor - 1; 0 <= i; i--) {
					let trgt = Util.last(active.data.ls[i])
					if (trgt == null) {
						continue
					}
					if (trgt.file_type != Native.AttributeFileType.File) {
						continue
					}
					if (!Conf.VIEWER_MEDIA_EXTE.test(trgt.exte)) {
						continue
					}
					active.data.cursor = i
					active.scroll()
					active.sendCursor()
					break
				}
				return Promise.resolve()
			})
			.on2("list.mediadown", (active, _target) => {
				if (active.data.search || active.data.ls.length == 0) {
					return Promise.resolve()
				}

				for (let i = active.data.cursor + 1; i < active.data.ls.length; i++) {
					let trgt = Util.last(active.data.ls[i])
					if (trgt == null) {
						continue
					}
					if (trgt.file_type != Native.AttributeFileType.File) {
						continue
					}
					if (!Conf.VIEWER_MEDIA_EXTE.test(trgt.exte)) {
						continue
					}
					active.data.cursor = i
					active.scroll()
					active.sendCursor()
					break
				}
				return Promise.resolve()
			})
	}
}
