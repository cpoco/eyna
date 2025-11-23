import { configure, build } from "./_cmake.ts"

configure("node", process.versions.node)
build()
