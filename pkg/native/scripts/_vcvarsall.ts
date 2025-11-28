import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const msvc32 = path.join("C:", "Program Files (x86)", "Microsoft Visual Studio", "2022")
const msvc64 = path.join("C:", "Program Files", "Microsoft Visual Studio", "2022")

const github = path.join(msvc32, "BuildTools", "VC", "Auxiliary", "Build", "vcvarsall.bat")
const enterprise = path.join(msvc64, "Enterprise", "VC", "Auxiliary", "Build", "vcvarsall.bat")
const professional = path.join(msvc64, "Professional", "VC", "Auxiliary", "Build", "vcvarsall.bat")
const community = path.join(msvc64, "Community", "VC", "Auxiliary", "Build", "vcvarsall.bat")

const names = ["PATH", "INCLUDE", "LIB", "LIBPATH"]

export async function setVsCmdEnv(): Promise<void> {
	if (process.platform !== "win32" || process.env.VSCMD_VER) {
		return Promise.resolve()
	}

	for (const bat of [github, enterprise, professional, community]) {
		if (!fs.existsSync(bat)) {
			continue
		}

		return new Promise<void>((resolve, reject) => {
			child_process.exec(`"${bat}" x64 && set`, { shell: "cmd" }, (error, stdout, stderr) => {
				if (error) {
					console.error(stderr)
					reject(error)
					return
				}

				for (const line of stdout.split(/\r?\n/u)) {
					const match = line.match(/^([^=]+)=(.*)$/u)
					if (match && match.length == 3 && names.includes(match[1])) {
						process.env[match[1]] = match[2]
					}
					if (match && match.length == 3) {
						console.log("ENV", match[1], match[2].split(path.delimiter))
					}
				}

				console.log("   PATH", (process.env.PATH ?? "").split(path.delimiter))
				console.log("INCLUDE", (process.env.INCLUDE ?? "").split(path.delimiter))
				console.log("    LIB", (process.env.LIB ?? "").split(path.delimiter))
				console.log("LIBPATH", (process.env.LIBPATH ?? "").split(path.delimiter))

				resolve()
			})
		})
	}

	throw new Error("no found vcvarsall.bat")
}
