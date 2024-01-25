declare global {
	var monaco: typeof import("monaco-editor/esm/vs/editor/editor.api")
}

import * as vue from "@vue/runtime-dom"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api"

import * as Conf from "@/app/Conf"

export const V = vue.defineComponent({
	props: {
		path: {
			required: true,
			type: String,
		},
		size: {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>()

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let model: monaco.editor.ITextModel | null = null
		let editor: monaco.editor.IStandaloneCodeEditor | null = null

		vue.onMounted(() => {
			head.value = `${props.size.toLocaleString()} byte`
			model = globalThis.monaco.editor.createModel(
				"",
				undefined,
				globalThis.monaco.Uri.file(props.path),
			)
			editor = globalThis.monaco.editor.create(
				el.value!,
				{
					readOnly: true,
					domReadOnly: true,

					automaticLayout: true,
					contextmenu: false,
					links: false,

					renderWhitespace: "all",
					theme: "vs-dark",
					fontSize: Conf.DYNAMIC_FONT_SIZE,
					lineHeight: Conf.DYNAMIC_LINE_HEIGHT,
					matchBrackets: "never",
					wordWrap: "on",
					wrappingIndent: "same",
				},
			)
			editor.setModel(model)

			prog.value = true
			fetch(`file://${props.path}`)
				.then((res) => {
					return res.text()
				})
				.then((text) => {
					prog.value = false
					editor?.focus()
					model?.setValue(text)
				})
		})

		vue.onUnmounted(() => {
			editor?.dispose()
			model?.dispose()
		})

		return {
			head,
			prog,
			el,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-monaco": true } }, [
			vue.h("div", { class: { "viewer-monaco-head": true } }, this.head),
			vue.h(
				"div",
				{ class: { "viewer-monaco-stat": true } },
				this.prog
					? vue.h("div", { class: { "viewer-monaco-prog": true } }, undefined)
					: undefined,
			),
			vue.h("div", { ref: "el", class: { "viewer-monaco-edit": true } }),
		])
	},
})
