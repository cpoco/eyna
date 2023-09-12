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
		const el = vue.ref<HTMLElement>()

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let original: _monaco.editor.ITextModel | null = null
		let modified: _monaco.editor.ITextModel | null = null
		let editor: _monaco.editor.IStandaloneDiffEditor | null = null
		let navigator: _monaco.editor.IDiffNavigator | null = null

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
			navigator = window.monaco.editor.createDiffNavigator(editor)
			editor.setModel({
				original: original,
				modified: modified,
			})

			prog.value = true
			Promise.all([
				fetch(`file://${props.original}`)
					.then((res) => {
						return res.text()
					}),
				fetch(`file://${props.modified}`)
					.then((res) => {
						return res.text()
					}),
			])
				.then((text) => {
					prog.value = false
					editor?.focus()
					original?.setValue(text[0])
					modified?.setValue(text[1])
				})
		})

		vue.onUnmounted(() => {
			navigator?.dispose()
			editor?.dispose()
			modified?.dispose()
			original?.dispose()
		})

		const prev = () => {
			navigator?.previous()
		}

		const next = () => {
			navigator?.next()
		}

		return {
			head,
			prog,
			el,
			prev,
			next,
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
