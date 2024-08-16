export enum AttributeFileType {
	HomeUser = -2,
	Drive = -1,
	None = 0,
	Directory = 1,
	Link = 2,
	File = 3,
	Special = 10,
}

export enum AttributeLinkType {
	None = 0,
	Symbolic = 1,
	Junction = 2,
	Shortcut = 3,
	Bookmark = 4,
}

export type Attributes = Attribute[]

export type Attribute = {
	file_type: AttributeFileType
	full: string

	base: string
	rltv: string

	name: string
	stem: string
	exte: string

	link_type: AttributeLinkType
	link: string | null

	size: bigint
	time: number
	nsec: number

	readonly: boolean
	hidden: boolean
	system: boolean
	cloud: boolean
}

export type Volume = {
	full: string
	name: string
}

export type Directory = {
	full: string
	base: string
	list: Item[]
	s: bigint
	d: number
	f: number
	e: number
}

export type Item = {
	type: AttributeFileType
	rltv: string
}

export type Resolves = Resolve[]

export type Resolve = {
	full: string
	real: string
}

export type WatchCallback = (id: number, depth: number, abstract: string) => void
