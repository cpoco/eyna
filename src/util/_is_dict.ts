export function isDict(v: unknown): v is { [k: string]: unknown } {
	return Object.prototype.toString.call(v) == "[object Object]"
}
