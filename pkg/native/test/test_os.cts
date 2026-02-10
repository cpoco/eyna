import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"

const main = async () => {
	assert.strictEqual(typeof native.isElevated(), "boolean")

	const v = await native.getVolume()
	assert(0 < v.length)
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_os)")
	})
}
catch (err) {
	console.error(err)
}
