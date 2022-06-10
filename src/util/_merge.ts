import { isArray } from "@/util/_is_array"
import { isDict } from "@/util/_is_dict"

export function merge(target: unknown, source: unknown) {
	if (isDict(target) && isDict(source) || isArray(target) && isArray(source)) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target, k, v)
		}
	}
}

function _merge(target: any, key: string, source: unknown) {
	if (isDict(target[key]) && isDict(source) || isArray(target[key]) && isArray(source)) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
	}
	else {
		target[key] = source
	}
}
