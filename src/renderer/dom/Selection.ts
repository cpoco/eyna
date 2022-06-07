export namespace Selection {
	export function node(node: Node) {
		const r = document.createRange()
		r.selectNodeContents(node)

		const s = window.getSelection()
		s?.removeAllRanges()
		s?.addRange(r)
	}

	export function text(text: Text, start: number = 0, end: number = text.length) {
		const r = document.createRange()
		r.setStart(text, start)
		r.setEnd(text, end)

		const s = window.getSelection()
		s?.removeAllRanges()
		s?.addRange(r)
	}
}
