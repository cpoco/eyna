import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"
// import os from "node:os"

import electron from "electron"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

async function start(): Promise<void> {
	var proc: child_process.ChildProcess | null = null

	if (typeof electron !== "string" || !fs.existsSync(electron)) {
		throw new Error("not found electron")
	}

	process
		.on("SIGINT", () => {
			if (proc && !proc?.killed) {
				proc.kill("SIGINT")
			}
		})
		.on("SIGTERM", () => {
			if (proc && !proc?.killed) {
				proc.kill("SIGTERM")
			}
		})

	return new Promise((resolve, reject) => {
		proc = child_process.spawn(
			electron as unknown as string,
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
				if (code === 0) {
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

Promise.resolve()
	.then(() => {
		return start()
	})
	.then(() => {
		/*
		if (process.platform === "win32") {
			const dir = path.join(os.homedir(), "AppData", "Roaming", "Electron")
			if (fs.existsSync(dir)) {
				fs.rmSync(dir, { recursive: true, force: true })
				console.log(`removed: ${dir}`)
			}
		}
		else if (process.platform === "darwin") {
			const dir = path.join(os.homedir(), "Library", "Application Support", "Electron")
			if (fs.existsSync(dir)) {
				fs.rmSync(dir, { recursive: true, force: true })
				console.log(`removed: ${dir}`)
			}
		}
		*/
		return Promise.resolve()
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
