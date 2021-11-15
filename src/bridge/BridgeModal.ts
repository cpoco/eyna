export namespace Modal {
	// renderer -> browser
	export namespace Event {
		export const CH = "modal-event"
		export type Send = {
			ch: "modal-event"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = opened | closed | canceled
		type opened = {
			event: "opened"
		}
		type closed = {
			event: "closed"
			result: Result
		}
		type canceled = {
			event: "canceled"
		}
		export type Result = ResultText | ResultFind
		export type ResultText = { text: string }
		export type ResultFind = { rg: string; dp: string }
	}

	// browser -> renderer
	export namespace Order {
		export const CH = "modal-order"
		export type Send = {
			ch: "modal-order"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = open | cancel
		type open = {
			order: "open"
			type: "find" | "alert" | "prompt"
			title: string
			text: string
		}
		type cancel = {
			order: "cancel"
		}
	}
}
