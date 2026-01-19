const spawn = require("node:child_process").spawn
const platform = require("node:process").platform

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active === null || ex.active.cursor === null) {
		return
	}
	const full = ex.active.cursor[0].full

	if (platform === "win32") {
		spawn(ex.util.home("AppData", "Local", "Fork", "current", "Fork.exe"), ["open", full], { detached: true })
	}
	else if (platform === "darwin") {
		spawn("/usr/local/bin/fork", ["open", full], { detached: true })
	}
}
