import * as Conf from "@app/Conf"
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
		"value": {
			required: true,
			type: String,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>()

		let model: _monaco.editor.ITextModel | null = null
		let editor: _monaco.editor.IStandaloneCodeEditor | null = null

		vue.watch(vue.toRefs(props).value, (v) => {
			if (model != null) {
				if (model.getValue() == v) {
					return
				}
				model.setValue(v)
			}
		})

		vue.onMounted(() => {
			model = window.monaco.editor.createModel(
				props.value,
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
					fontSize: Conf.DYNAMIC_FILER_FONT_SIZE,
					lineHeight: Conf.DYNAMIC_FILER_LINE_HEIGHT,
					wordWrap: "on",
					wrappingIndent: "same",
				},
			)
			editor.focus()
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
		return vue.h("div", { ref: "el" })
	},
})
