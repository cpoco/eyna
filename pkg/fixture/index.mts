#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"

import { make } from "./util.mts"

if (process.platform == "win32") {
	var wd = path.join("C:", "Users", "Public", "eyna test")
}
else if (process.platform == "darwin") {
	var wd = path.join("/", "Users", "Shared", "eyna test")
}
else {
	process.exit()
}

await fs.rm(wd, { recursive: true, force: true })
await fs.mkdir(wd, { recursive: true })

console.log(`test fixture creating: ${wd}`)

const dd = [
	".でぃれくとり",
	".ディレクトリ",
	"でぃれくとり",
	"ディレクトリ",
]
for (const d of dd) {
	await fs.mkdir(path.join(wd, d))
	await fs.writeFile(path.join(wd, d, "file"), path.join(wd, d, "file"))
}

const ff = [
	".ふぁいる",
	".ファイル",
	"ふぁいる",
	"ファイル",
]
for (const f of ff) {
	await fs.writeFile(path.join(wd, f), f)
}

{
	const sort = path.join(wd, "SORT")
	const ary = [
		"０",
		"１",
		"２",
		"００",
		"０１",
		"０２",
	]
	for (let i = 0; i < 10; i++) {
		ary.push("" + i)
		ary.push("0" + i)
		ary.push("1" + i)
		ary.push("2" + i)
		ary.push("00" + i)
		ary.push("01" + i)
		ary.push("02" + i)
	}
	await fs.mkdir(sort)
	for (const v1 of ary) {
		await fs.mkdir(path.join(sort, v1))
		for (const v2 of ary) {
			await fs.writeFile(path.join(sort, v1, v2), path.join(sort, v1, v2))
		}
	}
}

{
	const dot = path.join(wd, "DOT")
	const ary = [
		" .",
		". ",
		" . ",
		" ..",
		".. ",
		" .. ",
		"...",
		" ...",
		"... ",
		" ... ",
		"....",
		" ....",
		".... ",
		" .... ",
	]
	await fs.mkdir(dot)
	for (const v1 of ary) {
		await fs.mkdir(path.join(dot, v1))
		for (const v2 of ary) {
			await fs.writeFile(path.join(dot, v1, v2), path.join(dot, v1, v2))
		}
	}
}

{
	const emoji = path.join(wd, "EMOJI")
	const ary = [
		"⭐",
		"🌈",
		"🏳️",
		"🧪",
	]
	await fs.mkdir(emoji)
	for (const v1 of ary) {
		await fs.mkdir(path.join(emoji, v1))
		for (const v2 of ary) {
			await fs.writeFile(path.join(emoji, v1, v2), path.join(emoji, v1, v2))
		}
	}
}

{
	const emoji = path.join(wd, "EMOJI-ZWJ")
	const ary = [
		"🍋‍🟩",
		"🏳️‍🌈",
		"👁️‍🗨️",
		"🐦‍🔥",
		"😮‍💨",
		"😵‍💫",
		"😶‍🌫️",
		"🙂‍↔️",
		"🙂‍↕️",
	]
	await fs.mkdir(emoji)
	for (const v1 of ary) {
		await fs.mkdir(path.join(emoji, v1))
		for (const v2 of ary) {
			await fs.writeFile(path.join(emoji, v1, v2), path.join(emoji, v1, v2))
		}
	}
}

{
	const uni = path.join(wd, "UNICODE")
	await fs.mkdir(uni)
	await fs.mkdir(path.join(uni, ".\u{202C}"))
	await fs.mkdir(path.join(uni, "..\u{202C}"))
	await fs.mkdir(path.join(uni, ".\u{202C}."))
	await fs.mkdir(path.join(uni, "..\u{202C}.."))
	await fs.mkdir(path.join(uni, "123 456 789"))
	await fs.mkdir(path.join(uni, "\u{061C}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{200E}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{200F}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{202A}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{202A}123 456 789\u{202C}"))
	await fs.mkdir(path.join(uni, "\u{202B}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{202B}123 456 789\u{202C}"))
	await fs.mkdir(path.join(uni, "\u{2066}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{2066}123 456 789\u{2069}"))
	await fs.mkdir(path.join(uni, "\u{2067}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{2067}123 456 789\u{2069}"))
	await fs.mkdir(path.join(uni, "\u{2068}123 456 789"))
	await fs.mkdir(path.join(uni, "\u{2068}123 456 789\u{2069}"))
	await fs.mkdir(path.join(uni, "でぃれくとり"))
	await fs.mkdir(path.join(uni, "ディレクトリ"))
	await fs.mkdir(path.join(uni, "\u{202D}でぃれくとり"))
	await fs.mkdir(path.join(uni, "\u{202D}ディレクトリ"))
	await fs.mkdir(path.join(uni, "\u{202E}りとくれぃで"))
	await fs.mkdir(path.join(uni, "\u{202E}リトクレィデ"))
	await fs.mkdir(path.join(uni, "\u{202D}でぃれ\u{202E}りとく"))
	await fs.mkdir(path.join(uni, "\u{202D}ディレ\u{202E}リトク"))
	await fs.writeFile(path.join(uni, "0123456789"), "")
	await fs.writeFile(path.join(uni, "\u{202D}0123456789"), "")
	await fs.writeFile(path.join(uni, "\u{202E}9876543210"), "")
	await fs.writeFile(path.join(uni, "\u{202D}01234\u{202E}98765"), "")
	await fs.symlink(uni + "/0123456789", path.join(uni, "la_0123456789"))
	await fs.symlink(uni + "/\u{202D}0123456789", path.join(uni, "la_\u{202D}0123456789"))
	await fs.symlink(uni + "/\u{202E}9876543210", path.join(uni, "la_\u{202E}9876543210"))
	await fs.symlink(uni + "/\u{202D}01234\u{202E}98765", path.join(uni, "la_\u{202D}01234\u{202E}98765"))
	await fs.symlink("../UNICODE/0123456789", path.join(uni, "lr_0123456789"))
	await fs.symlink("../UNICODE/\u{202D}0123456789", path.join(uni, "lr_\u{202D}0123456789"))
	await fs.symlink("../UNICODE/\u{202E}9876543210", path.join(uni, "lr_\u{202E}9876543210"))
	await fs.symlink("../UNICODE/\u{202D}01234\u{202E}98765", path.join(uni, "lr_\u{202D}01234\u{202E}98765"))
	await fs.symlink(".\u{202C}", path.join(uni, "01"))
	await fs.symlink("..\u{202C}", path.join(uni, "02"))
	await fs.symlink(".\u{202C}.", path.join(uni, "03"))
	await fs.symlink("..\u{202C}..", path.join(uni, "04"))
}

