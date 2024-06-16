export namespace Modal {
	// renderer -> browser
	export namespace Event {
		export const CH = "modal-event"
		export type Send = {
			ch: typeof CH
			id: -1
			data: Data
		}
		export type Data = Opened | Closed | Canceled
		type Opened = {
			event: "opened"
		}
		type Closed = {
			event: "closed"
			result: ResultClose
		}
		type Canceled = {
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
			id: -1
			data: Data
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
			id: -1
			data: Data
		}
		export type Data = null
	}
}
