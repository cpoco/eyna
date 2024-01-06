import { spawn } from "node:child_process"
import { platform } from "node:process"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}
	if (platform == "win32") {
		spawn("wt", ["-p", "cmd", "-d", ex.active.wd], { detached: true })
	}
	else if (platform == "darwin") {
		spawn("open", ["-F", "-a", "Terminal", ex.active.wd])
	}
}
