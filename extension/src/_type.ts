import { Attributes, Directory } from "@eyna/native/ts/_type"

export * from "@eyna/native/ts/_type"

export type Extension = {
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
		find: (full: string, base: string) => Promise<Directory>
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
