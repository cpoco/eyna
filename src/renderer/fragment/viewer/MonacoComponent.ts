import * as _monaco from "monaco-editor/esm/vs/editor/editor.api"
import * as vue from "vue"
declare global {
	interface Window {
		monaco: {
			editor: typeof _monaco.editor
		}
	}
}

export const V = vue.defineComponent({
	props: {
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
			model = window.monaco.editor.createModel(props.value)
			editor = window.monaco.editor.create(
				el.value!,
				// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions
				{
					model: model,

					automaticLayout: true,
					minimap: {
						enabled: false,
					},
					renderWhitespace: "all",
					theme: "vs-dark",
					fontSize: 14,

					wordWrap: "on",
					wrappingIndent: "same",

					domReadOnly: true,
					readOnly: true,
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
