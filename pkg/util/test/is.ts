// node -r esbuild-register is.ts

import assert from "assert"
import * as Util from "@eyna/util/ts/Util"

// isArray
{
	assert(Util.isArray([]))
	assert(Util.isArray([1, 2, 3]))
	assert(Util.isArray(Array(0)))
	assert(Util.isArray(new Array(0)))

	assert(!Util.isArray({}))
	assert(!Util.isArray({ test: null }))
	assert(!Util.isArray(Object.create(null)))

	assert(!Util.isArray(undefined))
	assert(!Util.isArray(null))
	assert(!Util.isArray(true))
	assert(!Util.isArray(false))
	assert(!Util.isArray(NaN))
	assert(!Util.isArray(123))
	assert(!Util.isArray(123n))

	assert(!Util.isArray("string"))
	assert(!Util.isArray("0"))
	assert(!Util.isArray("null"))
	assert(!Util.isArray("[]"))
	assert(!Util.isArray("{}"))
	assert(!Util.isArray(JSON.stringify({})))

	assert(!Util.isArray(/.*/))
	assert(!Util.isArray(Symbol("symbol")))
	assert(!Util.isArray(() => { }))
	assert(!Util.isArray(new Date()))
	assert(!Util.isArray(new Error()))
	assert(!Util.isArray(new Promise(() => { })))
}

// isDict
{
	assert(!Util.isDict([]))
	assert(!Util.isDict([1, 2, 3]))
	assert(!Util.isDict(Array(0)))
	assert(!Util.isDict(new Array(0)))

	assert(Util.isDict({}))
	assert(Util.isDict({ test: null }))
	assert(Util.isDict(Object.create(null)))

	assert(!Util.isDict(undefined))
	assert(!Util.isDict(null))
	assert(!Util.isDict(true))
	assert(!Util.isDict(false))
	assert(!Util.isDict(NaN))
	assert(!Util.isDict(123))
	assert(!Util.isDict(123n))

	assert(!Util.isDict("string"))
	assert(!Util.isDict("0"))
	assert(!Util.isDict("null"))
	assert(!Util.isDict("[]"))
	assert(!Util.isDict("{}"))
	assert(!Util.isDict(JSON.stringify({})))

	assert(!Util.isDict(/.*/))
	assert(!Util.isDict(Symbol("symbol")))
	assert(!Util.isDict(() => { }))
	assert(!Util.isDict(new Date()))
	assert(!Util.isDict(new Error()))
	assert(!Util.isDict(new Promise(() => { })))
}

// isNumber
{
	assert(!Util.isNumber([]))
	assert(!Util.isNumber([1, 2, 3]))
	assert(!Util.isNumber(Array(0)))
	assert(!Util.isNumber(new Array(0)))

	assert(!Util.isNumber({}))
	assert(!Util.isNumber({ test: null }))
	assert(!Util.isNumber(Object.create(null)))

	assert(!Util.isNumber(undefined))
	assert(!Util.isNumber(null))
	assert(!Util.isNumber(true))
	assert(!Util.isNumber(false))
	assert(Util.isNumber(NaN))
	assert(Util.isNumber(123))
	assert(!Util.isNumber(123n))

	assert(!Util.isNumber("string"))
	assert(!Util.isNumber("0"))
	assert(!Util.isNumber("null"))
	assert(!Util.isNumber("[]"))
	assert(!Util.isNumber("{}"))
	assert(!Util.isNumber(JSON.stringify({})))

	assert(!Util.isNumber(/.*/))
	assert(!Util.isNumber(Symbol("symbol")))
	assert(!Util.isNumber(() => { }))
	assert(!Util.isNumber(new Date()))
	assert(!Util.isNumber(new Error()))
	assert(!Util.isNumber(new Promise(() => { })))
}

// isString
{
	assert(!Util.isString([]))
	assert(!Util.isString([1, 2, 3]))
	assert(!Util.isString(Array(0)))
	assert(!Util.isString(new Array(0)))

	assert(!Util.isString({}))
	assert(!Util.isString({ test: null }))
	assert(!Util.isString(Object.create(null)))

	assert(!Util.isString(undefined))
	assert(!Util.isString(null))
	assert(!Util.isString(true))
	assert(!Util.isString(false))
	assert(!Util.isString(NaN))
	assert(!Util.isString(123))
	assert(!Util.isString(123n))

	assert(Util.isString("string"))
	assert(Util.isString("0"))
	assert(Util.isString("null"))
	assert(Util.isString("[]"))
	assert(Util.isString("{}"))
	assert(Util.isString(JSON.stringify({})))

	assert(!Util.isString(/.*/))
	assert(!Util.isString(Symbol("symbol")))
	assert(!Util.isString(() => { }))
	assert(!Util.isString(new Date()))
	assert(!Util.isString(new Error()))
	assert(!Util.isString(new Promise(() => { })))
}