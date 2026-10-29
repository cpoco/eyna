export enum Sort {
	DepthFirst = 0,
	ShallowFirst = 1,
}

export enum FileType {
	Favorite = -2,
	Drive = -1,
	None = 0,
	Directory = 1,
	Link = 2,
	File = 3,
	Special = 10,
}

export enum LinkType {
	None = 0,
	Symbolic = 1,
	Junction = 2,
	Shortcut = 3,
	Bookmark = 4,
}

export enum Opt {
	READONLY = 1 << 0,
	HIDDEN = 1 << 1,
	SYSTEM = 1 << 2,
	CLOUD = 1 << 3,
	ENTRY = 1 << 4,
	IMPLICIT = 1 << 5,
	ENCRYPTED = 1 << 6,
}

export type Archive = {
	readonly full: string
	readonly base: string
	readonly henc: boolean
	readonly list: Attribute[]
	readonly s: bigint
	readonly d: number
	readonly f: number
	readonly e: number
}

export type ArchiveReader = {
	readonly size: bigint
	readonly reader: NodeJS.ReadableStream
}

export type Attributes = Attribute[]

export type Attribute = {
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

export type Volume = {
	readonly full: string
	readonly name: string
}

export type Directory = {
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

export type Item = {
	readonly type: FileType
	readonly rltv: string
	readonly git?: number
}

export type WatchCallback = (id: number, depth: number, abstract: string) => void
