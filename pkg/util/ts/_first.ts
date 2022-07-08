export function first<T>(a: T[] | undefined): T | null {
	return a?.[0] ?? null
}
