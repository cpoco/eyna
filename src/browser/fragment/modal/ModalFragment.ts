import * as Bridge from "@bridge/Bridge"
import { Command } from "@browser/core/Command"
import { AbstractFragment } from "@browser/fragment/AbstractFragment"
import root from "@browser/Root"
import { DeferredPromise } from "@browser/util/DeferredPromise"

export class ModalFragment extends AbstractFragment {
	private deferred: DeferredPromise<Bridge.Modal.Event.Result | null> | null = null

	constructor() {
		super()

		this.ipc()
	}

	opne(option: Bridge.Modal.Open.Data): Promise<Bridge.Modal.Event.Result | null> {
		Command.manager.whenType = Command.When.modal
		root.send<Bridge.Modal.Open.Send>({
			ch: Bridge.Modal.Open.CH,
			args: [-1, option],
		})

		this.deferred = new DeferredPromise<Bridge.Modal.Event.Result>()
		return this.deferred.promise
	}

	cancel() {
		Command.manager.whenType = Command.When.filer
		root.send<Bridge.Modal.Cancel.Send>({
			ch: Bridge.Modal.Cancel.CH,
			args: [-1, {}],
		})
	}

	private ipc() {
		root
			.on(Bridge.Modal.Event.CH, (_i: number, data: Bridge.Modal.Event.Data) => {
				if (data.event == "opened") {
					Command.manager.whenType = Command.When.modal
				}
				else if (data.event == "closed") {
					Command.manager.whenType = Command.When.filer
					if (this.deferred?.resolve) {
						this.deferred?.resolve(data.result)
					}
					this.deferred = null
				}
				else if (data.event == "canceled") {
					Command.manager.whenType = Command.When.filer
					if (this.deferred?.resolve) {
						this.deferred?.resolve(null)
					}
					this.deferred = null
				}
			})
	}
}
