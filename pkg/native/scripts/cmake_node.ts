import { build, configure, setVsCmdEnv } from "./_cmake.ts"

Promise.resolve()
	.then(() => {
		return setVsCmdEnv()
	})
	.then(() => {
		return configure("node", process.versions.node, "inherit")
	})
	.then(() => {
		return build("inherit")
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
