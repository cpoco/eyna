export function count<T>(it: Iterable<T>, func: (t: T) => boolean): number {
	let cnt: number = 0
	for (let t of it) {
		if (func(t)) {
			cnt++
		}
	}
	return cnt
}
