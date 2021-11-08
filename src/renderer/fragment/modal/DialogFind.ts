import * as vue from "vue"

import * as Bridge from '@bridge/Bridge'

type reactive = {
	rg: [string, string]
	dp: [string, string]
}

const TAG = "dialog-find"

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
		const rg = vue.ref<HTMLElement>()
		const dp = vue.ref<HTMLElement>()

		const reactive = vue.reactive<reactive>({
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
			reactive.rg[0] = (<HTMLDivElement>input.target).innerText
		}

		const input2 = (input: InputEvent) => {
			reactive.dp[0] = (<HTMLDivElement>input.target).innerText
		}

		vue.onMounted(() => {
			setTimeout(() => {
				rg.value!.focus()
			}, 0)
		})

		return {
			rg,
			dp,
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
				ref: "rg",
				class: { "modal-prompt": true },
				contenteditable: true,
				onInput: this.input1,
			}, this.reactive.rg[1]),
			vue.h("div", {
				ref: "dp",
				class: { "modal-prompt": true },
				contenteditable: true,
				onInput: this.input2,
			}, this.reactive.dp[1]),
		])
	},

})
