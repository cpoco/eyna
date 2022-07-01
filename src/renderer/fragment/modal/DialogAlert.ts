import * as vue from "vue"

import * as Bridge from "@/bridge/Bridge"

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
			}, 0)
			// vue.nextTick(() => {
			// 	el.value!.focus()
			// })
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
