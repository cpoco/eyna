import { appendFileSync, readFileSync } from "node:fs"

const envFile = process.env.GITHUB_ENV

if (!envFile) {
	throw new Error("GITHUB_ENV is not set")
}

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
	devDependencies: { electron: string }
}

const versions = {
	ELECTRON_VERSION: pkg.devDependencies.electron,
	NODE_VERSION: process.versions.node,
}

for (const [name, value] of Object.entries(versions)) {
	console.log(`${name}=${value}`)
	appendFileSync(envFile, `${name}=${value}\n`)
}
