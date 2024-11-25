import child_process from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

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
	await fs.mkdir(sort)
	for (let i = 0; i < 10; i++) {
		await fs.writeFile(path.join(sort, "" + i), path.join(sort, "" + i))
		await fs.writeFile(path.join(sort, "0" + i), path.join(sort, "0" + i))
		await fs.writeFile(path.join(sort, "1" + i), path.join(sort, "1" + i))
		await fs.writeFile(path.join(sort, "2" + i), path.join(sort, "2" + i))
		await fs.writeFile(path.join(sort, "00" + i), path.join(sort, "00" + i))
		await fs.writeFile(path.join(sort, "01" + i), path.join(sort, "01" + i))
	}
	await fs.writeFile(path.join(sort, "０"), path.join(sort, "０"))
	await fs.writeFile(path.join(sort, "１"), path.join(sort, "１"))
	await fs.writeFile(path.join(sort, "２"), path.join(sort, "２"))
	await fs.writeFile(path.join(sort, "００"), path.join(sort, "００"))
	await fs.writeFile(path.join(sort, "０１"), path.join(sort, "０１"))
	await fs.writeFile(path.join(sort, "０２"), path.join(sort, "０２"))
}

{
	const emoji = path.join(wd, "EMOJI")
	await fs.mkdir(emoji)
	await fs.mkdir(path.join(emoji, "⭐"))
	await fs.mkdir(path.join(emoji, "🌈"))
	await fs.mkdir(path.join(emoji, "🧪"))
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
	await fs.symlink(link, path.join(link, "la_self_0"))
	await fs.symlink(link + "/", path.join(link, "la_self_1"))
	await fs.symlink(link + "/.", path.join(link, "la_self_2"))
	await fs.symlink(".", path.join(link, "lr_self_0"))
	await fs.symlink("./", path.join(link, "lr_self_1"))
	await fs.symlink("./.", path.join(link, "lr_self_2"))

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

function make(target, create) {
	if (process.platform == "win32") {
		make_shortcut(target, create + ".lnk")
	}
	else if (process.platform == "darwin") {
		make_bookmark(target, create + ".alias")
	}
}

function make_shortcut(target, create) {
	target = path.win32.normalize(target)
	create = path.win32.normalize(create)
	const script = `$WshShell = New-Object -ComObject WScript.Shell;
$ShortCut = $WshShell.CreateShortcut("${create}");
$ShortCut.TargetPath = "${target}";
$ShortCut.Save();`
	child_process.execSync(script, { "shell": "powershell.exe" })
}

function make_bookmark(target, create) {
	target = path.normalize(target)
	create = path.normalize(create)
	const script = `tell application "Finder"
	make new alias to (POSIX file "${target}") at (POSIX file "${path.dirname(create)}")
	set name of result to "${path.basename(create)}"
end tell`
	child_process.execSync(`osascript -e '${script}'`)
}
