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
		href: {
			required: true,
			type: String,
		},
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
		const sys = SystemProvider.inject()
		const edit = vue.useTemplateRef<HTMLElement>(EDIT)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let model: monaco.editor.ITextModel | null = null
		let editor: monaco.editor.IStandaloneCodeEditor | null = null

		const ready = () => {
			head.value = `${props.size.toLocaleString()} byte`
			model = monaco.editor.createModel(
				"",
				undefined,
				monaco.Uri.file(props.path),
			)
			model.updateOptions({
				bracketColorizationOptions: {
					enabled: false,
					independentColorPoolPerBracketType: false,
				},
			})
			editor = monaco.editor.create(
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
			editor.setModel(model)

			prog.value = true
			fetch(props.href)
				.then((res) => {
					return res.text()
				})
				.then((text) => {
					prog.value = false
					editor?.focus()
					model?.setValue(text)
				})
		}

		vue.onMounted(() => {
			require(["vs/editor/editor.main"], ready)
		})

		vue.onBeforeUnmount(() => {
			editor?.dispose()
			model?.dispose()
			editor = null
			model = null
		})

		return {
			head,
			prog,
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
