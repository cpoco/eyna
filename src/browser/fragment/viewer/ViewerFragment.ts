import * as Bridge from "@/bridge/Bridge"
import { Command } from "@/browser/core/Command"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class ViewerFragment extends AbstractFragment {
	private type: "text" | "diff" | "image" | "video" | null = null

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	opne(option: Bridge.Viewer.Open.Data) {
		Command.manager.whenType = Command.When.Viewer
		root.send<Bridge.Viewer.Open.Send>({
			ch: Bridge.Viewer.Open.CH,
			args: [-1, option],
		})
		this.type = option.type
	}

	close() {
		root.send<Bridge.Viewer.Close.Send>({
			ch: Bridge.Viewer.Close.CH,
			args: [-1, {}],
		})
		this.type = null
	}

	private ipc() {
		root
			.on(Bridge.Viewer.Event.CH, (_i: number, data: Bridge.Viewer.Event.Data) => {
				if (data.event == "opened") {
					Command.manager.whenType = Command.When.Viewer
				}
				else if (data.event == "closed") {
					Command.manager.whenType = Command.When.Filer
				}
			})
	}

	private command() {
		this
			.on("viewer.imageprev", () => {
				if (this.type != "image") {
					return Promise.resolve()
				}
				return root.command({
					when: "filer",
					cmd: ["list.imageup", "list.select"],
					prm: [],
				})
			})
			.on("viewer.imagenext", () => {
				if (this.type != "image") {
					return Promise.resolve()
				}
				return root.command({
					when: "filer",
					cmd: ["list.imagedown", "list.select"],
					prm: [],
				})
			})
			.on("viewer.close", () => {
				this.close()
				return Promise.resolve()
			})
	}
}
