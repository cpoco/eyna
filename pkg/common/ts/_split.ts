export function split(strings: string[], splitter: string): string[] {
	let ret = []
	for (const str of strings) {
		let ary = str.split(splitter)
		let i = 0
		let l = ary.length
		for (const s of ary) {
			i++
			if (s !== "") {
				ret.push(s)
			}
			if (i < l) {
				ret.push(splitter)
			}
		}
	}
	return ret
}
