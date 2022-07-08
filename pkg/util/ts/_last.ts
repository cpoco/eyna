export function last<T>(a: T[] | undefined): T | null {
	return a?.[a.length - 1] ?? null
}
