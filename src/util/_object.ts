export function object<V>(start: number, end: number, func: (i: number) => V | undefined): { [key: string]: V } {
	let obj: { [k: string]: V } = {}
	for (let i = start; i < end; i++) {
		let a = func(i)
		if (a !== undefined) {
			obj[i] = a
		}
	}
	return obj
}
