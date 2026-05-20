import * as el from "./_electron.mts"

import electron from "../node_modules/electron/package.json" with { type: "json" }

try {
	console.log(`\x1b[34msetup-electron download ${electron.version}\x1b[0m`)
	await el.Download(electron.version)

	console.log(`\x1b[34msetup-electron extract ${electron.version}\x1b[0m`)
	await el.Extract(electron.version)

	console.log(`\x1b[34msetup-electron complete\x1b[0m`)
}
catch (err) {
	console.error(err)
	process.exit(1)
}
