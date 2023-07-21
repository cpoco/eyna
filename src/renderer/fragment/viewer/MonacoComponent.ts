import * as Conf from "@/app/Conf"
import * as vue from "@/renderer/Vue"
import * as _monaco from "monaco-editor/esm/vs/editor/editor.api"

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
		"size": {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const head = vue.ref<string>("")
		const el = vue.ref<HTMLElement>()

		let model: _monaco.editor.ITextModel | null = null
		let editor: _monaco.editor.IStandaloneCodeEditor | null = null

		vue.onMounted(() => {
			head.value = `${props.size.toLocaleString()} byte`
			model = window.monaco.editor.createModel(
				"",
				undefined,
				window.monaco.Uri.file(props.path),
			)
			editor = window.monaco.editor.create(
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
			head,
			el,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-monaco": true } }, [
			vue.h("div", { class: { "viewer-monaco-head": true } },  this.head),
			vue.h("div", { class: { "viewer-monaco-stat": true } }),
			vue.h("div", { class: { "viewer-monaco-edit": true }, ref: "el" }),
		])
	},
})
