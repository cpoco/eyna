/// <reference types="monaco-editor/monaco.d.ts" />

import * as vue from "@vue/runtime-dom"

import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import * as url from "@/renderer/util/url"

const EDIT = "edit"

export const V = vue.defineComponent({
	props: {
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

		vue.onMounted(() => {
			head.value = `${props.original_size.toLocaleString()} byte`
				+ ` | ${props.modified_size.toLocaleString()} byte`
			original = monaco.editor.createModel(
				"",
				undefined,
				monaco.Uri.file(props.original),
			)
			modified = monaco.editor.createModel(
				"",
				undefined,
				monaco.Uri.file(props.modified),
			)
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
				},
			)
			editor.addCommand(monaco.KeyCode.F1, () => {})
			editor.setModel({
				original: original,
				modified: modified,
			})

			prog.value = true
			Promise.all([
				fetch(url.fileUrl(props.original))
					.then((res) => {
						return res.text()
					}),
				fetch(url.fileUrl(props.modified))
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
			editor?.dispose()
			modified?.dispose()
			original?.dispose()
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
