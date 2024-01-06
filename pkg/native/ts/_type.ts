export enum AttributeFileType {
	homeuser = -2,
	drive = -1,
	none = 0,
	directory = 1,
	link = 2,
	file = 3,
	special = 10,
}

export enum AttributeLinkType {
	none = 0,
	symbolic = 1,
	junction = 2,
	shortcut = 3,
	bookmark = 4,
}

export type Attributes = Attribute[]

export type Attribute = {
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

export type Resolve = {
	full: string
	real: string
}

export type Resolves = Resolve[]

export type WatchCallback = (id: number, depth: number, abstract: string) => void
