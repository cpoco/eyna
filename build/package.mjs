import process from "process"

import electron_builder from "electron-builder"

export async function Package() {
	let op = { x64: true }
	if (process.platform == "win32") {
		op.win = ["7z"]
	}
	else if (process.platform == "darwin") {
		op.mac = ["7z"]
	}
	return electron_builder.build(op)
}

