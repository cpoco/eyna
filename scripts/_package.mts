import * as ep from "@electron/packager"
import fs from "node:fs"
import path from "node:path"
import * as tar from "tar"

import package_json from "../build/package.json" with { type: "json" }

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")
const __dist = path.join(__top, "dist")

function processPlatformIcon() {
	if (process.platform === "win32") {
		return path.join(__top, "src", "app", "asset", "icon.ico")
	}
	else if (process.platform === "darwin") {
		return path.join(__top, "src", "app", "asset", "icon.icns")
	}
	throw new Error("unsupported os")
}

export async function Package() {
	await ep.packager({
		dir: __build,
		out: __dist,
		asar: false,
		icon: processPlatformIcon(),
		electronZipDir: path.join(__top, "cache", "dist"),
		afterComplete: ep.serialHooks([
			async (options) => {
				if (options.platform === "win32") {
					for await (const p of fs.promises.glob(options.buildPath + "/locales/*.pak")) {
						if (path.basename(p) === "en-US.pak") {
							continue
						}
						await fs.promises.rm(p, { recursive: true, force: true })
					}
				}
				else if (options.platform === "darwin") {
					for await (const p of fs.promises.glob(options.buildPath + "/*.app/Contents/Resources/*.lproj")) {
						if (path.basename(p) === "en.lproj") {
							continue
						}
						await fs.promises.rm(p, { recursive: true, force: true })
					}
				}
			},
			async (options) => {
				const tgz = `${path.basename(options.buildPath)}-${package_json.version}.tar.gz`
				await tar.create(
					{
						gzip: true,
						file: path.join(path.dirname(options.buildPath), tgz),
						cwd: path.dirname(options.buildPath),
					},
					[path.basename(options.buildPath)],
				)
			},
		]),
	})
}
