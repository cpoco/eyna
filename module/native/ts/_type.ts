export enum AttributeFileType {
	homeuser = -2,
	home = -1,
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

export enum AttributeKey {
	rltv = "rltv"
}

export type Attributes = Attribute[]

export type Attribute = {
	file_type: AttributeFileType
	full: string

	[AttributeKey.rltv]: string
	name: string
	stem: string
	ext: string

	link_type: AttributeLinkType
	link: string | null

	size: number
	time: number
	nsec: number

	readonly: boolean
	hidden: boolean
	system: boolean
}

export type Volume = {
	full: string
	name: string
}

export type Directory = {
	wd: string
	ls: [string]
	e: number
}

export type DirectorySize = {
	wd: string
	s: number
	d: number
	f: number
	e: number
}
