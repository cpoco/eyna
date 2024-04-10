import * as Conf from "@/app/Conf"
import * as Bridge from "@/bridge/Bridge"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class SystemFragment extends AbstractFragment {
	private dialog: boolean = false

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	private ipc() {
		root
			.handle(Bridge.System.Dom.CH, (_i: number, _data: Bridge.System.Dom.Data): Bridge.System.Style.Data => {
				return {
					active: root.isActive(),
					dialog: this.dialog,
					fontSize: Conf.DYNAMIC_FONT_SIZE,
					lineHeight: Conf.DYNAMIC_LINE_HEIGHT,
				}
			})
	}

	private command() {
		this
			.on("system.cut", () => {
				root.cut()
				return Promise.resolve()
			})
			.on("system.copy", () => {
				root.copy()
				return Promise.resolve()
			})
			.on("system.paste", () => {
				root.paste()
				return Promise.resolve()
			})
			.on("system.exit", () => {
				root.quit()
				return Promise.resolve()
			})
			.on("system.reload", () => {
				root.reload()
				return Promise.resolve()
			})
			.on("system.version", () => {
				this.dialog = !this.dialog
				root.send<Bridge.System.Dialog.Send>({
					ch: Bridge.System.Dialog.CH,
					args: [-1, this.dialog],
				})
				return Promise.resolve()
			})
			.on("system.devtool", () => {
				root.devTools()
				return Promise.resolve()
			})
	}
}
