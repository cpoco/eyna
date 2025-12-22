/// <reference types="./_type.d.ts" />

import { type Readable } from "node:stream"

declare namespace Native {
	function compare(abstract_file1: string, abstract_file2: string): Promise<boolean>
	function copy(abstract_src: string, abstract_dst: string): Promise<void>
	function createDirectory(abstract: string): Promise<void>
	function createFile(abstract: string): Promise<void>
	function createSymlink(abstract_link: string, abstract_trgt: string): Promise<void>
	function exists(abstract: string): Promise<boolean>
	function getArchive(abstract: string, base: string, depth: number): Promise<Type.Archive>
	function getAttribute(abstract: string, base?: string): Promise<Type.Attributes>
	function getDirectory(
		abstract: string,
		base?: string,
		sort?: Type.Sort,
		depth?: number,
		regexp?: RegExp | null,
	): Promise<Type.Directory>
	function getEntry(stream: typeof Readable, abstract: string, path: string): NodeJS.ReadableStream
	function getIcon(abstract: string): Promise<Buffer>
	function getIconType(extension: string): Promise<Buffer>
	function getPathAttribute(abstract: string): Promise<Type.Attributes>
	function getVolume(): Promise<Type.Volume[]>
	function isElevated(): boolean
	function move(abstract_src: string, abstract_dst: string): Promise<void>
	function moveToTrash(abstract: string): Promise<void>
	function openProperties(abstract: string): boolean
	function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean
	function unwatch(id: number): boolean
}
