import { spawn } from "node:child_process"
import { platform } from "node:process"
;(async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0]!.full

	if (platform == "win32") {
		spawn("C:/Program Files/Microsoft VS Code/Code.exe", ["-n", full], { detached: true })
	}
	else if (platform == "darwin") {
		spawn("/usr/local/bin/code", ["-n", full])
	}
})
