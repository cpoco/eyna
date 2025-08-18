import { EditorState } from "@codemirror/state"
import { highlightSpecialChars } from "@codemirror/view"

const ALM = "\u{061C}"
const LRM = "\u{200E}"
const RLM = "\u{200F}"
const LRE = "\u{202A}"
const RLE = "\u{202B}"
const PDF = "\u{202C}"
const LRO = "\u{202D}"
const RLO = "\u{202E}"
const LRI = "\u{2066}"
const RLI = "\u{2067}"
const FSI = "\u{2068}"
const PDI = "\u{2069}"

const REG = new RegExp(`(${ALM}|${LRM}|${RLM}|${LRE}|${RLE}|${PDF}|${LRO}|${RLO}|${LRI}|${RLI}|${FSI}|${PDI})`, "gu")

const MAP: { [s: string]: string } = {
	[ALM]: "[ALM]",
	[LRM]: "[LRM]",
	[RLM]: "[RLM]",
	[LRE]: "[LRE]",
	[RLE]: "[RLE]",
	[PDF]: "[PDF]",
	[LRO]: "[LRO]",
	[RLO]: "[RLO]",
	[LRI]: "[LRI]",
	[RLI]: "[RLI]",
	[FSI]: "[FSI]",
	[PDI]: "[PDI]",
}

export const bidiHighlight = highlightSpecialChars({
	specialChars: REG,
	render: (code: number) => {
		const span = document.createElement("span")
		span.style.color = "#d7ba7d"
		span.textContent = MAP[String.fromCharCode(code)] ?? ""
		return span
	},
})

export const singleLine = EditorState.transactionFilter.of((tr) => {
	return tr.newDoc.lines > 1 ? [] : [tr]
})
