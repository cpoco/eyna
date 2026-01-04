/// <reference types="monaco-editor/monaco.d.ts" />

// @types/requirejs
declare const require: {
	(modules: string[], ready: Function): void
}

import * as vue from "@vue/runtime-dom"

import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"

const EDIT = "edit"

export const V = vue.defineComponent({
	props: {
		original_href: {
			required: true,
			type: String,
		},
		modified_href: {
			required: true,
			type: String,
		},
		original: {
			required: true,
			type: String,
		},
		modified: {
			required: true,
			type: String,
		},
		original_size: {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
		modified_size: {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const sys = SystemProvider.inject()
		const edit = vue.useTemplateRef<HTMLElement>(EDIT)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let original: monaco.editor.ITextModel | null = null
		let modified: monaco.editor.ITextModel | null = null
		let editor: monaco.editor.IStandaloneDiffEditor | null = null

		const ready = () => {
			head.value = `${props.original_size.toLocaleString()} byte`
				+ ` | ${props.modified_size.toLocaleString()} byte`
			original = monaco.editor.createModel(
				"",
				undefined,
				monaco.Uri.file(props.original),
			)
			original.updateOptions({
				bracketColorizationOptions: {
					enabled: false,
					independentColorPoolPerBracketType: false,
				},
			})
			modified = monaco.editor.createModel(
				"",
				undefined,
				monaco.Uri.file(props.modified),
			)
			modified.updateOptions({
				bracketColorizationOptions: {
					enabled: false,
					independentColorPoolPerBracketType: false,
				},
			})
			editor = monaco.editor.createDiffEditor(
				edit.value!,
				{
					readOnly: true,
					domReadOnly: true,

					automaticLayout: true,
					contextmenu: false,
					links: false,

					renderWhitespace: "all",
					theme: "vs-dark",
					fontSize: sys.reactive.style.fontSize,
					lineHeight: sys.reactive.style.lineHeight,
					matchBrackets: "never",
					wordWrap: "off",

					unicodeHighlight: {
						ambiguousCharacters: false,
						invisibleCharacters: false,
					},
				},
			)
			editor.addCommand(monaco.KeyCode.F1, () => {})
			editor.setModel({
				original: original,
				modified: modified,
			})

			prog.value = true
			Promise.all([
				fetch(props.original_href)
					.then((res) => {
						return res.text()
					}),
				fetch(props.modified_href)
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
		}

		vue.onMounted(() => {
			require(["vs/editor/editor.main"], ready)
		})

		vue.onBeforeUnmount(() => {
			editor?.dispose()
			modified?.dispose()
			original?.dispose()
			editor = null
			modified = null
			original = null
		})

		const prev = () => {
			editor?.goToDiff("previous")
		}

		const next = () => {
			editor?.goToDiff("next")
		}

		return {
			head,
			prog,
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
			vue.h("div", { ref: EDIT, class: { "viewer-monaco-edit": true } }),
		])
	},
})
