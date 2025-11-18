import child_process from "node:child_process"
import path from "node:path"
import util from "node:util"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __cache = path.join(__top, "cache")

export async function BuildNode(version: string, arch: string) {
	if (!version || !arch) {
		throw new Error("version and arch are required")
	}

	const cmd = [
		"npx",
		"node-gyp",
		"rebuild",
		`--target=${version}`,
		`--arch=${arch}`,
		`--devdir=\"${__cache}\"`,
	]

	const exec = util.promisify(child_process.exec)

	await exec(cmd.join(" "), { cwd: __top })

	return path.join(__top, "build", "Release", "native.node")
}

export async function BuildElectron(version: string, arch: string) {
	if (!version || !arch) {
		throw new Error("version and arch are required")
	}

	const cmd = [
		"npx",
		"node-gyp",
		"rebuild",
		`--target=${version}`,
		`--arch=${arch}`,
		`--devdir=\"${__cache}\"`,
		"--dist-url=https://electronjs.org/headers",
	]

	const exec = util.promisify(child_process.exec)

	await exec(cmd.join(" "), { cwd: __top })

	return path.join(__top, "build", "Release", "native.node")
}
