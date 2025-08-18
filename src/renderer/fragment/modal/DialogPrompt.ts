import { EditorSelection, EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { bidiHighlight, singleLine } from "@/renderer/cm/bidi"
import { FOCUS_DELAY } from "@/renderer/fragment/modal/Dialog"

const TAG = "dialog-prompt"

const PR = "pr"

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
		const pr = vue.useTemplateRef<HTMLElement>(PR)

		let view: EditorView | null = null

		const keydown = (key: KeyboardEvent) => {
			if (key.isComposing) {
				return
			}

			if (key.key == "Enter") {
				props.close({
					text: view?.state.doc.toString() ?? props.text,
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
						border: "1px solid rgba(80, 80, 80, 1)",
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
						caretColor: "#fff",
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

			view = new EditorView({
				parent: pr.value!,
				state: EditorState.create({
					doc: props.text,
					selection: EditorSelection.create([
						EditorSelection.range(props.start ?? 0, props.end ?? 0),
					]),
					extensions: extensions,
				}),
			})

			setTimeout(() => {
				view?.focus()
			}, FOCUS_DELAY)
		})

		vue.onUnmounted(() => {
			view?.destroy()
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
				ref: PR,
				class: { "modal-prompt": true },
			}, undefined),
		])
	},
})
