import * as child_process from "node:child_process"
import * as process from "node:process"

export default async (ex: Extension): Promise<void> => {
	if (process.platform == "win32") {
		child_process.spawn("wt", ["-p", "cmd", "-d", ex.active.wd], { detached: true })
	}
	else if (process.platform == "darwin") {
		child_process.spawn("open", ["-F", "-a", "Terminal", ex.active.wd])
	}
}
