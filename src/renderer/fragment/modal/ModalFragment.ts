import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as DialogAlert from "@/renderer/fragment/modal/DialogAlert"
import * as DialogFind from "@/renderer/fragment/modal/DialogFind"
import * as DialogPrompt from "@/renderer/fragment/modal/DialogPrompt"
import root from "@/renderer/Root"

type Reactive = {
	type: "alert" | "prompt" | "find" | null
	alert: {
		title: string
		text: string
	}
	prompt: {
		title: string
		text: string
		start: number | null
		end: number | null
	}
	find: {
		title: string
		rg: string
		dp: string
	}
}

const TAG = "modal"

export const V = vue.defineComponent({
	setup() {
		const reactive = vue.reactive<Reactive>({
			type: null,
			alert: {
				title: "",
				text: "",
			},
			prompt: {
				title: "",
				text: "",
				start: null,
				end: null,
			},
			find: {
				title: "",
				rg: "",
				dp: "",
			},
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Modal.Open.CH, (_i, data) => {
					root.send(Bridge.Modal.Event.CH, -1, { event: "opened" })
					if (data.type == "alert") {
						reactive.type = data.type
						reactive.alert.title = data.title
						reactive.alert.text = data.text
					}
					else if (data.type == "prompt") {
						reactive.type = data.type
						reactive.prompt.title = data.title
						reactive.prompt.text = data.text
						reactive.prompt.start = data.start ?? null
						reactive.prompt.end = data.end ?? null
					}
					else if (data.type == "find") {
						reactive.type = data.type
						reactive.find.title = data.title
						reactive.find.rg = data.rg
						reactive.find.dp = data.dp
					}
				})
				.on(Bridge.Modal.Cancel.CH, (_i, _data) => {
					cancel()
				})
		})

		const close = (result: Bridge.Modal.Event.ResultClose) => {
			root.send(Bridge.Modal.Event.CH, -1, { event: "closed", result: result })
			reactive.type = null
		}

		const cancel = () => {
			root.send(Bridge.Modal.Event.CH, -1, { event: "canceled", result: null })
			reactive.type = null
		}

		return {
			reactive,
			close,
			cancel,
		}
	},

	render() {
		if (this.reactive.type == "alert") {
			return vue.h(
				TAG,
				{ class: { "modal-fragment": true } },
				vue.h(DialogAlert.V, {
					title: this.reactive.alert.title,
					text: this.reactive.alert.text,
					close: this.close,
					cancel: this.cancel,
				}),
			)
		}
		else if (this.reactive.type == "prompt") {
			return vue.h(
				TAG,
				{ class: { "modal-fragment": true } },
				vue.h(DialogPrompt.V, {
					title: this.reactive.prompt.title,
					text: this.reactive.prompt.text,
					start: this.reactive.prompt.start,
					end: this.reactive.prompt.end,
					close: this.close,
					cancel: this.cancel,
				}),
			)
		}
		else if (this.reactive.type == "find") {
			return vue.h(
				TAG,
				{ class: { "modal-fragment": true } },
				vue.h(DialogFind.V, {
					title: this.reactive.find.title,
					rg: this.reactive.find.rg,
					dp: this.reactive.find.dp,
					close: this.close,
					cancel: this.cancel,
				}),
			)
		}

		return null
	},
})
