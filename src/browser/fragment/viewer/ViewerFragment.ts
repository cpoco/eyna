import * as Bridge from "@bridge/Bridge"
import { Command } from "@browser/core/Command"
import { AbstractFragment } from "@browser/fragment/AbstractFragment"
import root from "@browser/Root"

export class ViewerFragment extends AbstractFragment {
	constructor() {
		super()

		this.command()
	}

	private command() {
		this
			.on("viewer.close", () => {
				this.close()
				return Promise.resolve()
			})
	}

	opne(option: Bridge.Viewer.Open.Data) {
		Command.manager.whenType = Command.When.viewer
		root.send<Bridge.Viewer.Open.Send>({
			ch: Bridge.Viewer.Open.CH,
			args: [-1, option],
		})
	}

	private close() {
		Command.manager.whenType = Command.When.filer
		root.send<Bridge.Viewer.Close.Send>({
			ch: Bridge.Viewer.Close.CH,
			args: [-1, {}],
		})
	}
}
