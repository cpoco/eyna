import path from "node:path/posix"

let _root
let _test

if (process.platform == "win32") {
	_root = "C:/"
	_test = path.join(_root, "Users", "Public", "eyna test")
}
else if (process.platform == "darwin") {
	_root = "/"
	_test = path.join(_root, "Users", "Shared", "eyna test")
}
else {
	process.exit(1)
}

/** root directory */
export const ROOT = _root

/** test directory */
export const TEST = _test

export enum ERROR {
	INVALID_ARGUMENT = "invalid argument",
	INVALID_PATH = "relative or traversal paths are not allowed",
	INVALID_T_PATH = "traversal paths not allowed",
	FAILED = "failed",
}
