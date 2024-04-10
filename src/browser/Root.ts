import * as electron from "electron"
import * as fs from "node:fs"
import * as vm from "node:vm"

import * as Native from "@eyna/native/ts/browser"
import * as Util from "@eyna/util"

import * as Conf from "@/app/Conf"
import * as Bridge from "@/bridge/Bridge"
import { Command } from "@/browser/core/Command"
import { Path } from "@/browser/core/Path"
import { Storage } from "@/browser/core/Storage"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import { FilerFragment } from "@/browser/fragment/filer/FilerFragment"
import { ModalFragment } from "@/browser/fragment/modal/ModalFragment"
import { NavbarFragment } from "@/browser/fragment/navbar/NavbarFragment"
import { SystemFragment } from "@/browser/fragment/system/SystemFragment"
import { ViewerFragment } from "@/browser/fragment/viewer/ViewerFragment"
import { Protocol } from "@/browser/Protocol"

type Option = {
	active: {
		wd: string
		cursor: Native.Attributes | null
		select: Native.Attributes[]
	} | null
	target: {
		wd: string
		cursor: Native.Attributes | null
		select: Native.Attributes[]
	} | null
}

// 1x1 transparent
const icon = electron.nativeImage.createFromDataURL(
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
)

enum index {
	system = 0,
	navbar = 1,
	filer = 2,
	modal = 3,
	viewer = 4,
}

class Root {
	private url: string = ""
	private fragment!: [SystemFragment, NavbarFragment, FilerFragment, ModalFragment, ViewerFragment]
	private browser!: electron.BrowserWindow
	private active: boolean = false

	create(url: string) {
		this.url = url
		this.fragment = [
			new SystemFragment(),
			new NavbarFragment(),
			new FilerFragment(),
			new ModalFragment(),
			new ViewerFragment(),
		]
		Protocol.register()
		electron.app
			.on("ready", this._ready)
			.on("window-all-closed", this._window_all_closed)
		electron.Menu.setApplicationMenu(null)
	}

	private _ready = (_event: electron.Event, _launchInfo: (Record<string, any>) | (electron.NotificationResponse)) => {
		let op: Electron.BrowserWindowConstructorOptions = {
			frame: false,
			titleBarStyle: "hidden",
			titleBarOverlay: {
				color: Conf.COLOR_BACKGROUND,
				symbolColor: Conf.COLOR_FOREGROUND,
				height: Conf.NAVBAR_HEIGHT,
			},
			minWidth: 400,
			minHeight: 200,
			webPreferences: {
				preload: `${Path.appPath()}/app/preload.js`,
				sandbox: true,
				spellcheck: false,
			},
			backgroundColor: Conf.COLOR_BACKGROUND,
		}
		Util.merge(op, Storage.manager.data.window)
		this.browser = new electron.BrowserWindow(op)
		this.browser.loadURL(this.url)
		this.browser.on("focus", () => {
			this.active = true
			this.send<Bridge.System.Active.Send>({ ch: "system-active", args: [-1, this.active] })
		})
		this.browser.on("blur", () => {
			this.active = false
			this.send<Bridge.System.Active.Send>({ ch: "system-active", args: [-1, this.active] })
		})
		this.browser.on("close", (_event: electron.Event) => {
			Storage.manager.data.window = this.browser.getBounds()
			Storage.manager.data.wd = this.fragment[index.filer].pwd
			Storage.manager.save()
		})
		this.browser.webContents.on("before-input-event", async (_event: electron.Event, input: electron.Input) => {
			if (input.type == "keyDown") {
				await this.command(Command.manager.get(input))
			}
		})

		Protocol.handle()

		process.on("SIGINT", () => {
			this.quit()
		})
	}

	private _window_all_closed = () => {
		this.quit()
	}

	async command(conf: Command.Config | null): Promise<void> {
		if (conf == null) {
			return
		}
		let f: AbstractFragment | null = null
		switch (conf.when) {
			case Command.When.Always:
				f = this.fragment[index.system]
				break
			case Command.When.Filer:
				f = this.fragment[index.filer]
				break
			case Command.When.Modal:
				f = this.fragment[index.modal]
				break
			case Command.When.Viewer:
				f = this.fragment[index.viewer]
				break
			default:
				return
		}
		for (const c of conf.cmd) {
			try {
				await f.emit(c, ...conf.prm)
			}
			catch (err) {
				console.error("\u001b[33m[cmd]\u001b[0m", c, err)
				break
			}
		}
	}

	isActive(): boolean {
		return this.active
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

	devTools() {
		if (this.browser.webContents.isDevToolsOpened()) {
			this.browser.webContents.closeDevTools()
		}
		else {
			this.browser.webContents.openDevTools()
		}
	}

	drag(full: string) {
		this.browser.webContents.startDrag({
			file: full,
			icon: icon,
		})
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
		return this.fragment[index.modal].opne(option) as Promise<Bridge.Modal.Event.ResultFind | null>
	}

	viewer(option: Bridge.Viewer.Open.Data) {
		this.fragment[index.viewer].opne(option)
	}

	runExtension(file: string, option: Option) {
		console.log("\u001b[35m")
		console.log("run extension ----------------------------------------------")
		console.log("\u001b[0m")

		try {
			const code = fs.readFileSync(`${Path.appPath()}/extension/${file}`, "utf8")
			const sbox = {
				module: {},
				require: require,
				log: (...args: any[]) => {
					console.log(`\u001b[35m[${file}]\u001b[0m`, ...args)
				},
			}
			const func = vm.runInNewContext(code, sbox)

			func({
				active: option.active,
				target: option.target,
				filer: {
					update: () => {
						sbox.log("filer.update")
						this.fragment[index.filer].update()
					},
					exists: (full: string): Promise<boolean> => {
						sbox.log("filer.exists", { full })
						return Native.exists(full)
					},
					trash: (full: string): Promise<void> => {
						sbox.log("filer.trash", { full })
						return Native.moveToTrash(full)
					},
					mkdir: (full: string): Promise<void> => {
						sbox.log("filer.mkdir", { full })
						return Native.createDirectory(full)
					},
					mkfile: (full: string): Promise<void> => {
						sbox.log("filer.mkfile", { full })
						return Native.createFile(full)
					},
					copy: (full_src: string, full_dst: string): Promise<void> => {
						sbox.log("filer.copy", { src: full_src, dst: full_dst })
						return Native.copy(full_src, full_dst)
					},
					move: (full_src: string, full_dst: string): Promise<void> => {
						sbox.log("filer.move", { src: full_src, dst: full_dst })
						return Native.move(full_src, full_dst)
					},
					find: (full: string, base: string): Promise<Native.Directory> => {
						sbox.log("filer.find", { full })
						return Native.getDirectory(full, base, true, 1024, null)
					},
				},
				dialog: {
					opne: (
						option: Bridge.Modal.Open.DataAlert | Bridge.Modal.Open.DataPrompt,
					): Promise<Bridge.Modal.Event.ResultAlert | Bridge.Modal.Event.ResultPrompt | null> => {
						sbox.log("dialog.opne", option)
						return this.fragment[index.modal].opne(option) as Promise<
							Bridge.Modal.Event.ResultAlert | Bridge.Modal.Event.ResultPrompt | null
						>
					},
					cancel: () => {
						sbox.log("dialog.cancel")
						this.fragment[index.modal].cancel()
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
