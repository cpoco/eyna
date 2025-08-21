import { EditorState } from "@codemirror/state"
import { highlightSpecialChars } from "@codemirror/view"

import * as BIDI from "@/renderer/util/bidi"

export const bidiHighlight = highlightSpecialChars({
	specialChars: BIDI.REG_GLOBAL,
	render: (code: number) => {
		const span = document.createElement("span")
		span.classList.add("c-bidi")
		span.textContent = BIDI.MAP[String.fromCharCode(code)] ?? ""
		return span
	},
})

export const singleLine = EditorState.transactionFilter.of((tr) => {
	return tr.newDoc.lines > 1 ? [] : [tr]
})
