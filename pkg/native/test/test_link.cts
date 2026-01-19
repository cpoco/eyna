import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"

import { TEST } from "./_util.cts"

const main = async () => {
	{
		const LINK = TEST + "/LINK"
		const FULL1 = TEST + "/LINK/la_self_0"
		const FULL2 = TEST + "/LINK/la_self_0/la_self_0/la_self_0/la_self_0/la_self_0"
		const l1 = await native.getAttribute(FULL1)
		const l2 = await native.getAttribute(FULL2)

		assert.strictEqual(l1.length, 2)
		assert.strictEqual(l1[0].file_type, 2)
		assert.strictEqual(l1[0].full, FULL1)
		assert.strictEqual(l1[0].base, "")
		assert.strictEqual(l1[0].rltv, FULL1)
		assert.strictEqual(l1[0].name, "la_self_0")
		assert.strictEqual(l1[0].stem, "la_self_0")
		assert.strictEqual(l1[0].exte, "")
		assert.strictEqual(l1[0].link_type, 1)
		assert.strictEqual(l1[0].link, LINK)

		assert.strictEqual(l1[1].file_type, 1)
		assert.strictEqual(l1[1].full, LINK)
		assert.strictEqual(l1[1].base, "")
		assert.strictEqual(l1[1].rltv, LINK)
		assert.strictEqual(l1[1].name, "LINK")
		assert.strictEqual(l1[1].stem, "LINK")
		assert.strictEqual(l1[1].exte, "")
		assert.strictEqual(l1[1].link_type, 0)
		assert.strictEqual(l1[1].link, null)

		assert.strictEqual(l2.length, 2)
		assert.strictEqual(l2[0].file_type, 2)
		assert.strictEqual(l2[0].full, FULL2)
		assert.strictEqual(l2[0].base, "")
		assert.strictEqual(l2[0].rltv, FULL2)
		assert.strictEqual(l2[0].name, "la_self_0")
		assert.strictEqual(l2[0].stem, "la_self_0")
		assert.strictEqual(l2[0].exte, "")
		assert.strictEqual(l2[0].link_type, 1)
		assert.strictEqual(l2[0].link, LINK)

		assert.deepStrictEqual(l1[1], l2[1])
	}
	{
		const LINK = TEST + "/LINK"
		const FULL1 = TEST + "/LINK/lr_self_0"
		const FULL2 = TEST + "/LINK/lr_self_0/lr_self_0/lr_self_0/lr_self_0/lr_self_0"
		const l1 = await native.getAttribute(FULL1)
		const l2 = await native.getAttribute(FULL2)

		assert.strictEqual(l1.length, 2)
		assert.strictEqual(l1[0].file_type, 2)
		assert.strictEqual(l1[0].full, FULL1)
		assert.strictEqual(l1[0].base, "")
		assert.strictEqual(l1[0].rltv, FULL1)
		assert.strictEqual(l1[0].name, "lr_self_0")
		assert.strictEqual(l1[0].stem, "lr_self_0")
		assert.strictEqual(l1[0].exte, "")
		assert.strictEqual(l1[0].link_type, 1)
		assert.strictEqual(l1[0].link, ".")

		assert.strictEqual(l1[1].file_type, 1)
		assert.strictEqual(l1[1].full, LINK)
		assert.strictEqual(l1[1].base, "")
		assert.strictEqual(l1[1].rltv, LINK)
		assert.strictEqual(l1[1].name, "LINK")
		assert.strictEqual(l1[1].stem, "LINK")
		assert.strictEqual(l1[1].exte, "")
		assert.strictEqual(l1[1].link_type, 0)
		assert.strictEqual(l1[1].link, null)

		assert.strictEqual(l2.length, 2)
		assert.strictEqual(l2[0].file_type, 2)
		assert.strictEqual(l2[0].full, FULL2)
		assert.strictEqual(l2[0].base, "")
		assert.strictEqual(l2[0].rltv, FULL2)
		assert.strictEqual(l2[0].name, "lr_self_0")
		assert.strictEqual(l2[0].stem, "lr_self_0")
		assert.strictEqual(l2[0].exte, "")
		assert.strictEqual(l2[0].link_type, 1)
		assert.strictEqual(l1[0].link, ".")

		assert.deepStrictEqual(l1[1], l2[1])
	}
	{
		const LINK = TEST + "/LINK"
		const FULL1 = TEST + "/LINK/lr_self_3"
		const FULL2 = TEST + "/LINK/lr_self_3/lr_self_3/lr_self_3/lr_self_3/lr_self_3"
		const l1 = await native.getAttribute(FULL1)
		const l2 = await native.getAttribute(FULL2)

		assert.strictEqual(l1.length, 2)
		assert.strictEqual(l1[0].file_type, 2)
		assert.strictEqual(l1[0].full, FULL1)
		assert.strictEqual(l1[0].base, "")
		assert.strictEqual(l1[0].rltv, FULL1)
		assert.strictEqual(l1[0].name, "lr_self_3")
		assert.strictEqual(l1[0].stem, "lr_self_3")
		assert.strictEqual(l1[0].exte, "")
		assert.strictEqual(l1[0].link_type, 1)
		assert.strictEqual(l1[0].link, "../LINK")

		assert.strictEqual(l1[1].file_type, 1)
		assert.strictEqual(l1[1].full, LINK)
		assert.strictEqual(l1[1].base, "")
		assert.strictEqual(l1[1].rltv, LINK)
		assert.strictEqual(l1[1].name, "LINK")
		assert.strictEqual(l1[1].stem, "LINK")
		assert.strictEqual(l1[1].exte, "")
		assert.strictEqual(l1[1].link_type, 0)
		assert.strictEqual(l1[1].link, null)

		assert.strictEqual(l2.length, 2)
		assert.strictEqual(l2[0].file_type, 2)
		assert.strictEqual(l2[0].full, FULL2)
		assert.strictEqual(l2[0].base, "")
		assert.strictEqual(l2[0].rltv, FULL2)
		assert.strictEqual(l2[0].name, "lr_self_3")
		assert.strictEqual(l2[0].stem, "lr_self_3")
		assert.strictEqual(l2[0].exte, "")
		assert.strictEqual(l2[0].link_type, 1)
		assert.strictEqual(l1[0].link, "../LINK")

		assert.deepStrictEqual(l1[1], l2[1])
	}
	{
		const FULL = TEST + "/LINK/lr3_target"
		const l = await native.getAttribute(FULL)

		assert.strictEqual(l.length, 4)
		assert.strictEqual(l[0].full, FULL)
		assert.strictEqual(l[0].link, "lr2_target")
		assert.strictEqual(l[1].full, TEST + "/LINK/lr2_target")
		assert.strictEqual(l[1].link, "lr1_target")
		assert.strictEqual(l[2].full, TEST + "/LINK/lr1_target")
		assert.strictEqual(l[2].link, "target")
		assert.strictEqual(l[3].full, TEST + "/LINK/target")
		assert.strictEqual(l[3].link, null)
	}
	{
		const FULLX = TEST + "/LINK/lr_loop_x"
		const FULLY = TEST + "/LINK/lr_loop_y"
		const lx = await native.getAttribute(FULLX)
		const ly = await native.getAttribute(FULLY)

		assert.strictEqual(lx.length, 3)
		assert.strictEqual(ly.length, 3)
		assert.strictEqual(lx[0].full, FULLX)
		assert.strictEqual(ly[0].full, FULLY)
		assert.deepStrictEqual(lx[0], ly[1])
		assert.deepStrictEqual(lx[1], ly[0])
		assert.deepStrictEqual(lx[2], ly[2])
		assert.strictEqual(lx[2], null)
		assert.strictEqual(ly[2], null)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_link)")
	})
}
catch (err) {
	console.error(err)
}
