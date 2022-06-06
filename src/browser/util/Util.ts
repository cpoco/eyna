export function isNumber(v: unknown): v is number {
	return typeof v === "number"
}

export function isString(v: unknown): v is string {
	return typeof v === "string"
}

export function first<T>(a: T[] | undefined): T | null {
	return a?.[0] ?? null
}

export function last<T>(a: T[] | undefined): T | null {
	return a?.[a.length - 1] ?? null
}

export function count<T>(it: Iterable<T>, func: (t: T) => boolean): number {
	let cnt: number = 0
	for (let t of it) {
		if (func(t)) {
			cnt++
		}
	}
	return cnt
}

export function split(str: string, splitter: string): string[] {
	let ary = str.split(splitter)
	let len = ary.length
	for (let i = 1; i < len; i += 2) {
		ary.splice(i, 0, splitter)
		len++
	}
	return ary
}

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

export function merge(target: unknown, source: unknown): unknown {
	if (_is_object(target) && _is_object(source) || _is_array(target) && _is_array(source)) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target, k, v)
		}
	}
	else {
		return null
	}
	return target
}

function _merge(target: any, key: string, source: unknown) {
	if (_is_object(target[key]) && _is_object(source) || _is_array(target[key]) && _is_array(source)) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
	}
	else {
		target[key] = source
	}
}

function _is_object(v: unknown): v is { [k: string]: unknown } {
	return Object.prototype.toString.call(v) == "[object Object]"
}

function _is_array(v: unknown): v is unknown[] {
	return Object.prototype.toString.call(v) == "[object Array]"
}
