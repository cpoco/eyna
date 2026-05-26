type Native = typeof import("../bin/native.node.d.ts")

import { createRequire } from "node:module"

export const requireNative = (): Native => {
	return createRequire(import.meta.url)("../bin/native.node") as Native
}
