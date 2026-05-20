import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import * as el from "./_electron.mts"

import electron from "../node_modules/electron/package.json" with { type: "json" }

const __top = path.join(import.meta.dirname, "..")

async function start(): Promise<void> {
	var proc: child_process.ChildProcess | null = null

	const electronBin = el.ExecPath(electron.version)

	if (!fs.existsSync(electronBin)) {
		throw new Error("not found electron")
	}

	process
		.on("SIGINT", () => {
			if (proc && !proc.killed) {
				proc.kill("SIGINT")
			}
		})
		.on("SIGTERM", () => {
			if (proc && !proc.killed) {
				proc.kill("SIGTERM")
			}
		})

	return new Promise((resolve, reject) => {
		proc = child_process.spawn(
			electronBin,
			[
				path.join(__top, "build"),
			],
			{
				stdio: "inherit",
				cwd: __top,
				windowsHide: false,
			},
		)
			.on("close", (code, signal) => {
				if (code === 0 || signal === "SIGINT" || signal === "SIGTERM") {
					resolve()
				}
				else if (signal) {
					reject(new Error(`signal ${signal}`))
				}
				else {
					reject(new Error(`exit code ${code}`))
				}
			})
			.on("error", (err) => {
				reject(err)
			})
	})
}

try {
	await start()
}
catch (err) {
	console.error(err)
	process.exit(1)
}
