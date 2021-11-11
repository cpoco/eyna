import * as electron from 'electron'
import * as _ from 'lodash-es'

import * as Native from '@module/native/ts/browser'

import * as Bridge from '@bridge/Bridge'

import root from '@browser/Root'
import { Dir } from '@browser/core/Dir'
import { Storage } from '@browser/core/Storage'
import { AbstractFragment } from '@browser/fragment/AbstractFragment'
import { FilerManager } from '@browser/fragment/filer/FilerManager'

export class FilerFragment extends AbstractFragment {

	private index: { active: number, target: number } = { active: -1, target: -1 }
	private core: FilerManager[] = []

	private get active(): FilerManager {
		return this.core[this.index.active]
	}

	private get target(): FilerManager {
		return this.core[this.index.target]
	}

	get pwd(): string[] {
		return _.map(this.core, (f) => {
			return f.pwd
		})
	}

	constructor() {
		super()

		this.index.active = 0
		this.index.target = 1

		for (let i = 0; i < 3; i++) {
			this.core.push(new FilerManager(i, (Storage.manager.data.wd ?? [])[i] ?? null,
				this.index.active == i ? Bridge.Status.active :
					this.index.target == i ? Bridge.Status.target :
						Bridge.Status.none))
		}

		this.ipc()
		this.commandTest()
		this.commandExtension()
		this.commandList()

	}

	update() {
		this.active.update()
		this.target.update()
		this.core.forEach((fm) => {
			if (fm.data.status == Bridge.Status.none) {
				if (fm.pwd == this.active.pwd || fm.pwd == this.target.pwd) {
					fm.update()
				}
			}
		})
	}

	private ipc() {
		const s: number = 14 // --dynamic-filer-font-size
		const h: number = 18 // --dynamic-filer-line-height

		root
			.handle(Bridge.Filer.Resize.CH, (_i: number, _data: Bridge.Filer.Resize.Data): Bridge.Filer.Style.Data => {
				return {
					fontSize: `${s}px`,
					lineHeight: `${h}px`,
				}
			})

		root
			.on(Bridge.List.Resize.CH, (i: number, data: Bridge.List.Resize.Data) => {
				if (data.event == "mounted") {
					this.core[i].mounted(data.data.h, h)
				}
				else if (data.event == "resized") {
					this.core[i].resized(data.data.h)
				}
			})
	}

