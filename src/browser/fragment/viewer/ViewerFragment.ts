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
		root.send(Bridge.Viewer.Open.CH, -1, option)
		this.type = option.type
	}

	close() {
		root.send(Bridge.Viewer.Close.CH, -1, null)
		this.type = null
	}

	private ipc() {
		root
			.on(Bridge.Viewer.Event.CH, (_i, data) => {
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
			.on("viewer.diffprev", () => {
				if (this.type == Bridge.Viewer.Type.Diff) {
					root.send(Bridge.Viewer.Diff.CH, -1, "prev")
				}
				return Promise.resolve()
			})
			.on("viewer.diffnext", () => {
				if (this.type == Bridge.Viewer.Type.Diff) {
					root.send(Bridge.Viewer.Diff.CH, -1, "next")
				}
				return Promise.resolve()
			})
			.on("viewer.mediaprev", () => {
				if (
					this.type == Bridge.Viewer.Type.Image
					|| this.type == Bridge.Viewer.Type.Audio
					|| this.type == Bridge.Viewer.Type.Video
				) {
					return root.command({
						when: Command.When.Filer,
						cmd: ["list.mediaup", "list.select"],
						prm: [],
					})
				}
				return Promise.resolve()
			})
			.on("viewer.medianext", () => {
				if (
					this.type == Bridge.Viewer.Type.Image
					|| this.type == Bridge.Viewer.Type.Audio
					|| this.type == Bridge.Viewer.Type.Video
				) {
					return root.command({
						when: Command.When.Filer,
						cmd: ["list.mediadown", "list.select"],
						prm: [],
					})
				}
				return Promise.resolve()
			})
			.on("viewer.mediatoggle", () => {
				if (this.type == Bridge.Viewer.Type.Audio) {
					root.send(Bridge.Viewer.Audio.CH, -1, "toggle")
				}
				else if (this.type == Bridge.Viewer.Type.Video) {
					root.send(Bridge.Viewer.Video.CH, -1, "toggle")
				}
				return Promise.resolve()
			})
			.on("viewer.mediaff", () => {
				if (this.type == Bridge.Viewer.Type.Audio) {
					root.send(Bridge.Viewer.Audio.CH, -1, "ff")
				}
				else if (this.type == Bridge.Viewer.Type.Video) {
					root.send(Bridge.Viewer.Video.CH, -1, "ff")
				}
				return Promise.resolve()
			})
			.on("viewer.mediarw", () => {
				if (this.type == Bridge.Viewer.Type.Audio) {
					root.send(Bridge.Viewer.Audio.CH, -1, "rw")
				}
				else if (this.type == Bridge.Viewer.Type.Video) {
					root.send(Bridge.Viewer.Video.CH, -1, "rw")
				}
				return Promise.resolve()
			})
			.on("viewer.close", () => {
				this.close()
				return Promise.resolve()
			})
	}
}
