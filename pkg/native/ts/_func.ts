// @ts-ignore
import * as native from "./native.node"

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

export function createFile(abstract: string): Promise<void> {
	if (native == null) {
		return Promise.reject()
	}
	return native.createFile(abstract)
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

export function getIcon(abstract: string): Promise<Buffer> {
	if (native == null) {
		return Promise.reject()
	}
	return native.getIcon(abstract)
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

export function openProperties(abstract: string): boolean {
	if (native == null) {
		return false
	}
	return native.openProperties(abstract)
}

export function resolve(abstract: string): Promise<Type.Resolves> {
	if (native == null) {
		return Promise.reject()
	}
	return native.resolve(abstract)
}

export function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean {
	if (native == null) {
		return false
	}
	return native.watch(id, abstract, callback)
}

export function unwatch(id: number): boolean {
	if (native == null) {
		return false
	}
	return native.unwatch(id)
}
