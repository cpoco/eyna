import * as Conf from "@/app/Conf"
import * as _monaco from "monaco-editor/esm/vs/editor/editor.api"
import * as vue from "vue"

declare global {
	interface Window {
		monaco: typeof _monaco
	}
}

export const V = vue.defineComponent({
	props: {
		"path": {
			required: true,
			type: String,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>()

		let model: _monaco.editor.ITextModel | null = null
		let editor: _monaco.editor.IStandaloneCodeEditor | null = null

		vue.onMounted(() => {
			model = window.monaco.editor.createModel(
				"",
				undefined,
				window.monaco.Uri.file(props.path),
			)
			editor = window.monaco.editor.create(
				el.value!,
				// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions
				{
					model: model,
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

			fetch(`file://${props.path}`)
				.then((res) => {
					return res.text()
				})
				.then((text) => {
					editor?.focus()
					model?.setValue(text)
				})
		})

		vue.onUnmounted(() => {
			editor?.dispose()
			model?.dispose()
		})

		return {
			el,
		}
	},

	render() {
		return vue.h("div", { ref: "el", class: { "viewer-monaco": true } })
	},
})