	private commandTest() {
		this
			.on('list.test', () => {
				root.runExtension('list.test.js', {
					active: {
						wd: this.active.data.wd,
						cursor: this.active.data.ls[this.active.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, this.active.data.length), (ret, i) => {
							if (this.active.data.mk[i]) {
								ret.push(this.active.data.ls[i])
							}
							return ret
						}, [])
					},
					target: {
						wd: this.target.data.wd,
						cursor: this.target.data.ls[this.target.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, this.target.data.length), (ret, i) => {
							if (this.target.data.mk[i]) {
								ret.push(this.target.data.ls[i])
							}
							return ret
						}, [])
					},
				})
				/*
				Native.getDirectory(attr.full).then(async (dir) => {
					console.log(dir)
					if (attr) {
						if (this.active.data.wd == Dir.HOME) {
							console.log(await Native.getAttribute(attr.full))
						}
						else {
							console.log(await Native.getAttribute(attr.full, this.active.data.wd))
						}
					}
				})
				Native.getDirectorySize(attr.full).then((size) => {
					console.log(size)
				})
				*/
				return Promise.resolve()
			})
	}

	private commandExtension() {
		this
			.on('list.extension', (file) => {
				root.runExtension(`${file}.js`, {
					active: {
						wd: this.active.data.wd,
						cursor: this.active.data.ls[this.active.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, this.active.data.length), (ret, i) => {
							if (this.active.data.mk[i]) {
								ret.push(this.active.data.ls[i])
							}
							return ret
						}, [])
					},
					target: {
						wd: this.target.data.wd,
						cursor: this.target.data.ls[this.target.data.cursor] ?? null,
						select: _.reduce<number, Native.Attributes[]>(_.range(0, this.target.data.length), (ret, i) => {
							if (this.target.data.mk[i]) {
								ret.push(this.target.data.ls[i])
							}
							return ret
						}, [])
					},
				})
				return Promise.resolve()
			})
	}

	private commandList() {
		this
			.on('list.up', () => {
				if (this.active.data.ls.length == 0) {
					return Promise.resolve()
				}

				this.active.data.cursor = Math.max(this.active.data.cursor - 1, 0)
				this.active.scroll()
				this.active.sendCursor()
				return Promise.resolve()
			})

			.on('list.pageup', () => {
				if (this.active.data.ls.length == 0) {
					return Promise.resolve()
				}

				this.active.data.cursor = Math.max(this.active.data.cursor - this.active.mv, 0)
				this.active.scroll()
				this.active.sendCursor()
				return Promise.resolve()
			})

			.on('list.down', () => {
				if (this.active.data.ls.length == 0) {
					return Promise.resolve()
				}

				this.active.data.cursor = Math.min(this.active.data.cursor + 1, this.active.data.ls.length - 1)
				this.active.scroll()
				this.active.sendCursor()
				return Promise.resolve()
			})

			.on('list.pagedown', () => {
				if (this.active.data.ls.length == 0) {
					return Promise.resolve()
				}

				this.active.data.cursor = Math.min(this.active.data.cursor + this.active.mv, this.active.data.ls.length - 1)
				this.active.scroll()
				this.active.sendCursor()
				return Promise.resolve()
			})

			.on('list.left', () => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + 2) % 3
				this.core.forEach((fm, i) => {
					fm.data.status =
						this.index.active == i ? Bridge.Status.active :
							this.index.target == i ? Bridge.Status.target :
								Bridge.Status.none
					fm.sendActive()
				})
				return Promise.resolve()
			})

			.on('list.right', () => {
				this.index.target = this.index.active
				this.index.active = (this.index.active + 1) % 3
				this.core.forEach((fm, i) => {
					fm.data.status =
						this.index.active == i ? Bridge.Status.active :
							this.index.target == i ? Bridge.Status.target :
								Bridge.Status.none
					fm.sendActive()
				})
				return Promise.resolve()
			})

			.on('list.update', () => {
				return this.active.update()
			})

			.on('list.mark', () => {
				let attr = _.last(this.active.data.ls[this.active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}

				this.active.data.mk[this.active.data.cursor] = !this.active.data.mk[this.active.data.cursor]
				this.active.sendMark(this.active.data.cursor, this.active.data.cursor + 1)
				return Promise.resolve()
			})

			.on('list.find', () => {
				return new Promise(async (resolve, _reject) => {
					let find = await root.find({ type: "find", title: this.active.pwd, text: "^.+$" })
					if (find == null) {
						resolve()
						return
					}
					let wd = this.active.pwd
					this.active.sendChange(wd)
					this.active.change(wd, Number(find.dp), new RegExp(find.rg), null, () => {
						this.active.scroll()
						this.active.sendScan()
						this.active.sendAttribute()
						resolve()
					})
				})
			})

			.on('list.select', () => {
				return new Promise((resolve, _reject) => {
					let attr = _.last(this.active.data.ls[this.active.data.cursor])
					if (attr == null) {
						resolve()
						return
					}
					if (attr.file_type == Native.AttributeFileType.home || attr.file_type == Native.AttributeFileType.homeuser || attr.file_type == Native.AttributeFileType.directory) {
						let wd = attr.full
						this.active.sendChange(wd)
						this.active.change(wd, 0, null, null, () => {
							this.active.scroll()
							this.active.sendScan()
							this.active.sendAttribute()
							resolve()
						})
					}
				})
			})

			.on('list.updir', () => {
				return new Promise((resolve, _reject) => {
					let wd = Dir.dirname(this.active.data.wd)
					this.active.sendChange(wd)
					this.active.change(wd, 0, null, Dir.basename(this.active.data.wd), () => {
						this.active.scroll()
						this.active.sendScan()
						this.active.sendAttribute()
						resolve()
					})
				})
			})

			.on('list.targetequal', () => {
				return new Promise((resolve, _reject) => {
					let wd = this.active.data.wd
					this.target.sendChange(wd)
					this.target.change(wd, 0, null, null, () => {
						this.target.scroll()
						this.target.sendScan()
						this.target.sendAttribute()
						resolve()
					})
				})
			})

			.on('list.targetselect', () => {
				return new Promise((resolve, _reject) => {
					let attr = _.last(this.active.data.ls[this.active.data.cursor])
					if (attr == null) {
						resolve()
						return
					}
					if (attr.file_type == Native.AttributeFileType.home || attr.file_type == Native.AttributeFileType.homeuser || attr.file_type == Native.AttributeFileType.directory) {
						let wd = attr.full
						this.target.sendChange(wd)
						this.target.change(wd, 0, null, null, () => {
							this.target.scroll()
							this.target.sendScan()
							this.target.sendAttribute()
							resolve()
						})
					}
				})
			})

			.on('list.shellopne', () => {
				let attr = _.last(this.active.data.ls[this.active.data.cursor])
				if (attr == null) {
					return Promise.resolve()
				}
				electron.shell.openPath(attr.full)
				return Promise.resolve()
			})

			.on('list.shellproperty', () => {
				let attr = _.first(this.active.data.ls[this.active.data.cursor])
				//let attr = _.last(this.active.data.ls[this.active.data.cursor]) // リンク先
				if (attr == null) {
					return Promise.resolve()
				}
				Native.openProperties(attr.full)
				return Promise.resolve()
			})
	}
}
