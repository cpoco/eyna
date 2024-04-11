import * as Bridge from "@/bridge/Bridge"
import { Style } from "@/browser/core/Style"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class SystemFragment extends AbstractFragment {
	private dialog = {
		version: false,
	}

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	private ipc() {
		root
			.handle(Bridge.System.Dom.CH, (_i: number, _data: Bridge.System.Dom.Data): Bridge.System.Dom.Result => {
				return {
					app: {
						ready: true,
						active: root.isActive(),
					},
					dialog: this.dialog,
					style: Style.Dynamic,
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
				this.dialog.version = !this.dialog.version
				root.send<Bridge.System.Version.Send>({
					ch: Bridge.System.Version.CH,
					args: [-1, this.dialog.version],
				})
				return Promise.resolve()
			})
			.on("system.devtool", () => {
				root.devTools()
				return Promise.resolve()
			})
	}
}
