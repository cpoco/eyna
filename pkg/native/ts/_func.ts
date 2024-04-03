// @ts-ignore
import * as native from "./native.node"

import * as Type from "./_type"

export function copy(abstract_src: string, abstract_dst: string): Promise<void> {
	return native.copy(abstract_src, abstract_dst)
}

export function createDirectory(abstract: string): Promise<void> {
	return native.createDirectory(abstract)
}

export function createFile(abstract: string): Promise<void> {
	return native.createFile(abstract)
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

export function resolve(abstract: string): Promise<Type.Resolves> {
	return native.resolve(abstract)
}

export function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean {
	return native.watch(id, abstract, callback)
}

export function unwatch(id: number): boolean {
	return native.unwatch(id)
}
