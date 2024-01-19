declare enum AttributeFileType {
	homeuser = -2,
	drive = -1,
	none = 0,
	directory = 1,
	link = 2,
	file = 3,
	special = 10,
}

declare enum AttributeLinkType {
	none = 0,
	symbolic = 1,
	junction = 2,
	shortcut = 3,
	bookmark = 4,
}

declare type Attributes = Attribute[]

declare type Attribute = {
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

declare type Volume = {
	full: string
	name: string
}

declare type Directory = {
	full: string
	base: string
	list: Item[]
	s: bigint
	d: number
	f: number
	e: number
}

declare type Item = {
	type: AttributeFileType
	rltv: string
}

declare type Resolves = Resolve[]

declare type Resolve = {
	full: string
	real: string
}

declare type WatchCallback = (id: number, depth: number, abstract: string) => void
