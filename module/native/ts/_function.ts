const native = require("./native.node")

import * as Type from "./_type"

export function copy(abstract_src: string, abstract_dst: string): Promise<void> {
	if (native == null) {
		return Promise.reject()
	}
	return native.copy(abstract_src, abstract_dst)
}

export function createDirectory(abstract: string): Promise<void> {
	if (native == null) {
		return Promise.reject()
	}
	return native.createDirectory(abstract)
}

export function exists(abstract: string): Promise<boolean> {
	if (native == null) {
		return Promise.reject()
	}
	return native.exists(abstract)
}

export function getAttribute(abstract: string, base: string = ""): Promise<Type.Attributes> {
	if (native == null) {
		return Promise.reject()
	}
	return native.getAttribute(abstract, base)
}

export function getDirectory(
	abstract: string,
	base: string = "",
	mode: boolean = false,
	depth: number = 0,
	regexp: RegExp | null = null,
): Promise<Type.Directory> {
	if (native == null) {
		return Promise.reject()
	}
	return native.getDirectory(abstract, base, mode, depth, regexp)
}

export function getDirectorySize(abstract: string): Promise<Type.DirectorySize> {
	if (native == null) {
		return Promise.reject()
	}
	return native.getDirectorySize(abstract)
}

export function getVolume(): Promise<Type.Volume[]> {
	if (native == null) {
		return Promise.reject()
	}
	return native.getVolume()
}

export function isElevated(): boolean {
	if (native == null) {
		return false
	}
	return native.isElevated()
}

export function move(abstract_src: string, abstract_dst: string): Promise<void> {
	if (native == null) {
		return Promise.reject()
	}
	return native.move(abstract_src, abstract_dst)
}

export function moveToTrash(abstract: string): Promise<void> {
	if (native == null) {
		return Promise.reject()
	}
	return native.moveToTrash(abstract)
}

export function openProperties(abstract: string) {
	if (native == null) {
		return
	}
	native.openProperties(abstract)
}
