import { build, configure } from "./_cmake.ts"

configure("node", process.versions.node)
build()
