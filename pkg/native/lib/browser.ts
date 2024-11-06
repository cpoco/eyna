export * from "./_type"

import * as native from "../bin/native.node"

export function copy(abstract_src: string, abstract_dst: string): Promise<void> {
	return native.copy(abstract_src, abstract_dst)
}

export function createDirectory(abstract: string): Promise<void> {
	return native.createDirectory(abstract)
}

export function createFile(abstract: string): Promise<void> {
	return native.createFile(abstract)
}

export function createSymlink(abstract_link: string, abstract_trgt: string): Promise<void> {
	return native.createSymlink(abstract_link, abstract_trgt)
}

export function exists(abstract: string): Promise<boolean> {
	return native.exists(abstract)
}

export function getAttribute(abstract: string, base: string = ""): Promise<Type.Attributes> {
	return native.getAttribute(abstract, base)
}

export function getDirectory(
	abstract: string,
	base: string = "",
	mode: boolean = false,
	depth: number = 0,
	regexp: RegExp | null = null,
): Promise<Type.Directory> {
	return native.getDirectory(abstract, base, mode, depth, regexp)
}

export function getIcon(abstract: string): Promise<Buffer> {
	return native.getIcon(abstract)
}

export function getVolume(): Promise<Type.Volume[]> {
	return native.getVolume()
}

export function isElevated(): boolean {
	return native.isElevated()
}

export function move(abstract_src: string, abstract_dst: string): Promise<void> {
	return native.move(abstract_src, abstract_dst)
}

export function moveToTrash(abstract: string): Promise<void> {
	return native.moveToTrash(abstract)
}

export function openProperties(abstract: string): boolean {
	return native.openProperties(abstract)
}

export function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean {
	return native.watch(id, abstract, callback)
}

export function unwatch(id: number): boolean {
	return native.unwatch(id)
}
