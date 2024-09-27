import { spawn } from "node:child_process"
import { platform } from "node:process"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0]!.full

	if (platform == "win32") {
		spawn(ex.util.home("AppData", "Local", "Fork", "Fork.exe"), ["open", full], { detached: true })
	}
	else if (platform == "darwin") {
		spawn("/usr/local/bin/fork", ["open", full], { detached: true })
	}
}
