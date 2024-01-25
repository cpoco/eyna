import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { Selection } from "@/renderer/dom/Selection"
import { FOCUS_DELAY } from "@/renderer/fragment/modal/Dialog"

type reactive = {
	prompt: [string, string]
}

const TAG = "dialog-prompt"

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
		start: {
			required: true,
			type: Number as vue.PropType<number | null>,
		},
		end: {
			required: true,
			type: Number as vue.PropType<number | null>,
		},
		close: {
			required: true,
			type: Function as vue.PropType<(_: Bridge.Modal.Event.ResultPrompt) => void>,
		},
		cancel: {
			required: true,
			type: Function as vue.PropType<() => void>,
		},
	},

	setup(props) {
		const prompt = vue.ref<HTMLElement>()

		const reactive = vue.reactive<reactive>({
			prompt: [props.text, props.text],
		})

		const keydown = (key: KeyboardEvent) => {
			if (key.isComposing) {
				return
			}

			if (key.key == "Enter") {
				props.close({ text: reactive.prompt[0] })
			}
			else if (key.key == "Escape") {
				props.cancel()
			}
		}

		const input = (input: InputEvent) => {
			reactive.prompt[0] = (<HTMLDivElement> input.target).innerText
		}

		vue.onMounted(() => {
			setTimeout(() => {
				prompt.value!.focus()
				if (props.start != null && props.end != null) {
					Selection.text(<Text> prompt.value!.childNodes[0]!, props.start, props.end)
				}
			}, FOCUS_DELAY)
		})

		return {
			prompt,
			reactive,
			keydown,
			input,
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
				ref: "prompt",
				class: { "modal-prompt": true },
				contenteditable: "plaintext-only",
				onInput: this.input,
			}, this.reactive.prompt[1]),
		])
	},
})
