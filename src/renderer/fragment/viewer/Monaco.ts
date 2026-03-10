/// <reference types="monaco-editor/monaco.d.ts" />

// @types/requirejs
declare const require: {
	(modules: string[], ready: Function): void
}

const theme = "eyna-dark"

const colors = {
	"diffEditor.removedLineBackground": "#40a6ff33",
	"diffEditor.removedTextBackground": "#40a6ff80",
	"diffEditorGutter.removedLineBackground": "#40a6ff33",
	"diffEditorOverview.removedForeground": "#40a6ff80",
	"diffEditor.insertedLineBackground": "#40c8ae33",
	"diffEditor.insertedTextBackground": "#40c8ae80",
	"diffEditorGutter.insertedLineBackground": "#40c8ae33",
	"diffEditorOverview.insertedForeground": "#40c8ae80",
}

let initialized = false

export const load = (callback: () => void) => {
	require(["vs/editor/editor.main"], () => {
		if (!initialized) {
			initialized = true

			monaco.editor.defineTheme(
				theme,
				{
					base: "vs-dark",
					inherit: true,
					rules: [],
					colors: colors,
				},
			)

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
		}
		callback()
	})
}

type Options = {
	fontSize: number
	lineHeight: number
}

export const options = (
	options: Options,
): monaco.editor.IStandaloneEditorConstructionOptions & monaco.editor.IDiffEditorConstructionOptions => {
	return {
		readOnly: true,
		domReadOnly: true,

		automaticLayout: true,
		contextmenu: false,
		links: false,

		renderWhitespace: "all",
		theme: theme,
		fontSize: options.fontSize,
		lineHeight: options.lineHeight,
		matchBrackets: "never",
		wordWrap: "off",

		unicodeHighlight: {
			ambiguousCharacters: false,
			invisibleCharacters: false,
		},
	}
}
