export namespace Modal {
	// renderer -> browser
	export namespace Event {
		export const CH = "modal-event"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = opened | closed | canceled
		type opened = {
			event: "opened"
		}
		type closed = {
			event: "closed"
			result: ResultClose
		}
		type canceled = {
			event: "canceled"
			result: ResultCancel
		}
		export type ResultClose = ResultAlert | ResultPrompt | ResultFind
		export type ResultAlert = { text: string }
		export type ResultPrompt = { text: string }
		export type ResultFind = { rg: string; dp: string }
		export type ResultCancel = null
	}

	// browser -> renderer
	export namespace Open {
		export const CH = "modal-open"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = DataAlert | DataPrompt | DataFind
		export type DataAlert = {
			type: "alert"
			title: string
			text: string
		}
		export type DataPrompt = {
			type: "prompt"
			title: string
			text: string
			start?: number
			end?: number
		}
		export type DataFind = {
			type: "find"
			title: string
			rg: string
			dp: string
		}
	}

	// browser -> renderer
	export namespace Cancel {
		export const CH = "modal-cancel"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {}
	}
}
