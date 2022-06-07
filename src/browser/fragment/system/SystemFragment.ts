import * as electron from "electron"

import * as Conf from "@/app/Conf"
import * as Bridge from "@/bridge/Bridge"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"
import * as Native from "@module/native/ts/browser"

export class SystemFragment extends AbstractFragment {
	constructor() {
		super()

		this.ipc()
		this.command()
	}

	private ipc() {
		root
			.handle(Bridge.System.Dom.CH, (_i: number, _data: Bridge.System.Dom.Data): Bridge.System.Style.Data => {
				return {
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
				root.showMessageBox([
					`version: ${electron.app.getVersion()}`,
					`admin: ${Native.isElevated()}`,
					"",
					`electron: ${process.versions.electron}`,
					`node: ${process.versions.node}`,
					`chrome: ${process.versions.chrome}`,
					`v8: ${process.versions.v8}`,
				].join("\n"))
				return Promise.resolve()
			})
			.on("system.devtool", () => {
				root.devTools()
				return Promise.resolve()
			})
	}
}
