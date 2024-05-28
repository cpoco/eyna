interface ProxyArray<T> extends Array<T> {
	first: T | null
	last: T | null
}

export function proxyArray<T>(target: Array<T>): ProxyArray<T> {
	return new Proxy(target, {
		get: (target, prop) => {
			if (prop === "first") {
				return target[0] ?? null
			}
			if (prop === "last") {
				return target[target.length - 1] ?? null
			}
			return Reflect.get(target, prop)
		},
	}) as ProxyArray<T>
}
