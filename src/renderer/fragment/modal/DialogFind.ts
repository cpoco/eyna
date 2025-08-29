import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { FOCUS_DELAY } from "@/renderer/fragment/modal/Dialog"
import { bidiHighlight, singleLine } from "@/renderer/util/codemirror"

const TAG = "dialog-find"

const RG = "rg"
const DP = "dp"

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
		const dp = vue.useTemplateRef<HTMLElement>(DP)

		let view1: EditorView | null = null
		let view2: EditorView | null = null

		const keydown = (key: KeyboardEvent) => {
			if (key.isComposing) {
				return
			}

			if (key.key == "Enter") {
				props.close({
					rg: view1?.state.doc.toString() ?? props.rg,
					dp: view2?.state.doc.toString() ?? props.dp,
				})
			}
			else if (key.key == "Escape") {
				props.cancel()
			}
		}

		vue.onMounted(() => {
			const extensions = [
				EditorView.theme({
					"&.cm-editor": {
						border: "1px solid var(--border)",
					},
					"&.cm-focused": {
						outline: "none",
						border: "1px solid var(--focus)",
					},
					".cm-scroller": {
						fontFamily: "var(--font-family)",
						overflow: "hidden",
					},
					".cm-content": {
						caretColor: "var(--foreground)",
						padding: "2px 0",
					},
					".cm-line": {
						padding: "0 4px",
					},
					".cm-widgetBuffer": {
						display: "none",
					},
				}),
				bidiHighlight,
				singleLine,
			]

			view1 = new EditorView({
				parent: rg.value!,
				state: EditorState.create({
					doc: props.rg,
					extensions: extensions,
				}),
			})

			view2 = new EditorView({
				parent: dp.value!,
				state: EditorState.create({
					doc: props.dp,
					extensions: extensions,
				}),
			})

			setTimeout(() => {
				view1?.focus()
			}, FOCUS_DELAY)
		})

		vue.onBeforeUnmount(() => {
			view1?.destroy()
			view2?.destroy()
		})

		return {
			keydown,
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
			}, undefined),
			vue.h("div", {
				ref: DP,
				class: { "modal-prompt": true },
			}, undefined),
		])
	},
})
