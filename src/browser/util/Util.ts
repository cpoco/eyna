export function count<T>(it: Iterable<T>, func: (t: T) => boolean): number {
	let cnt: number = 0
	for (let t of it) {
		if (func(t)) {
			cnt++
		}
	}
	return cnt
}

export function array<T>(start: number, end: number, func: (i: number) => T | undefined): T[] {
	let ary: T[] = []
	for (let i = start; i < end; i++) {
		let a = func(i)
		if (a !== undefined) {
			ary.push(a)
		}
	}
	return ary
}
