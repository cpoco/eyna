import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { FOCUS_DELAY } from "@/renderer/fragment/modal/Dialog"

type Reactive = {
	rg: [string, string]
	dp: [string, string]
}

const TAG = "dialog-find"

const RG = "rg"

export const V = vue.defineComponent({
	props: {
		title: {
			required: true,
			type: String,
		},
		rg: {
			required: true,
			type: String,
		},
		dp: {
			required: true,
			type: String,
		},
		close: {
			required: true,
			type: Function as vue.PropType<(_: Bridge.Modal.Event.ResultFind) => void>,
		},
		cancel: {
			required: true,
			type: Function as vue.PropType<() => void>,
		},
	},

	setup(props) {
		const rg = vue.useTemplateRef<HTMLElement>(RG)

		const reactive = vue.reactive<Reactive>({
			rg: [props.rg, props.rg],
			dp: [props.dp, props.dp],
		})

		const keydown = (key: KeyboardEvent) => {
			if (key.isComposing) {
				return
			}

			if (key.key == "Enter") {
				props.close({ rg: reactive.rg[0], dp: reactive.dp[0] })
			}
			else if (key.key == "Escape") {
				props.cancel()
			}
		}

		const input1 = (input: InputEvent) => {
			reactive.rg[0] = (<HTMLDivElement> input.target).innerText
		}

		const input2 = (input: InputEvent) => {
			reactive.dp[0] = (<HTMLDivElement> input.target).innerText
		}

		vue.onMounted(() => {
			setTimeout(() => {
				rg.value!.focus()
			}, FOCUS_DELAY)
		})

		return {
			reactive,
			keydown,
			input1,
			input2,
		}
	},

	render() {
		return vue.h(TAG, {
			class: { "modal-dialog": true },
			tabindex: 0,
			onKeydown: this.keydown,
		}, [
			vue.h("div", { class: { "modal-title": true } }, this.title),
			vue.h("div", {
				ref: RG,
				class: { "modal-prompt": true },
				contenteditable: "plaintext-only",
				onInput: this.input1,
			}, this.reactive.rg[1]),
			vue.h("div", {
				class: { "modal-prompt": true },
				contenteditable: "plaintext-only",
				onInput: this.input2,
			}, this.reactive.dp[1]),
		])
	},
})
