import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const msvc = path.join("C:", "Program Files", "Microsoft Visual Studio", "2022")
const enterprise = path.join(msvc, "Enterprise", "VC", "Auxiliary", "Build", "vcvarsall.bat")
const professional = path.join(msvc, "Professional", "VC", "Auxiliary", "Build", "vcvarsall.bat")
const community = path.join(msvc, "Community", "VC", "Auxiliary", "Build", "vcvarsall.bat")

const names = ["PATH", "INCLUDE", "LIB", "LIBPATH"]

export async function vcvarsall(): Promise<Record<string, string>> {
	for (const bat of [enterprise, professional, community]) {
		if (!fs.existsSync(bat)) {
			continue
		}

		return new Promise<Record<string, string>>((resolve, reject) => {

			child_process.exec(`"${bat}" x64 && set`, { shell: "cmd" }, (error, stdout, stderr) => {
				if (error) {
					reject(error)
					return
				}

				const env: Record<string, string> = {}

				for (const line of stdout.split("\n")) {
					const pair = line.split("=")
					if (pair.length == 2 && names.includes(pair[0])) {
						env[pair[0]] = pair[1].trim()
					}
				}

				resolve(env)
			})
		})
	}

	throw new Error("no found vcvarsall.bat")
}

vcvarsall().then((env) => {
	console.log(env)
})