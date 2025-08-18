import { EditorState } from "@codemirror/state"
import { highlightSpecialChars } from "@codemirror/view"

export const bidiHighlight = highlightSpecialChars({
	specialChars: /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
	render: () => {
		const span = document.createElement("span")
		span.style.color = "#ce9178"
		span.textContent = "[]"
		return span
	},
})

export const singleLine = EditorState.transactionFilter.of((tr) => {
	return tr.newDoc.lines > 1 ? [] : [tr]
})
