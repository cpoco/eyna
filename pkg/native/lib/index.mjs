import module from "node:module"
const native = module.createRequire(import.meta.url)("../build/Release/native.node")

export default native
