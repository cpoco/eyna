import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

const main = async () => {
	const RAR = path.join(import.meta.dirname ?? __dirname, "fixtures", "test_pw2.rar")

	const arc = await native.getArchive(RAR, "", 10)

	assert.strictEqual(arc.s, 0n)
	assert.strictEqual(arc.d, 0)
	assert.strictEqual(arc.f, 0)
	assert.strictEqual(arc.e, 0)

	assert.strictEqual(arc.henc, true)
	assert.strictEqual(arc.list.length, 0)
	
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_arc_rar_pw2)")
	})
}
catch (err) {
	console.error(err)
}
