// npx tsx test/merge.ts

import * as Util from "@eyna/util"
import assert from "node:assert"

function test(target: unknown, source: unknown, check: (target: unknown) => boolean) {
	Util.merge(target, source)
	assert(check(target))
}

// 配列とオブジェクト以外は何もしない
test(1, 2, (t) => {
	return t === 1
})
test("x", "y", (t) => {
	return t === "x"
})
test(null, null, (t) => {
	return t === null
})
test(null, undefined, (t) => {
	return t === null
})
test(null, {}, (t) => {
	return t === null
})
test(null, [], (t) => {
	return t === null
})
test(undefined, null, (t) => {
	return t === undefined
})
test(undefined, undefined, (t) => {
	return t === undefined
})
test(undefined, {}, (t) => {
	return t === undefined
})
test(undefined, [], (t) => {
	return t === undefined
})

// 型が違う場合は何もしない
test([], null, (t) => {
	return Util.isArray(t) && t.length === 0
})
test([], undefined, (t) => {
	return Util.isArray(t) && t.length === 0
})
test([], {}, (t) => {
	return Util.isArray(t) && t.length === 0
})

test({}, null, (t) => {
	return Util.isDict(t) && Object.keys(t).length === 0
})
test({}, undefined, (t) => {
	return Util.isDict(t) && Object.keys(t).length === 0
})
test({}, [], (t) => {
	return Util.isDict(t) && Object.keys(t).length === 0
})

// 配列
test(
	[],
	[],
	(t) => {
		return Util.isArray(t) && t.length === 0
	},
)
test(
	[],
	[1],
	(t) => {
		return Util.isArray(t) && t.length === 1 && t[0] === 1
	},
)
test(
	[1, 2],
	[],
	(t) => {
		return Util.isArray(t) && t.length === 2 && t[0] === 1 && t[1] === 2
	},
)
test(
	[1, 2],
	[3],
	(t) => {
		return Util.isArray(t) && t.length === 2 && t[0] === 3 && t[1] === 2
	},
)

// オブジェクト
test(
	{},
	{},
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 0
	},
)
test(
	{},
	{ x: "x1" },
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 1 && t.x === "x1"
	},
)
test(
	{ x: "x1" },
	{ y: "y1" },
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 2 && t.x === "x1" && t.y === "y1"
	},
)
test(
	{ x: "x1" },
	{ x: "x2", y: "y2" },
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 2 && t.x === "x2" && t.y === "y2"
	},
)
test(
	{ x: "x1" },
	{ x: [1, 2] },
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 1 && Util.isArray(t.x) && t.x[0] === 1 && t.x[1] === 2
	},
)
test(
	{ x: [1, 2] },
	{ x: [3] },
	(t) => {
		return Util.isDict(t) && Object.keys(t).length === 1 && Util.isArray(t.x) && t.x[0] === 3 && t.x[1] === 2
	},
)

// 特殊な型はundefinedになる
test(
	{},
	{
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
		func: () => {},
		date: new Date(),
		error: new Error(),
		promise: new Promise(() => {}),
	},
	(t) => {
		return Util.isDict(t)
			&& Object.keys(t).length === 15
			&& t.undefined === undefined
			&& t.null === null
			&& t.boolean === false
			&& isNaN(t.nan as any)
			&& t.number === 0
			&& t.bigint === 0n
			&& t.string === "string"
			&& Util.isArray(t.array) && t.array.length === 0
			&& Util.isDict(t.dict) && Object.keys(t.dict).length === 0
			&& t.reg === undefined
			&& t.symbol === undefined
			&& t.func === undefined
			&& t.date === undefined
			&& t.error === undefined
			&& t.promise === undefined
	},
)

test(
	[],
	[
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
		() => {},
		new Date(),
		new Error(),
		new Promise(() => {}),
	],
	(t) => {
		return Util.isArray(t)
			&& t.length === 15
			&& t[0] === undefined
			&& t[1] === null
			&& t[2] === false
			&& isNaN(t[3] as any)
			&& t[4] === 0
			&& t[5] === 0n
			&& t[6] === "string"
			&& Util.isArray(t[7]) && t[7].length === 0
			&& Util.isDict(t[8]) && Object.keys(t[8]).length === 0
			&& t[9] === undefined
			&& t[10] === undefined
			&& t[11] === undefined
			&& t[12] === undefined
			&& t[13] === undefined
			&& t[14] === undefined
	},
)
