import { isArray } from "./_is_array"
import { isDict } from "./_is_dict"

export function merge(target: unknown, source: unknown) {
	if (target === source) {
		return
	}
	if ((isDict(target) && isDict(source)) || (isArray(target) && isArray(source))) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target, k, v)
		}
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
		return
	}

	if (isArray(source)) {
		if (!isArray(target[key])) {
			target[key] = []
		}
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
		return
	}

	if (source === null || typeof source !== "function" && typeof source !== "object" && typeof source !== "symbol") {
		target[key] = source
		return
	}

	target[key] = undefined
}
