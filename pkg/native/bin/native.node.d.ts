/// <reference types="../types/_type.d.ts" />

import { type Readable } from "node:stream"

export function compare(abstract_file1: string, abstract_file2: string): Promise<boolean>
export function copy(abstract_src: string, abstract_dst: string): Promise<void>
export function createDirectory(abstract: string): Promise<void>
export function createFile(abstract: string): Promise<void>
export function createSymlink(abstract_link: string, abstract_trgt: string): Promise<void>
export function exists(abstract: string): Promise<boolean>
export function getArchive(abstract: string, base: string, depth: number): Promise<Type.Archive>
export function getArchiveEntry(stream: typeof Readable, abstract: string, path: string): NodeJS.ReadableStream
export function getAttribute(abstract: string, base: string): Promise<Type.Attributes>
export function getDirectory(
	abstract: string,
	base: string,
	sort: Type.Sort,
	depth: number,
	regexp: RegExp | null,
): Promise<Type.Directory>
export function getIcon(abstract: string): Promise<Buffer>
export function getPathAttribute(abstract: string): Promise<Type.Attributes>
export function getVolume(): Promise<Type.Volume[]>
export function isElevated(): boolean
export function move(abstract_src: string, abstract_dst: string): Promise<void>
export function moveToTrash(abstract: string): Promise<void>
export function openProperties(abstract: string): boolean
export function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean
export function unwatch(id: number): boolean
