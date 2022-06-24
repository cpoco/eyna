import { isArray } from "@/util/_is_array"
import { isDict } from "@/util/_is_dict"

export function merge(target: any, source: any) {
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
	else if (typeof source !== "object" || source === null) {
		target[key] = source
	}
}
