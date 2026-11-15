import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import child_process from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path/posix"

import { ERROR, TEST } from "./_util.mts"

const git = (cwd: string, ...args: string[]) => {
	child_process.execFileSync(
		"git",
		[
			"-c",
			"user.name=eyna",
			"-c",
			"user.email=eyna@example.com",
			"-c",
			"commit.gpgsign=false",
			"-c",
			"protocol.file.allow=always",
			...args,
		],
		{ cwd, stdio: "pipe" },
	)
}

const has = (flags: number, flag: number) => (flags & flag) !== 0

const main = async () => {
	const SRC = path.join(TEST, "git_src")
	const DIR = path.join(TEST, "git")

	await fs.rm(SRC, { recursive: true, force: true })
	await fs.rm(DIR, { recursive: true, force: true })

	await native.createDirectory(SRC)
	await native.createFile(path.join(SRC, "readme.txt"))
	git(SRC, "init", "-q")
	git(SRC, "add", "-A")
	git(SRC, "commit", "-q", "-m", "init")

	await native.createDirectory(DIR)
	await native.createDirectory(path.join(DIR, "sub"))
	await fs.writeFile(path.join(DIR, ".gitignore"), "ignored.txt\nignored_dir/\n")
	await fs.writeFile(path.join(DIR, "tracked.txt"), "a")
	await fs.writeFile(path.join(DIR, "modified.txt"), "a")
	await fs.writeFile(path.join(DIR, "sub", "inner.txt"), "a")
	git(DIR, "init", "-q")
	git(DIR, "submodule", "add", "-q", SRC, "sub_module")
	git(DIR, "add", "-A")
	git(DIR, "commit", "-q", "-m", "init")

	await fs.writeFile(path.join(DIR, "modified.txt"), "b")
	await fs.writeFile(path.join(DIR, "staged_new.txt"), "a")
	git(DIR, "add", "staged_new.txt")
	await fs.writeFile(path.join(DIR, "untracked.txt"), "a")
	await fs.writeFile(path.join(DIR, "ignored.txt"), "a")
	await native.createDirectory(path.join(DIR, "ignored_dir"))
	await fs.writeFile(path.join(DIR, "ignored_dir", "child.txt"), "a")
	await native.createDirectory(path.join(DIR, "new_dir"))
	await fs.writeFile(path.join(DIR, "new_dir", "child.txt"), "a")
	await native.createDirectory(path.join(DIR, "empty_dir"))

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 0)
		assert(!("git" in d))
		for (const item of d.list) {
			assert(!("git" in item))
		}
	}

	{
		const info = await native.getGit(DIR)
		assert.strictEqual(info.wdir, DIR)
		assert(info.brch.startsWith("refs/heads/"))
		const g = info.status
		assert.strictEqual(g[path.join(DIR, "tracked.txt")], 0)
		assert.strictEqual(g[path.join(DIR, ".gitignore")], 0)
		assert.strictEqual(g[path.join(DIR, "sub")], 0)
		assert(has(g[path.join(DIR, "modified.txt")]!, native.Git.WT_MODIFIED))
		assert(has(g[path.join(DIR, "staged_new.txt")]!, native.Git.IX_NEW))
		assert(has(g[path.join(DIR, "untracked.txt")]!, native.Git.WT_NEW))
		assert(has(g[path.join(DIR, "new_dir")]!, native.Git.WT_NEW))
		assert(has(g[path.join(DIR, "ignored.txt")]!, native.Git.IGNORED))
		assert(has(g[path.join(DIR, "ignored_dir")]!, native.Git.IGNORED))
		assert(has(g[path.join(DIR, "empty_dir")]!, native.Git.PHANTOM))
		assert(has(g[path.join(DIR, "sub_module")]!, native.Git.SUBMODULE))
		assert.strictEqual(g[path.join(DIR, ".git")], native.Git.INTERNAL)
		assert.strictEqual(g[path.join(DIR, "sub", "inner.txt")], undefined)
	}

	{
		const g = (await native.getGit(DIR, "", 1)).status
		assert.strictEqual(g[path.join(DIR, "sub", "inner.txt")], 0)
		assert(has(g[path.join(DIR, "new_dir", "child.txt")]!, native.Git.WT_NEW))
		assert(has(g[path.join(DIR, "ignored_dir", "child.txt")]!, native.Git.IGNORED))
		assert(has(g[path.join(DIR, ".git", "HEAD")]!, native.Git.INTERNAL))
		assert.strictEqual(g[path.join(DIR, "sub_module", "readme.txt")], 0)
	}

	{
		const g = (await native.getGit(DIR, "", 1, /\.txt$/)).status
		assert.strictEqual(g[path.join(DIR, "sub", "inner.txt")], 0)
		assert.strictEqual(g[path.join(DIR, "sub")], undefined)
		assert.strictEqual(g[path.join(DIR, ".git")], undefined)
	}

	for (const base of ["", DIR]) {
		const d = await native.getDirectory(DIR, base, native.Sort.DepthFirst, 1)
		const g = (await native.getGit(DIR, base, 1)).status
		assert.deepStrictEqual(Object.keys(g).sort(), d.list.map((v) => v.rltv).sort())
	}

	{
		const g = (await native.getGit(DIR, DIR, 0)).status
		assert.strictEqual(g["tracked.txt"], 0)
		assert(has(g["modified.txt"]!, native.Git.WT_MODIFIED))
	}

	{
		const g = (await native.getGit(path.join(DIR, "sub"), "", 0)).status
		assert.deepStrictEqual(Object.keys(g), [path.join(DIR, "sub", "inner.txt")])
		assert.strictEqual(g[path.join(DIR, "sub", "inner.txt")], 0)
	}

	{
		const g = (await native.getGit(path.join(DIR, "ignored_dir"), "", 0)).status
		assert(has(g[path.join(DIR, "ignored_dir", "child.txt")]!, native.Git.IGNORED))
	}

	{
		const g = (await native.getGit(path.join(DIR, ".git"), "", 0)).status
		assert(0 < Object.keys(g).length)
		for (const v of Object.values(g)) {
			assert.strictEqual(v, native.Git.INTERNAL)
		}
	}

	{
		const info = await native.getGit(TEST)
		assert.strictEqual(info.wdir, "")
		assert.strictEqual(info.brch, "")
		assert.deepStrictEqual(Object.keys(info.status), [])
	}

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getGit(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
	}
	await assert.rejects(
		async () => await native.getGit(DIR, "", 101),
		(err) => err === ERROR.INVALID_ARGUMENT,
	)
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_git)")
	})
}
catch (err) {
	console.error(err)
}
