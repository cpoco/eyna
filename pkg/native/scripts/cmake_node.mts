import { build, configure, setVsCmdEnv } from "./_cmake.mts"

try {
	await setVsCmdEnv()
	await configure("node", process.versions.node, "inherit")
	await build("inherit")
}
catch (err) {
	console.error(err)
	process.exit(1)
}
