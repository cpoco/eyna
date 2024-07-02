import * as Bridge from "@/bridge/Bridge"
import { Command } from "@/browser/core/Command"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class ViewerFragment extends AbstractFragment {
	private type: Bridge.Viewer.Type | null = null

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	open(option: Bridge.Viewer.Open.Data) {
		Command.manager.whenType = Command.When.Viewer
		root.send<Bridge.Viewer.Open.Send>({
			ch: Bridge.Viewer.Open.CH,
			id: -1,
			data: option,
		})
		this.type = option.type
	}

	close() {
		root.send<Bridge.Viewer.Close.Send>({
			ch: Bridge.Viewer.Close.CH,
			id: -1,
			data: null,
		})
		this.type = null
	}

	private ipc() {
		root
			.on(Bridge.Viewer.Event.CH, (_i: number, data: Bridge.Viewer.Event.Data) => {
				if (data == "opened") {
					Command.manager.whenType = Command.When.Viewer
				}
				else if (data == "closed") {
					Command.manager.whenType = Command.When.Filer
				}
			})
	}

	private command() {
		this
			.on("viewer.imageprev", () => {
				if (this.type != Bridge.Viewer.Type.Image) {
					return Promise.resolve()
				}
				return root.command({
					when: Command.When.Filer,
					cmd: ["list.imageup", "list.select"],
					prm: [],
				})
			})
			.on("viewer.imagenext", () => {
				if (this.type != Bridge.Viewer.Type.Image) {
					return Promise.resolve()
				}
				return root.command({
					when: Command.When.Filer,
					cmd: ["list.imagedown", "list.select"],
					prm: [],
				})
			})
			.on("viewer.diffprev", () => {
				if (this.type == Bridge.Viewer.Type.Diff) {
					root.send<Bridge.Viewer.Diff.Send>({
						ch: Bridge.Viewer.Diff.CH,
						id: -1,
						data: "prev",
					})
				}
				return Promise.resolve()
			})
			.on("viewer.diffnext", () => {
				if (this.type == Bridge.Viewer.Type.Diff) {
					root.send<Bridge.Viewer.Diff.Send>({
						ch: Bridge.Viewer.Diff.CH,
						id: -1,
						data: "next",
					})
				}
				return Promise.resolve()
			})
			.on("viewer.mediatoggle", () => {
				if (this.type == Bridge.Viewer.Type.Audio) {
					root.send<Bridge.Viewer.Audio.Send>({
						ch: Bridge.Viewer.Audio.CH,
						id: -1,
						data: "toggle",
					})
				}
				else if (this.type == Bridge.Viewer.Type.Video) {
					root.send<Bridge.Viewer.Video.Send>({
						ch: Bridge.Viewer.Video.CH,
						id: -1,
						data: "toggle",
					})
				}
				return Promise.resolve()
			})
			.on("viewer.close", () => {
				this.close()
				return Promise.resolve()
			})
	}
}
