import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import fs from "node:fs/promises"
import path from "node:path/posix"

import { ERROR, TEST } from "./_util.cts"

const main = async () => {
	const DIR = path.join(TEST, "depth")

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(path.join(DIR))

	await native.createDirectory(path.join(DIR, "depth_0", "depth_1", "depth_2", "depth_3", "depth_4"))
	await native.createFile(path.join(DIR, "01"))
	await native.createFile(path.join(DIR, "02"))
	await native.createFile(path.join(DIR, "depth_0", "01"))
	await native.createFile(path.join(DIR, "depth_0", "02"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "01"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "02"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "01"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "02"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "depth_3", "01"))
	await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "depth_3", "02"))
	await assert.rejects(
		async () =>
			await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "depth_3", "depth_4", "depth_5", "01")),
		(err) => err === ERROR.FAILED,
	)
	await assert.rejects(
		async () =>
			await native.createFile(path.join(DIR, "depth_0", "depth_1", "depth_2", "depth_3", "depth_4", "depth_5", "02")),
		(err) => err === ERROR.FAILED,
	)

	{
		const d1 = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 0)
		const d2 = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 0)
		assert.deepEqual(d1.list.length, 3)
		assert.deepEqual(d1.s, 0n)
		assert.deepEqual(d1.d, 1)
		assert.deepEqual(d1.f, 2)
		assert.deepEqual(d1.e, 0)
		assert.deepStrictEqual(d1, d2)
	}

	{
		const d1 = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1)
		const d2 = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1)
		assert.deepEqual(d1.list.length, 6)
		assert.deepEqual(d1.s, 0n)
		assert.deepEqual(d1.d, 2)
		assert.deepEqual(d1.f, 4)
		assert.deepEqual(d1.e, 0)
		assert.deepStrictEqual(d1, d2)
	}

	{
		const d1 = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 2)
		const d2 = await native.getDirectory(DIR + "/", "", native.Sort.DepthFirst, 2)
		assert.deepEqual(d1.full, DIR)
		assert.deepEqual(d1.base, "")
		assert.deepEqual(d1.list.length, 9)
		assert.deepEqual(d1.list[0].rltv, path.join(DIR, "01"))
		assert.deepEqual(d1.list[1].rltv, path.join(DIR, "02"))
		assert.deepEqual(d1.list[2].rltv, path.join(DIR, "depth_0"))
		assert.deepEqual(d1.list[3].rltv, path.join(DIR, "depth_0", "01"))
		assert.deepEqual(d1.list[4].rltv, path.join(DIR, "depth_0", "02"))
		assert.deepEqual(d1.list[5].rltv, path.join(DIR, "depth_0", "depth_1"))
		assert.deepEqual(d1.list[6].rltv, path.join(DIR, "depth_0", "depth_1", "01"))
		assert.deepEqual(d1.list[7].rltv, path.join(DIR, "depth_0", "depth_1", "02"))
		assert.deepEqual(d1.list[8].rltv, path.join(DIR, "depth_0", "depth_1", "depth_2"))
		assert.deepEqual(d1.s, 0n)
		assert.deepEqual(d1.d, 3)
		assert.deepEqual(d1.f, 6)
		assert.deepEqual(d1.e, 0)
		assert.deepStrictEqual(d1, d2)
	}

	{
		const d1 = await native.getDirectory(DIR, "", native.Sort.ShallowFirst, 2)
		const d2 = await native.getDirectory(DIR + "/", "", native.Sort.ShallowFirst, 2)
		assert.deepEqual(d1.full, DIR)
		assert.deepEqual(d1.base, "")
		assert.deepEqual(d1.list.length, 9)
		assert.deepEqual(d1.list[0].rltv, path.join(DIR, "01"))
		assert.deepEqual(d1.list[1].rltv, path.join(DIR, "02"))
		assert.deepEqual(d1.list[2].rltv, path.join(DIR, "depth_0", "01"))
		assert.deepEqual(d1.list[3].rltv, path.join(DIR, "depth_0", "02"))
		assert.deepEqual(d1.list[4].rltv, path.join(DIR, "depth_0", "depth_1", "01"))
		assert.deepEqual(d1.list[5].rltv, path.join(DIR, "depth_0", "depth_1", "02"))
		assert.deepEqual(d1.list[6].rltv, path.join(DIR, "depth_0", "depth_1", "depth_2"))
		assert.deepEqual(d1.list[7].rltv, path.join(DIR, "depth_0", "depth_1"))
		assert.deepEqual(d1.list[8].rltv, path.join(DIR, "depth_0"))
		assert.deepEqual(d1.s, 0n)
		assert.deepEqual(d1.d, 3)
		assert.deepEqual(d1.f, 6)
		assert.deepEqual(d1.e, 0)
		assert.deepStrictEqual(d1, d2)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_compare)")
	})
}
catch (err) {
	console.error(err)
}
