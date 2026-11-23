// node test/is.ts

import assert from "node:assert"
import * as Common from "../index.ts"

// isArray
{
	assert(Common.isArray([]))
	assert(Common.isArray([1, 2, 3]))
	assert(Common.isArray(Array(0)))
	assert(Common.isArray(new Array(0)))

	assert(!Common.isArray({}))
	assert(!Common.isArray({ test: null }))
	assert(!Common.isArray(Object.create(null)))

	assert(!Common.isArray(undefined))
	assert(!Common.isArray(null))
	assert(!Common.isArray(true))
	assert(!Common.isArray(false))
	assert(!Common.isArray(NaN))
	assert(!Common.isArray(123))
	assert(!Common.isArray(123n))

	assert(!Common.isArray("string"))
	assert(!Common.isArray("0"))
	assert(!Common.isArray("null"))
	assert(!Common.isArray("[]"))
	assert(!Common.isArray("{}"))
	assert(!Common.isArray(JSON.stringify({})))

	assert(!Common.isArray(/.*/))
	assert(!Common.isArray(Symbol("symbol")))
	assert(!Common.isArray(() => {}))
	assert(!Common.isArray(new Date()))
	assert(!Common.isArray(new Error()))
	assert(!Common.isArray(new Promise(() => {})))
}

// isDict
{
	assert(!Common.isDict([]))
	assert(!Common.isDict([1, 2, 3]))
	assert(!Common.isDict(Array(0)))
	assert(!Common.isDict(new Array(0)))

	assert(Common.isDict({}))
	assert(Common.isDict({ test: null }))
	assert(Common.isDict(Object.create(null)))

	assert(!Common.isDict(undefined))
	assert(!Common.isDict(null))
	assert(!Common.isDict(true))
	assert(!Common.isDict(false))
	assert(!Common.isDict(NaN))
	assert(!Common.isDict(123))
	assert(!Common.isDict(123n))

	assert(!Common.isDict("string"))
	assert(!Common.isDict("0"))
	assert(!Common.isDict("null"))
	assert(!Common.isDict("[]"))
	assert(!Common.isDict("{}"))
	assert(!Common.isDict(JSON.stringify({})))

	assert(!Common.isDict(/.*/))
	assert(!Common.isDict(Symbol("symbol")))
	assert(!Common.isDict(() => {}))
	assert(!Common.isDict(new Date()))
	assert(!Common.isDict(new Error()))
	assert(!Common.isDict(new Promise(() => {})))
}

// isNumber
{
	assert(!Common.isNumber([]))
	assert(!Common.isNumber([1, 2, 3]))
	assert(!Common.isNumber(Array(0)))
	assert(!Common.isNumber(new Array(0)))

	assert(!Common.isNumber({}))
	assert(!Common.isNumber({ test: null }))
	assert(!Common.isNumber(Object.create(null)))

	assert(!Common.isNumber(undefined))
	assert(!Common.isNumber(null))
	assert(!Common.isNumber(true))
	assert(!Common.isNumber(false))
	assert(Common.isNumber(NaN))
	assert(Common.isNumber(123))
	assert(!Common.isNumber(123n))

	assert(!Common.isNumber("string"))
	assert(!Common.isNumber("0"))
	assert(!Common.isNumber("null"))
	assert(!Common.isNumber("[]"))
	assert(!Common.isNumber("{}"))
	assert(!Common.isNumber(JSON.stringify({})))

	assert(!Common.isNumber(/.*/))
	assert(!Common.isNumber(Symbol("symbol")))
	assert(!Common.isNumber(() => {}))
	assert(!Common.isNumber(new Date()))
	assert(!Common.isNumber(new Error()))
	assert(!Common.isNumber(new Promise(() => {})))
}

// isString
{
	assert(!Common.isString([]))
	assert(!Common.isString([1, 2, 3]))
	assert(!Common.isString(Array(0)))
	assert(!Common.isString(new Array(0)))

	assert(!Common.isString({}))
	assert(!Common.isString({ test: null }))
	assert(!Common.isString(Object.create(null)))

	assert(!Common.isString(undefined))
	assert(!Common.isString(null))
	assert(!Common.isString(true))
	assert(!Common.isString(false))
	assert(!Common.isString(NaN))
	assert(!Common.isString(123))
	assert(!Common.isString(123n))

	assert(Common.isString("string"))
	assert(Common.isString("0"))
	assert(Common.isString("null"))
	assert(Common.isString("[]"))
	assert(Common.isString("{}"))
	assert(Common.isString(JSON.stringify({})))

	assert(!Common.isString(/.*/))
	assert(!Common.isString(Symbol("symbol")))
	assert(!Common.isString(() => {}))
	assert(!Common.isString(new Date()))
	assert(!Common.isString(new Error()))
	assert(!Common.isString(new Promise(() => {})))
}
