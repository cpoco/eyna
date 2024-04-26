declare namespace Type {
	enum AttributeFileType {
		HomeUser = -2,
		Drive = -1,
		None = 0,
		Directory = 1,
		Link = 2,
		File = 3,
		Special = 10,
	}
	enum AttributeLinkType {
		None = 0,
		Symbolic = 1,
		Junction = 2,
		Shortcut = 3,
		Bookmark = 4,
	}
	type Attributes = Attribute[]
	type Attribute = {
		file_type: AttributeFileType
		full: string
		base: string
		rltv: string
		name: string
		stem: string
		ext: string
		link_type: AttributeLinkType
		link: string | null
		size: bigint
		time: number
		nsec: number
		readonly: boolean
		hidden: boolean
		system: boolean
		pseudo: boolean
	}
	type Volume = {
		full: string
		name: string
	}
	type Directory = {
		full: string
		base: string
		list: Item[]
		s: bigint
		d: number
		f: number
		e: number
	}
	type Item = {
		type: AttributeFileType
		rltv: string
	}
	type Resolves = Resolve[]
	type Resolve = {
		full: string
	}
	type WatchCallback = (id: number, depth: number, abstract: string) => void
}

declare namespace Native {
	function copy(abstract_src: string, abstract_dst: string): Promise<void>
	function createDirectory(abstract: string): Promise<void>
	function createFile(abstract: string): Promise<void>
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
	function resolve(abstract: string): Promise<Type.Resolves>
	function watch(id: number, abstract: string, callback: Type.WatchCallback): boolean
	function unwatch(id: number): boolean
}

declare module "@eyna/native/lib/index.cjs" {
	export = Native
}

declare module "@eyna/native/lib/index.mjs" {
	export = Native
}
