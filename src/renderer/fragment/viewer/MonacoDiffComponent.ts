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
		"original": {
			required: true,
			type: String,
		},
		"modified": {
			required: true,
			type: String,
		},
		"original_size": {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
		"modified_size": {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const head = vue.ref<string>("")
		const el = vue.ref<HTMLElement>()

		let original: _monaco.editor.ITextModel | null = null
		let modified: _monaco.editor.ITextModel | null = null
		let editor: _monaco.editor.IStandaloneDiffEditor | null = null

		vue.onMounted(() => {
			head.value = `${props.original_size.toLocaleString()} byte`
			+ ` | ${props.modified_size.toLocaleString()} byte`
			original = window.monaco.editor.createModel(
				"",
				undefined,
				window.monaco.Uri.file(props.original),
			)
			modified = window.monaco.editor.createModel(
				"",
				undefined,
				window.monaco.Uri.file(props.modified),
			)
			editor = window.monaco.editor.createDiffEditor(
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
			editor.setModel({
				original: original,
				modified: modified,
			})

			fetch(`file://${props.original}`)
				.then((res) => {
					return res.text()
				})
				.then((text) => {
					editor?.focus()
					original?.setValue(text)
				})

			fetch(`file://${props.modified}`)
				.then((res) => {
					return res.text()
				})
				.then((text) => {
					editor?.focus()
					modified?.setValue(text)
				})
		})

		vue.onUnmounted(() => {
			editor?.dispose()
			original?.dispose()
			modified?.dispose()
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
