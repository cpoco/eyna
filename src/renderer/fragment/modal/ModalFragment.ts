import * as vue from "vue"

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import * as DialogAlert from '@renderer/fragment/modal/DialogAlert'
import * as DialogPrompt from '@renderer/fragment/modal/DialogPrompt'
import * as DialogFind from '@renderer/fragment/modal/DialogFind'

type reactive = {
	type: "find" | "alert" | "prompt" | null
	title: string
	text: string
}

const TAG = "modal"

export const V = vue.defineComponent({

	setup() {
		const reactive = vue.reactive<reactive>({
			type: null,
			title: "",
			text: "",
		})

		vue.onMounted(() => {
			root.on(Bridge.Modal.Order.CH, (_: number, data: Bridge.Modal.Order.Data) => {
				if (data.order == "open") {
					root.send<Bridge.Modal.Event.Send>({
						ch: 'modal-event',
						args: [-1, { event: "opened" }],
					})
					reactive.type = data.type
					reactive.title = data.title
					reactive.text = data.text
				}
				else if (data.order == "cancel") {
					cancel()
				}
			})
		})

		const close = (result: Bridge.Modal.Event.Result) => {
			root.send<Bridge.Modal.Event.Send>({
				ch: 'modal-event',
				args: [-1, { event: "closed", result: result }],
			})
			reactive.type = null
			reactive.title = ""
			reactive.text = ""
		}

		const cancel = () => {
			root.send<Bridge.Modal.Event.Send>({
				ch: 'modal-event',
				args: [-1, { event: "canceled" }],
			})
			reactive.type = null
			reactive.title = ""
			reactive.text = ""
		}

		return {
			reactive,
			close,
			cancel,
		}
	},

	render() {
		if (this.reactive.type == "alert") {
			return vue.h(TAG, { class: { "modal-fragment": true } }, [
				vue.h(DialogAlert.V, {
					title: this.reactive.title,
					text: this.reactive.text,
					close: this.close,
					cancel: this.cancel,
				})
			])
		}
		else if (this.reactive.type == "prompt") {
			return vue.h(TAG, { class: { "modal-fragment": true } }, [
				vue.h(DialogPrompt.V, {
					title: this.reactive.title,
					text: this.reactive.text,
					close: this.close,
					cancel: this.cancel,
				})
			])
		}
		else if (this.reactive.type == "find") {
			return vue.h(TAG, { class: { "modal-fragment": true } }, [
				vue.h(DialogFind.V, {
					title: this.reactive.title,
					rg: this.reactive.text,
					dp: "0",
					close: this.close,
					cancel: this.cancel,
				})
			])
		}

		return null
	},

})
