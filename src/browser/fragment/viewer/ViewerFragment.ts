import * as Bridge from "@bridge/Bridge"
import { Command } from "@browser/core/Command"
import { AbstractFragment } from "@browser/fragment/AbstractFragment"
import root from "@browser/Root"

export class ViewerFragment extends AbstractFragment {
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
	}

	close() {
		Command.manager.whenType = Command.When.Filer
		root.send<Bridge.Viewer.Close.Send>({
			ch: Bridge.Viewer.Close.CH,
			args: [-1, {}],
		})
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
			.on("viewer.close", () => {
				this.close()
				return Promise.resolve()
			})
	}
}
