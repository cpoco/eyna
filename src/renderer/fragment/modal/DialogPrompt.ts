import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"

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
			}, 0)
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
				contenteditable: true,
				onInput: this.input,
			}, this.reactive.prompt[1]),
		])
	},
})