{
	const html = path.join(wd, "HTML")
	await fs.mkdir(html)
	await fs.mkdir(path.join(html, "white        space"))
	await fs.writeFile(path.join(html, "white        space", "white        space"), "white        space")
}

{
	const link = path.join(wd, "LINK")
	await fs.mkdir(link)
	for (const f of ff) {
		await fs.symlink("../" + f, path.join(link, f))
	}

	await fs.symlink(link, path.join(link, "la_self_0"))
	await fs.symlink(link + "/", path.join(link, "la_self_1"))
	await fs.symlink(link + "/.", path.join(link, "la_self_2"))
	await fs.symlink(".", path.join(link, "lr_self_0"))
	await fs.symlink("./", path.join(link, "lr_self_1"))
	await fs.symlink("./.", path.join(link, "lr_self_2"))
	await fs.symlink("../LINK", path.join(link, "lr_self_3"))
	await fs.symlink("../LINK/", path.join(link, "lr_self_4"))
	await fs.symlink("../LINK/.", path.join(link, "lr_self_5"))

	await fs.symlink(link + "/..", path.join(link, "la_parent_0"))
	await fs.symlink(link + "/../", path.join(link, "la_parent_1"))
	await fs.symlink(link + "/../.", path.join(link, "la_parent_2"))
	await fs.symlink("..", path.join(link, "lr_parent_0"))
	await fs.symlink("../", path.join(link, "lr_parent_1"))
	await fs.symlink("../.", path.join(link, "lr_parent_2"))

	await fs.symlink(link + "/error", path.join(link, "la_error_0"))
	await fs.symlink(link + "/error/", path.join(link, "la_error_1"))
	await fs.symlink(link + "/error/.", path.join(link, "la_error_2"))
	await fs.symlink("error", path.join(link, "lr_error_0"))
	await fs.symlink("error/", path.join(link, "lr_error_1"))
	await fs.symlink("error/.", path.join(link, "lr_error_2"))

	await fs.symlink("lr_loop_y", path.join(link, "lr_loop_x"))
	await fs.symlink("lr_loop_x", path.join(link, "lr_loop_y"))

	await fs.writeFile(path.join(link, "target"), path.join(link, "target"))
	await fs.symlink("target", path.join(link, "lr1_target"))
	await fs.symlink("lr1_target", path.join(link, "lr2_target"))
	await fs.symlink("lr2_target", path.join(link, "lr3_target"))
	await fs.symlink("error", path.join(link, "lr1_error"))
	await fs.symlink("lr1_error", path.join(link, "lr2_error"))
	await fs.symlink("lr2_error", path.join(link, "lr3_error"))
}

{
	const jump = path.join(wd, "JUMP")
	await fs.mkdir(jump)
	await fs.mkdir(path.join(jump, "dir"))
	await fs.writeFile(path.join(jump, "file"), path.join(jump, "file"))
	await fs.symlink("dir", path.join(jump, "lr_dir"))
	await fs.symlink("file", path.join(jump, "lr_file"))

	make(wd, path.join(jump, "parent"))
	make(path.join(jump, "dir"), path.join(jump, "dir"))
	make(path.join(jump, "file"), path.join(jump, "file"))
	make(path.join(jump, "lr_dir"), path.join(jump, "lr_dir"))
	make(path.join(jump, "lr_file"), path.join(jump, "lr_file"))
}

console.log("done")
