import * as child_process from "node:child_process"
import * as process from "node:process"

export default async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0].full

	if (process.platform == "win32") {
		child_process.spawn("C:/Program Files/Microsoft VS Code/Code.exe", ["-n", full], { detached: true })
	}
	else if (process.platform == "darwin") {
		child_process.spawn("/usr/local/bin/code", ["-n", full])
	}
}
