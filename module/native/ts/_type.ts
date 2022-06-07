export const AttributeFileType = {
	homeuser: -2,
	drive: -1,
	none: 0,
	directory: 1,
	link: 2,
	file: 3,
	special: 10,
} as const
export type AttributeFileTypes = typeof AttributeFileType[keyof typeof AttributeFileType]

export const AttributeLinkType = {
	none: 0,
	symbolic: 1,
	junction: 2,
	shortcut: 3,
	bookmark: 4,
} as const
export type AttributeLinkTypes = typeof AttributeLinkType[keyof typeof AttributeLinkType]

export type Attributes = Attribute[]

export type Attribute = {
	file_type: AttributeFileTypes
	full: string

	rltv: string
	name: string
	stem: string
	ext: string

	link_type: AttributeLinkTypes
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
	s: number
	d: number
	f: number
	e: number
}

export type Resolve = {
	full: string
	real: string
}

export type Resolves = Resolve[]
