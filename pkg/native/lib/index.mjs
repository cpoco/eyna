import module from "node:module"
const native = module.createRequire(import.meta.url)("../bin/native.node")

export default {
	copy: (abstract_src, abstract_dst) => {
		return native.copy(abstract_src, abstract_dst)
	},
	createDirectory: (abstract) => {
		return native.createDirectory(abstract)
	},
	createFile: (abstract) => {
		return native.createFile(abstract)
	},
	createSymlink: (abstract_link, abstract_trgt) => {
		return native.createSymlink(abstract_link, abstract_trgt)
	},
	exists: (abstract) => {
		return native.exists(abstract)
	},
	getAttribute: (abstract, base = "") => {
		return native.getAttribute(abstract, base)
	},
	getDirectory: (abstract, base = "", mode = false, depth = 0, regexp = null) => {
		return native.getDirectory(abstract, base, mode, depth, regexp)
	},
	getIcon: (abstract) => {
		return native.getIcon(abstract)
	},
	getVolume: () => {
		return native.getVolume()
	},
	isElevated: () => {
		return native.isElevated()
	},
	move: (abstract_src, abstract_dst) => {
		return native.move(abstract_src, abstract_dst)
	},
	moveToTrash: (abstract) => {
		return native.moveToTrash(abstract)
	},
	openProperties: (abstract) => {
		return native.openProperties(abstract)
	},
	watch: (id, abstract, callback) => {
		return native.watch(id, abstract, callback)
	},
	unwatch: (id) => {
		return native.unwatch(id)
	},
}
