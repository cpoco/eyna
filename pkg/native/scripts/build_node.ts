import fs from "node:fs/promises"
import path from "node:path"
import { BuildNode } from "./build.ts"

async function index() {
	const __top = path.join(import.meta.dirname ?? __dirname, "..")

	const src = await BuildNode(process.versions.node, process.arch)
	const dst = path.join(__top, "bin", "native.node")

	await fs.copyFile(src, dst)
}

index()
