import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as DialogAlert from "@renderer/fragment/modal/DialogAlert"
import * as DialogFind from "@renderer/fragment/modal/DialogFind"
import * as DialogPrompt from "@renderer/fragment/modal/DialogPrompt"
import root from "@renderer/Root"

type reactive = {
	type: "alert" | "prompt" | "find" | null
	alert: {
		title: string
		text: string
	}
	prompt: {
		title: string
		text: string
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
		const reactive = vue.reactive<reactive>({
			type: null,
			alert: {
				title: "",
				text: "",
			},
			prompt: {
				title: "",
				text: "",
			},
			find: {
				title: "",
				rg: "",
				dp: "",
			},
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Modal.Open.CH, (_: number, data: Bridge.Modal.Open.Data) => {
					root.send<Bridge.Modal.Event.Send>({
						ch: "modal-event",
						args: [-1, { event: "opened" }],
					})
					reactive.type = data.type
					if (reactive.type == "alert") {
						reactive.alert.title = data.title
						reactive.alert.text = data.text
					}
					else if (reactive.type == "prompt") {
						reactive.prompt.title = data.title
						reactive.prompt.text = data.text
					}
					else if (reactive.type == "find") {
						reactive.find.title = data.title
						reactive.find.rg = data.text
						reactive.find.dp = "0"
					}
				})
				.on(Bridge.Modal.Cancel.CH, (_: number, _data: Bridge.Modal.Cancel.Data) => {
					cancel()
				})
		})

		const close = (result: Bridge.Modal.Event.Result) => {
			root.send<Bridge.Modal.Event.Send>({
				ch: "modal-event",
				args: [-1, { event: "closed", result: result }],
			})
			reactive.type = null
		}

		const cancel = () => {
			root.send<Bridge.Modal.Event.Send>({
				ch: "modal-event",
				args: [-1, { event: "canceled" }],
			})
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
