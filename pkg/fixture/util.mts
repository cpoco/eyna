import child_process from "node:child_process"
import path from "node:path"

export function make(target: string, create: string) {
	if (process.platform == "win32") {
		make_shortcut(target, create + ".lnk")
	}
	else if (process.platform == "darwin") {
		make_bookmark(target, create + ".alias")
	}
}

function make_shortcut(target: string, create: string) {
	target = path.win32.normalize(target)
	create = path.win32.normalize(create)
	const script = `$WshShell = New-Object -ComObject WScript.Shell;
$ShortCut = $WshShell.CreateShortcut("${create}");
$ShortCut.TargetPath = "${target}";
$ShortCut.Save();`
	child_process.execSync(script, { "shell": "powershell.exe" })
}

function make_bookmark(target: string, create: string) {
	target = path.normalize(target)
	create = path.normalize(create)
	const script = `tell application "Finder"
	make new alias to (POSIX file "${target}") at (POSIX file "${path.dirname(create)}")
	set name of result to "${path.basename(create)}"
end tell`
	child_process.execSync(`osascript -e '${script}'`)
}
