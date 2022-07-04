import * as Util from "@eyna/util/ts/Util"

Util.merge(null, null)
Util.merge(null, undefined)
Util.merge(null, {})
Util.merge(null, [])

Util.merge(undefined, null)
Util.merge(undefined, undefined)
Util.merge(undefined, {})
Util.merge(undefined, [])

Util.merge([], {})
Util.merge({}, [])

let t: unknown

t = {}
Util.merge(t, {
	undefined: undefined,
	null: null,
	string: "",
	boolean: false,
	nan: NaN,
	number: 0,
	bigint: 0n,
	reg: /./,
	func: () => {},
})
console.log(t)

t = []
Util.merge(t, [
	undefined,
	null,
	"",
	false,
	NaN,
	0,
	0n,
	/./,
	() => {},
])
console.log(t)
