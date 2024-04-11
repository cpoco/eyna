declare global {
	var monaco: typeof import("monaco-editor/esm/vs/editor/editor.api")
}

import * as vue from "@vue/runtime-dom"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api"

import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"

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
		const el = vue.ref<HTMLElement>()

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		let model: monaco.editor.ITextModel | null = null
		let editor: monaco.editor.IStandaloneCodeEditor | null = null

		vue.onMounted(() => {
			globalThis.monaco.languages.register({ id: "hex" })
			globalThis.monaco.languages.setMonarchTokensProvider("hex", {
				tokenizer: {
					root: [
						[/[0-9A-Fa-f]{8}:/, "keyword"],
						[/[0-9A-Fa-f]{2}/, "number"],
						[/"/, { token: "string", bracket: "@open", next: "@_string" }],
					],
					_string: [
						[/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/, "keyword"],
						[/"/, { token: "string", bracket: "@close", next: "@pop" }],
					],
				},
			})

			head.value = `${props.size.toLocaleString()} byte`
			model = globalThis.monaco.editor.createModel("", "hex")
			editor = globalThis.monaco.editor.create(
				el.value!,
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
					wordWrap: "on",
					wrappingIndent: "same",
				},
			)
			editor.setModel(model)

			prog.value = true
			fetch(`file://${props.path}`)
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
						text += "  " + JSON.stringify(decoder.decode(view.buffer.slice(row, Math.min(row + cols, view.byteLength))))
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
			el,
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
