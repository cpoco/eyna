/// <reference types="monaco-editor/monaco.d.ts" />

import * as vue from "@vue/runtime-dom"

import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import * as url from "@/renderer/util/url"

const EDIT = "edit"

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
		const sys = SystemProvider.inject()
		const edit = vue.useTemplateRef<HTMLElement>(EDIT)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let model: monaco.editor.ITextModel | null = null
		let editor: monaco.editor.IStandaloneCodeEditor | null = null

		vue.onMounted(() => {
			monaco.languages.register({ id: "hex" })
			monaco.languages.setMonarchTokensProvider("hex", {
				tokenizer: {
					root: [
						[/[0-9A-Fa-f]{8}:/, "keyword"],
						[/[0-9A-Fa-f]{2}/, "number"],
						[/"/, { token: "string", bracket: "@open", next: "@_string" }],
					],
					_string: [
						[/\\[abfnrtv\\"']/, "keyword"],
						[/\\x[0-9A-Fa-f]{2}/, "number"],
						[/"/, { token: "string", bracket: "@close", next: "@pop" }],
					],
				},
			})

			head.value = `${props.size.toLocaleString()} byte`
			model = monaco.editor.createModel("", "hex")
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
			fetch(url.fileUrl(props.path))
				.then((res) => {
					return res.arrayBuffer()
				})
				.then((buf) => {
					const decoder = new TextDecoder()
					const view = new DataView(buf, 0, Math.min(buf.byteLength, 0x100000))
					const cols = 16
					const line: string[] = []
					for (let row = 0; row < view.byteLength; row += cols) {
						let text = row.toString(16).padStart(8, "0") + ":"
						for (let off = row; off < row + cols; off++) {
							text += " " + (off < view.byteLength
								? view.getUint8(off).toString(16).padStart(2, "0")
								: "  ")
						}
						text += "  \"" + Array.from(decoder.decode(view.buffer.slice(row, Math.min(row + cols, view.byteLength))))
							.reduce((text, char) => {
								const code = char.charCodeAt(0)
								if (escape[code]) {
									return text + escape[code]
								}
								if ((0x00 <= code && code <= 0x1f) || (0x7f <= code && code <= 0x9f)) {
									return text + "\\x" + code.toString(16).padStart(2, "0")
								}
								return text + char
							}, "")
							+ "\""
						line.push(text)
					}
					return line.join("\n")
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

const escape: { [key: number]: string } = {
	0x07: "\\a",
	0x08: "\\b",
	0x09: "\\t",
	0x0a: "\\n",
	0x0b: "\\v",
	0x0c: "\\f",
	0x0d: "\\r",
	0x22: "\\\"",
	0x27: "\\'",
	0x5c: "\\\\",
}
