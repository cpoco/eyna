export function isArray(v: unknown): v is unknown[] {
	return Object.prototype.toString.call(v) == "[object Array]"
}
