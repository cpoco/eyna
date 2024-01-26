import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { FOCUS_DELAY } from "@/renderer/fragment/modal/Dialog"

const TAG = "dialog-alert"

export const V = vue.defineComponent({
	props: {
		title: {
			required: true,
			type: String,
		},
		text: {
			required: true,
			type: String,
		},
		close: {
			required: true,
			type: Function as vue.PropType<(_: Bridge.Modal.Event.ResultAlert) => void>,
		},
		cancel: {
			required: true,
			type: Function as vue.PropType<() => void>,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>()

		const keydown = (key: KeyboardEvent) => {
			if (key.isComposing) {
				return
			}

			if (key.key == "Enter") {
				props.close({ text: "" })
			}
			else if (key.key == "Escape") {
				props.cancel()
			}
		}

		vue.onMounted(() => {
			setTimeout(() => {
				el.value!.focus()
			}, FOCUS_DELAY)
		})

		return {
			el,
			keydown,
		}
	},

	render() {
		return vue.h(TAG, {
			ref: "el",
			class: { "modal-dialog": true },
			tabindex: 0,
			onKeydown: this.keydown,
		}, [
			vue.h("div", { class: { "modal-title": true } }, this.title),
			vue.h("div", { class: { "modal-alert": true } }, this.text),
		])
	},
})
