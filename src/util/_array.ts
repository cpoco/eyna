export function array<V>(start: number, end: number, func: (i: number) => V | undefined): V[] {
	let ary: V[] = []
	for (let i = start; i < end; i++) {
		let a = func(i)
		if (a !== undefined) {
			ary.push(a)
		}
	}
	return ary
}
