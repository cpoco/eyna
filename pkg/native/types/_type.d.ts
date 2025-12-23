declare namespace Type {
	enum Sort {
		DepthFirst = 0,
		ShallowFirst = 1,
	}
	enum FileType {
		HomeUser = -2,
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
	type Archive = {
		full: string
		base: string
		list: Attribute[]
		s: bigint
		d: number
		f: number
		e: number
	}
	type Attributes = Attribute[]
	type Attribute = {
		file_type: FileType
		full: string
		base: string
		rltv: string
		name: string
		stem: string
		exte: string
		link_type: LinkType
		link: string | null
		size: bigint
		time: number
		nsec: number
		x?: {
			readonly?: boolean
			hidden?: boolean
			system?: boolean
			cloud?: boolean
			entry?: boolean
		}
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
		type: FileType
		rltv: string
	}
	type WatchCallback = (id: number, depth: number, abstract: string) => void
}
