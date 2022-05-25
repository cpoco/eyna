import fs from "fs-extra"
import child_process from "node:child_process"
import path from "node:path"

const wd = path.join("/", "Users", "Shared", "eyna test")

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

await fs.symlink(".", path.join(wd, "self_0"))
await fs.symlink("./", path.join(wd, "self_1"))
await fs.symlink(wd, path.join(wd, "self_2"))
await fs.symlink(wd + "/", path.join(wd, "self_3"))

await fs.symlink("..", path.join(wd, "parent_0"))
await fs.symlink("../", path.join(wd, "parent_1"))
await fs.symlink(wd + "/..", path.join(wd, "parent_2"))
await fs.symlink(wd + "/../", path.join(wd, "parent_3"))

await fs.symlink("error", path.join(wd, "ln_error_0"))
await fs.symlink("./error", path.join(wd, "ln_error_1"))
await fs.symlink("../error", path.join(wd, "ln_error_2"))
await fs.symlink("ln_error_0", path.join(wd, "ln_ln_error_0"))
await fs.symlink("ln_ln_error_0", path.join(wd, "ln_ln_ln_error_0"))

await fs.symlink("ln_loop_y", path.join(wd, "ln_loop_x"))
await fs.symlink("ln_loop_x", path.join(wd, "ln_loop_y"))

make_alias(path.join(wd, "d0"), path.join(wd, "d0_alias"))
await fs.symlink("d0_alias", path.join(wd, "d0_alias_ln"))
make_alias(path.join(wd, "f0"), path.join(wd, "f0_alias"))
await fs.symlink("f0_alias", path.join(wd, "f0_alias_ln"))

function make_alias(src, out) {
	let script = `tell application "Finder"
	make new alias to (POSIX file "${src}") at (POSIX file "${path.dirname(out)}")
	set name of result to "${path.basename(out)}"
end tell`
	child_process.execSync(`osascript -e '${script}'`)
}
