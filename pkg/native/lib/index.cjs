const native = require("../bin/native.node")

const { Readable } = require("node:stream")

module.exports = {
	compare: (abstract_file1, abstract_file2) => {
		return native.compare(abstract_file1, abstract_file2)
	},
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
	getArchive: (abstract, base, depth = 0) => {
		return native.getArchive(abstract, base, depth)
	},
	getAttribute: (abstract, base = "") => {
		return native.getAttribute(abstract, base)
	},
	getDirectory: (abstract, base = "", mode = false, depth = 0, regexp = null) => {
		return native.getDirectory(abstract, base, mode, depth, regexp)
	},
	getEntry: (abstract, path) => {
		return native.getEntry(Readable, abstract, path)
	},
	getIcon: (abstract) => {
		return native.getIcon(abstract)
	},
	getPathAttribute: (abstract) => {
		return native.getPathAttribute(abstract)
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
