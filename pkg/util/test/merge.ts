// node -r esbuild-register merge.ts

import assert from "assert"
import * as Util from "@eyna/util/ts/Util"

Util.merge(null, null)
Util.merge(null, undefined)
Util.merge(null, {})
Util.merge(null, [])

Util.merge(undefined, null)
Util.merge(undefined, undefined)
Util.merge(undefined, {})
Util.merge(undefined, [])

Util.merge([], null)
Util.merge([], undefined)
Util.merge([], {})
Util.merge([], [])

Util.merge({}, null)
Util.merge({}, undefined)
Util.merge({}, {})
Util.merge({}, [])


{
	let t = [1, 2]
	Util.merge(t, [3])
	assert(t[0] == 3 && t[1] == 2)
}

{
	let t = {
		x: "x",
	} as any
	Util.merge(t, {
		y: "y",
	})
	assert(t.x == "x" && t.y == "y")
}

{
	let t = {
		x: "x",
	} as any
	Util.merge(t, {
		x: [1, 2],
	})
	assert(t.x[0] == 1 && t.x[1] == 2)
}

{
	let t = {
		x: "x",
	} as any
	Util.merge(t, {
		x: "xx",
		y: "y",
	})
	assert(t.x == "xx" && t.y == "y")
}

{
	let t = {
		x: [1, 2],
	}
	Util.merge(t, {
		x: [3],
	})
	assert(t.x[0] == 3 && t.x[1] == 2)
}

{
	let t: unknown = {}
	Util.merge(t, {
		undefined: undefined,
		null: null,
		boolean: false,
		nan: NaN,
		number: 0,
		bigint: 0n,
		string: "string",
		array: [],
		dict: {},
		reg: /./,
		symbol: Symbol("symbol"),
		func: () => { },
		date: new Date(),
		error: new Error(),
		promise: new Promise(() => { }),
	})
	console.log(t)
}

{
	let t: unknown = []
	Util.merge(t, [
		undefined,
		null,
		false,
		NaN,
		0,
		0n,
		"string",
		[],
		{},
		/./,
		Symbol("symbol"),
		() => { },
		new Date(),
		new Error(),
		new Promise(() => { }),
	])
	console.log(t)
}