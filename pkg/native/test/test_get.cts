import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR, ROOT, TEST } from "./_util.cts"

const main = async () => {
	{
		const d = await native.getDirectory(ROOT)
		assert.strictEqual(d.full, ROOT)
		assert.strictEqual(d.base, "")
		assert(0 < d.list.length)
		assert.strictEqual(d.list.length, d.d + d.f)
		assert.strictEqual(d.e, 0)

		const a = await native.getAttribute(ROOT)
		assert.strictEqual(a.length, 1)
		assert.strictEqual(a[0].file_type, 1)
		assert.strictEqual(a[0].full, ROOT)
		assert.strictEqual(a[0].base, "")
		assert.strictEqual(a[0].rltv, ROOT)
		assert.strictEqual(a[0].name, "")
		assert.strictEqual(a[0].stem, "")
		assert.strictEqual(a[0].exte, "")
		assert.strictEqual(a[0].link_type, 0)
		assert.strictEqual(a[0].link, null)
	}

	{
		const p1 = await native.getPathAttribute(TEST)
		const p2 = await native.getPathAttribute(TEST + "/")
		if (process.platform == "win32") {
			assert.strictEqual(p1.length, 4)
			assert.strictEqual(p1[0].full, ROOT)
			assert.strictEqual(p1[1].full, "C:/Users")
			assert.strictEqual(p1[2].full, "C:/Users/Public")
			assert.strictEqual(p1[3].full, "C:/Users/Public/eyna test")
		}
		else if (process.platform == "darwin") {
			assert.strictEqual(p1.length, 4)
			assert.strictEqual(p1[0].full, ROOT)
			assert.strictEqual(p1[1].full, "/Users")
			assert.strictEqual(p1[2].full, "/Users/Shared")
			assert.strictEqual(p1[3].full, "/Users/Shared/eyna test")
		}
		assert.deepStrictEqual(p1, p2)
	}

	{
		const a1 = await native.getAttribute(TEST)
		const a2 = await native.getAttribute(TEST + "/")
		assert.strictEqual(a1.length, 1)
		assert.strictEqual(a1[0].file_type, 1)
		assert.strictEqual(a1[0].full, TEST)
		assert.strictEqual(a1[0].base, "")
		assert.strictEqual(a1[0].rltv, TEST)
		assert.strictEqual(a1[0].name, "eyna test")
		assert.strictEqual(a1[0].stem, "eyna test")
		assert.strictEqual(a1[0].exte, "")
		assert.strictEqual(a1[0].link_type, 0)
		assert.strictEqual(a1[0].link, null)
		assert.deepStrictEqual(a1, a2)
	}

	for (const abst of [ROOT, TEST, TEST + "/"]) {
		for (const base of ["", ROOT, TEST, TEST + "/", path.join(TEST, ".."), path.join(TEST, "..") + "/"]) {
			const a = await native.getAttribute(abst, base)
			const d = await native.getDirectory(abst, base)

			assert.strictEqual(a[0].full, d.full)
			assert.strictEqual(a[0].base, d.base)

			assert.strictEqual(a.length, 1)
			assert.strictEqual(a[0].file_type, 1)
			assert.strictEqual(a[0].exte, "")
			assert.strictEqual(a[0].link_type, 0)
			assert.strictEqual(a[0].link, null)
			if (base == "") {
				assert.strictEqual(a[0].full, a[0].rltv)
			}
			if (abst == base) {
				assert.strictEqual(a[0].rltv, ".")
			}

			assert(0 < d.list.length)
			assert.strictEqual(d.list.length, d.d + d.f)
			assert.strictEqual(d.e, 0)
		}
	}

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getDirectory(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.getAttribute(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.getPathAttribute(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_get)")
	})
}
catch (err) {
	console.error(err)
}
