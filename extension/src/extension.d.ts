declare function log(...args: any[]): void

type Extension = {
	active: {
		wd: string
		cursor: Attributes | null
		select: Attributes[]
	} | null
	target: {
		wd: string
		cursor: Attributes | null
		select: Attributes[]
	} | null
	filer: {
		update: () => void
		exists: (full: string) => Promise<boolean>
		trash: (full: string) => Promise<void>
		mkdir: (full: string) => Promise<void>
		mkfile: (full: string) => Promise<void>
		copy: (full_src: string, full_dst: string) => Promise<void>
		move: (full_src: string, full_dst: string) => Promise<void>
		findcopy: (full: string) => Promise<string[]>
		findmove: (full: string) => Promise<string[]>
	}
	dialog: {
		opne: (option: alert_option | prompt_option) => Promise<{ text: string } | null>
		cancel: () => void
	}
}

type alert_option = {
	type: "alert"
	title: string
	text: string
}

type prompt_option = {
	type: "prompt"
	title: string
	text: string
	start?: number
	end?: number
}

declare enum AttributeFileType {
	home = -1,
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
type Attribute = {
	file_type: AttributeFileType
	full: string
	rltv: string

	link_type: AttributeLinkType
	link: string

	size: number
	time: number
	nsec: number
}
type Attributes = Attribute[]
