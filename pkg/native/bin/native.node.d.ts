/// <reference types="../types/_type.d.ts" />

export function copy(abstract_src: string, abstract_dst: string): Promise<void>
export function createDirectory(abstract: string): Promise<void>
export function createFile(abstract: string): Promise<void>
export function createSymlink(abstract_link: string, abstract_trgt: string): Promise<void>
export function exists(abstract: string): Promise<boolean>
export function getAttribute(abstract: string, base: string): Promise<Type.Attributes>
export function getDirectory(
	abstract: string,
	base: string,
	mode: boolean,
	depth: number,
	regexp: RegExp | null,
): Promise<Type.Directory>
export function getIcon(abstract: string): Promise<Buffer>
export function getVolume(): Promise<Type.Volume[]>
export function isElevated(): boolean
export function move(abstract_src: string, abstract_dst: string): Promise<void>
export function moveToTrash(abstract: string): Promise<void>
export function openProperties(abstract: string): boolean
export function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean
export function unwatch(id: number): boolean
