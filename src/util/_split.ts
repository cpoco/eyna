export function split(str: string, splitter: string): string[] {
	let ary = str.split(splitter)
	let len = ary.length
	for (let i = 1; i < len; i += 2) {
		ary.splice(i, 0, splitter)
		len++
	}
	return ary
}
