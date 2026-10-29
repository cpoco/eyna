declare namespace Type {
	enum Sort {
		DepthFirst = 0,
		ShallowFirst = 1,
	}
	enum FileType {
		Favorite = -2,
		Drive = -1,
		None = 0,
		Directory = 1,
		Link = 2,
		File = 3,
		Special = 10,
	}
	enum LinkType {
		None = 0,
		Symbolic = 1,
		Junction = 2,
		Shortcut = 3,
		Bookmark = 4,
	}
	enum Opt {
		READONLY = 1 << 0,
		HIDDEN = 1 << 1,
		SYSTEM = 1 << 2,
		CLOUD = 1 << 3,
		ENTRY = 1 << 4,
		IMPLICIT = 1 << 5,
		ENCRYPTED = 1 << 6,
	}
	type Archive = {
		readonly full: string
		readonly base: string
		readonly henc: boolean
		readonly list: Attribute[]
		readonly s: bigint
		readonly d: number
		readonly f: number
		readonly e: number
	}
	type ArchiveReader = {
		readonly size: bigint
		readonly reader: NodeJS.ReadableStream
	}
	type Attributes = Attribute[]
	type Attribute = {
		readonly file_type: FileType
		readonly full: string
		readonly base: string
		readonly rltv: string
		readonly name: string
		readonly stem: string
		readonly exte: string
		readonly link_type: LinkType
		readonly link: string | null
		readonly size: bigint
		readonly ctime: bigint
		readonly mtime: bigint
		readonly x?: {
			readonly opt?: number
			readonly git?: number
		}
	}
	type Volume = {
		readonly full: string
		readonly name: string
	}
	type Directory = {
		readonly full: string
		readonly base: string
		readonly list: Item[]
		readonly s: bigint
		readonly d: number
		readonly f: number
		readonly e: number
		readonly git?: {
			readonly wdir: string
			readonly brch: string
		}
	}
	type Item = {
		readonly type: FileType
		readonly rltv: string
		readonly git?: number
	}
	type WatchCallback = (id: number, depth: number, abstract: string) => void
}
