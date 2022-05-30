import fs from "fs-extra"
import child_process from "node:child_process"
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

if (fs.existsSync(wd)) {
	await fs.rm(wd, { recursive: true })
}
await fs.mkdirp(wd)

const dd = [
	"d0",
	"d1",
	"d2",
	"d10",
	"d11",
	"d12",
	"でぃれくとり",
	"ディレクトリ",
]
for (const d of dd) {
	await fs.mkdir(path.join(wd, d))
}

const ff = [
	"f0",
	"f1",
	"f2",
	"f10",
	"f11",
	"f12",
	"ふぁいる",
	"ファイル",
]
for (const f of ff) {
	await fs.writeFile(path.join(wd, f), f)
}

await fs.mkdir(path.join(wd, "RLO"))
await fs.writeFile(path.join(wd, "RLO", "0123456789"), "0123456789")
await fs.writeFile(path.join(wd, "RLO", "\u{202E}9876543210"), "\u{202E}9876543210")
await fs.symlink("../RLO/0123456789", path.join(wd, "RLO", "lr_0123456789"))
await fs.symlink("../RLO/\u{202E}9876543210", path.join(wd, "RLO", "lr_\u{202E}9876543210"))

await fs.symlink(wd, path.join(wd, "la_self_0"))
await fs.symlink(wd + "/", path.join(wd, "la_self_1"))
await fs.symlink(wd + "/.", path.join(wd, "la_self_2"))
await fs.symlink(".", path.join(wd, "lr_self_0"))
await fs.symlink("./", path.join(wd, "lr_self_1"))
await fs.symlink("./.", path.join(wd, "lr_self_2"))

await fs.symlink(wd + "/..", path.join(wd, "la_parent_0"))
await fs.symlink(wd + "/../", path.join(wd, "la_parent_1"))
await fs.symlink(wd + "/../.", path.join(wd, "la_parent_2"))
await fs.symlink("..", path.join(wd, "lr_parent_0"))
await fs.symlink("../", path.join(wd, "lr_parent_1"))
await fs.symlink("../.", path.join(wd, "lr_parent_2"))

await fs.symlink(wd + "/error", path.join(wd, "la_error_0"))
await fs.symlink(wd + "/error/", path.join(wd, "la_error_1"))
await fs.symlink(wd + "/error/.", path.join(wd, "la_error_2"))
await fs.symlink("error", path.join(wd, "lr_error_0"))
await fs.symlink("error/", path.join(wd, "lr_error_1"))
await fs.symlink("error/.", path.join(wd, "lr_error_2"))

await fs.symlink("lr_loop_y", path.join(wd, "lr_loop_x"))
await fs.symlink("lr_loop_x", path.join(wd, "lr_loop_y"))

if (process.platform == "win32") {
	make_shortcut(path.join(wd, "d0"), path.join(wd, "d0.lnk"))
	make_shortcut(path.join(wd, "f0"), path.join(wd, "f0.lnk"))
}
else if (process.platform == "darwin") {
	make_bookmark(path.join(wd, "d0"), path.join(wd, "d0.alias"))
	make_bookmark(path.join(wd, "f0"), path.join(wd, "f0.alias"))
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
