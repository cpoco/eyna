import * as electron from "electron"
import * as fs from "node:fs"
import * as vm from "node:vm"

import * as Bridge from "@/bridge/Bridge"
import { Command } from "@/browser/core/Command"
import { Path } from "@/browser/core/Path"
import { Storage } from "@/browser/core/Storage"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import { FilerFragment } from "@/browser/fragment/filer/FilerFragment"
import { ModalFragment } from "@/browser/fragment/modal/ModalFragment"
import { SystemFragment } from "@/browser/fragment/system/SystemFragment"
import { ViewerFragment } from "@/browser/fragment/viewer/ViewerFragment"
import * as Util from "@/util/Util"
import * as Native from "@eyna/native/ts/browser"

type Option = {
	active: {
		wd: string
		cursor: Native.Attributes | null
		select: Native.Attributes[]
	}
	target: {
		wd: string
		cursor: Native.Attributes | null
		select: Native.Attributes[]
	}
}

class Root {
	private url: string = ""
	private fragment!: [SystemFragment, FilerFragment, ModalFragment, ViewerFragment]
	private browser!: electron.BrowserWindow

	create(url: string) {
		this.url = url
		this.fragment = [
			new SystemFragment(),
			new FilerFragment(),
			new ModalFragment(),
			new ViewerFragment(),
		]
		electron.app
			.on("ready", this._ready)
			.on("window-all-closed", this._window_all_closed)
		electron.Menu.setApplicationMenu(null)
	}

	private _ready = (_event: electron.Event, _launchInfo: (Record<string, any>) | (electron.NotificationResponse)) => {
		let op: Electron.BrowserWindowConstructorOptions = {
			minWidth: 400,
			minHeight: 200,
			webPreferences: {
				preload: `${Path.appPath()}/app/preload.js`,
				sandbox: true,
				spellcheck: false,
			},
			backgroundColor: "#222",
		}
		Util.merge(op, Storage.manager.data.window)
		this.browser = new electron.BrowserWindow(op)
		this.browser.loadURL(this.url)
		this.browser.on("close", (_event: electron.Event) => {
			Storage.manager.data.window = this.browser.getBounds()
			Storage.manager.data.wd = this.fragment[1].pwd
			Storage.manager.save()
		})
		this.browser.webContents.on("before-input-event", async (_event: electron.Event, input: electron.Input) => {
			if (input.type == "keyDown") {
				let conf = Command.manager.get(input)
				if (conf == null) {
					return
				}

				let f: AbstractFragment | null = null
				switch (conf.when) {
					case Command.When.Always:
						f = this.fragment[0]
						break
					case Command.When.Filer:
						f = this.fragment[1]
						break
					case Command.When.Modal:
						f = this.fragment[2]
						break
					case Command.When.Viewer:
						f = this.fragment[3]
						break
					default:
						return
				}
				for (const c of conf.cmd) {
					await f.emit(c, ...conf.prm)
						.catch((err) => {
							console.error(err)
						})
				}
			}
		})
	}

	private _window_all_closed = () => {
		this.quit()
	}

	cut() {
		this.browser.webContents.cut()
	}

	copy() {
		this.browser.webContents.copy()
	}

	paste() {
		this.browser.webContents.paste()
	}

	quit() {
		electron.app.quit()
	}

	reload() {
		Command.manager.reload()
		this.browser.reload()
	}

	setTitle(title: string) {
		this.browser.setTitle(title)
	}

	showMessageBox(message: string) {
		electron.dialog.showMessageBox(this.browser, { "message": message })
	}

	devTools() {
		if (this.browser.webContents.isDevToolsOpened()) {
			this.browser.webContents.closeDevTools()
		}
		else {
			this.browser.webContents.openDevTools()
		}
	}

	on<T, U>(ch: string, listener: (i: T, data: U) => void): Root {
		electron.ipcMain.on(ch, (_event: electron.IpcMainInvokeEvent, ...args: [T, U]) => {
			console.log("\u001b[32m[ipc.on]\u001b[0m", ch, args[0], args[1])
			listener(args[0], args[1])
		})
		return this
	}

	handle<T, U, V>(ch: string, listener: (i: T, data: U) => V): Root {
		electron.ipcMain.handle(ch, (_event: electron.IpcMainInvokeEvent, ...args: [T, U]) => {
			console.log("\u001b[32m[ipc.handle]\u001b[0m", ch, args[0], args[1])
			let ret = listener(args[0], args[1])
			console.log("\u001b[32m[ipc.handle.result]\u001b[0m", ret)
			return ret
		})
		return this
	}

	send<T extends Bridge.Base.Send>(send: T) {
		console.log("\u001b[32m[ipc.send]\u001b[0m", send.ch, send.args[0] /*, send.args[1]*/)
		this.browser.webContents.send(send.ch, ...send.args)
	}

	find(option: Bridge.Modal.Open.DataFind): Promise<Bridge.Modal.Event.ResultFind | null> {
		return this.fragment[2].opne(option) as Promise<Bridge.Modal.Event.ResultFind | null>
	}

	viewer(option: Bridge.Viewer.Open.Data) {
		this.fragment[3].opne(option)
	}

	runExtension(file: string, option: Option) {
		console.log("\u001b[35m")
		console.log("run extension ----------------------------------------------")
		console.log("\u001b[0m")

		try {
			const log = (...args: any[]) => {
				console.log(`\u001b[35m[${file}]\u001b[0m`, ...args)
			}
			const code = fs.readFileSync(`${Path.appPath()}/extension/${file}`, "utf8")
			const func = vm.runInNewContext(code, { log: log, require: require })

			func({
				active: option.active,
				target: option.target,
				filer: {
					update: () => {
						this.fragment[1].update()
					},
					exists: (full: string): Promise<boolean> => {
						return Native.exists(full)
					},
					trash: (full: string): Promise<void> => {
						return Native.moveToTrash(full)
					},
					mkdir: (full: string): Promise<void> => {
						return Native.createDirectory(full)
					},
					copy: (full_src: string, full_dst: string): Promise<void> => {
						return Native.copy(full_src, full_dst)
					},
					move: (full_src: string, full_dst: string): Promise<void> => {
						return Native.move(full_src, full_dst)
					},
					findcopy: async (full: string): Promise<string[]> => {
						let dir = await Native.getDirectory(full, full, false, 1024, null)
						return Promise.resolve(dir.ls)
					},
					findmove: async (full: string): Promise<string[]> => {
						let dir = await Native.getDirectory(full, full, true, 1024, null)
						return Promise.resolve(dir.ls)
					},
				},
				dialog: {
					opne: (
						option: Bridge.Modal.Open.DataAlert | Bridge.Modal.Open.DataPrompt,
					): Promise<Bridge.Modal.Event.ResultAlert | Bridge.Modal.Event.ResultPrompt | null> => {
						return this.fragment[2].opne(option) as Promise<
							Bridge.Modal.Event.ResultAlert | Bridge.Modal.Event.ResultPrompt | null
						>
					},
					cancel: () => {
						this.fragment[2].cancel()
					},
				},
			})
				.then(() => {
					console.log("\u001b[35m")
					console.log("end extension ----------------------------------------------")
					console.log("\u001b[0m")
				})
		}
		catch (err) {
			console.error(err)
		}
	}
}

export default new Root()
