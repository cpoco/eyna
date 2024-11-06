/// <reference types="./_type.d.ts" />

declare namespace Native {
	function copy(abstract_src: string, abstract_dst: string): Promise<void>
	function createDirectory(abstract: string): Promise<void>
	function createFile(abstract: string): Promise<void>
	function createSymlink(abstract_link: string, abstract_trgt: string): Promise<void>
	function exists(abstract: string): Promise<boolean>
	function getAttribute(abstract: string, base?: string): Promise<Type.Attributes>
	function getDirectory(
		abstract: string,
		base?: string,
		mode?: boolean,
		depth?: number,
		regexp?: RegExp | null,
	): Promise<Type.Directory>
	function getIcon(abstract: string): Promise<Buffer>
	function getVolume(): Promise<Type.Volume[]>
	function isElevated(): boolean
	function move(abstract_src: string, abstract_dst: string): Promise<void>
	function moveToTrash(abstract: string): Promise<void>
	function openProperties(abstract: string): boolean
	function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean
	function unwatch(id: number): boolean
}
