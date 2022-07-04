import { isArray } from "./_is_array"
import { isDict } from "./_is_dict"

export function merge(target: unknown, source: unknown) {
	if (
		Object.prototype.toString.call(target) !== Object.prototype.toString.call(source)
		|| !isDict(source) && !isArray(source)
	) {
		return
	}
	for (const [k, v] of Object.entries(source)) {
		_merge(target, k, v)
	}
}

function _merge(target: any, key: string, source: unknown) {
	if (isDict(source)) {
		if (!isDict(target[key])) {
			target[key] = {}
		}
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
	}
	else if (isArray(source)) {
		if (!isArray(target[key])) {
			target[key] = []
		}
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
	}
	else if (typeof source !== "object" && typeof source !== "function") {
		target[key] = source
	}
	else if (source === null) {
		target[key] = null
	}
	else {
		target[key] = undefined
	}
}
