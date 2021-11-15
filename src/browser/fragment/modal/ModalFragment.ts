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

	opne(
		option: { type: "find" | "alert" | "prompt"; title: string; text: string },
	): Promise<Bridge.Modal.Event.Result | null> {
		Command.manager.whenType = Command.When.modal
		root.send<Bridge.Modal.Order.Send>({
			ch: "modal-order",
			args: [
				-1,
				{
					order: "open",
					type: option.type,
					title: option.title,
					text: option.text,
				},
			],
		})

		this.deferred = new DeferredPromise<Bridge.Modal.Event.Result>()
		return this.deferred.promise
	}

	cancel() {
		Command.manager.whenType = Command.When.filer
		root.send<Bridge.Modal.Order.Send>({
			ch: "modal-order",
			args: [
				-1,
				{
					order: "cancel",
				},
			],
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
