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
	export namespace Open {
		export const CH = "modal-open"
		export type Send = {
			ch: "modal-open"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = Find | Alert | Prompt
		export type Find = {
			type: "find"
			title: string
			text: string
		}
		export type Alert = {
			type: "alert"
			title: string
			text: string
		}
		export type Prompt = {
			type: "prompt"
			title: string
			text: string
		}
	}

	// browser -> renderer
	export namespace Cancel {
		export const CH = "modal-cancel"
		export type Send = {
			ch: "modal-cancel"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {}
	}
}
