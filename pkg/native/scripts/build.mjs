import child_process from "node:child_process"
import path from "node:path"
import util from "node:util"

const __top = path.join(import.meta.dirname, "..")

export async function BuildNode(version, arch) {
	if (!version) {
		version = process.versions.node
	}
	if (!arch) {
		arch = process.arch
	}

	const cmd = [
		"npx",
		"node-gyp",
		"rebuild",
		`--target=${version}`,
		`--arch=${arch}`,
		`--devdir=\"${path.join(__top, "cache")}\"`,
	]

	const exec = util.promisify(child_process.exec)

	await exec(cmd.join(" "), { cwd: __top })

	return path.join(__top, "build", "Release", "native.node")
}

export async function BuildElectron(version, arch) {
	if (!version) {
		throw new Error("version is required")
	}
	if (!arch) {
		arch = process.arch
	}

	const cmd = [
		"npx",
		"node-gyp",
		"rebuild",
		`--target=${version}`,
		`--arch=${arch}`,
		`--devdir=\"${path.join(__top, "cache")}\"`,
		"--dist-url=https://electronjs.org/headers",
	]

	const exec = util.promisify(child_process.exec)

	await exec(cmd.join(" "), { cwd: __top })

	return path.join(__top, "build", "Release", "native.node")
}
