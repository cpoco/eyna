import * as Util from "@eyna/util"

import * as Bridge from "@/bridge/Bridge"
import { Command } from "@/browser/core/Command"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class ModalFragment extends AbstractFragment {
	private deferred: Util.DeferredPromise<Bridge.Modal.Event.ResultClose | Bridge.Modal.Event.ResultCancel> | null = null

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	open(option: Bridge.Modal.Open.Data): Promise<Bridge.Modal.Event.ResultClose | Bridge.Modal.Event.ResultCancel> {
		Command.manager.whenType = Command.When.Modal
		root.send(Bridge.Modal.Open.CH, -1, option)

		this.deferred = new Util.DeferredPromise<Bridge.Modal.Event.ResultClose | Bridge.Modal.Event.ResultCancel>()
		return this.deferred.promise
	}

	cancel() {
		root.send(Bridge.Modal.Cancel.CH, -1, null)
	}

	private ipc() {
		root
			.on(Bridge.Modal.Event.CH, (_i, data) => {
				if (data.event == "opened") {
					Command.manager.whenType = Command.When.Modal
				}
				else if (data.event == "closed" || data.event == "canceled") {
					Command.manager.whenType = Command.When.Filer
					this.deferred?.resolve?.(data.result)
					this.deferred = null
				}
			})
	}

	private command() {
		this
			.on("modal.cancel", () => {
				this.cancel()
				return Promise.resolve()
			})
	}
}
