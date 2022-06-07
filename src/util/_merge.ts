import { isArray } from "@util/_is_array"
import { isObject } from "@util/_is_object"

type merge_type = { [k: string]: unknown } | unknown[]

export function merge(target: merge_type, source: merge_type): merge_type | null {
	if (isObject(target) && isObject(source) || isArray(target) && isArray(source)) {
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
	if (isObject(target[key]) && isObject(source) || isArray(target[key]) && isArray(source)) {
		for (const [k, v] of Object.entries(source)) {
			_merge(target[key], k, v)
		}
	}
	else {
		target[key] = source
	}
}
