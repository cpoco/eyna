export const AttributeFileType = {
	homeuser: -2,
	drive: -1,
	none: 0,
	directory: 1,
	link: 2,
	file: 3,
	special: 10,
} as const
export type AttributeFileValues = typeof AttributeFileType[keyof typeof AttributeFileType]

export const AttributeLinkType = {
	none: 0,
	symbolic: 1,
	junction: 2,
	shortcut: 3,
	bookmark: 4,
} as const
export type AttributeLinkValues = typeof AttributeLinkType[keyof typeof AttributeLinkType]

export type Attributes = Attribute[]

export type Attribute = {
	file_type: AttributeFileValues
	full: string

	rltv: string
	name: string
	stem: string
	ext: string

	link_type: AttributeLinkValues
	link: string | null

	size: bigint
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
	s: bigint
	d: number
	f: number
	e: number
}

export type Resolve = {
	full: string
	real: string
}

export type Resolves = Resolve[]

export type WatchCallback = (id: number, depth: number, abstract: string) => void
