/// <reference types="@eyna/native/types/_type.d.ts" />

declare function log(...args: any[]): void

declare type Attributes = Type.Attributes
declare type Directory = Type.Directory
declare type Item = Type.Item

declare type Extension = {
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
		mkslink: (full_link: string, full_trgt: string) => Promise<void>
		copy: (full_src: string, full_dst: string) => Promise<void>
		move: (full_src: string, full_dst: string) => Promise<void>
		find: (full: string, base: string) => Promise<Directory>
	}
	dialog: {
		open: (option: AlertOption | PromptOption) => Promise<{ text: string } | null>
		cancel: () => void
	}
	util: {
		home: (...paths: string[]) => string
	}
}

type AlertOption = {
	type: "alert"
	title: string
	text: string
}

type PromptOption = {
	type: "prompt"
	title: string
	text: string
	start?: number
	end?: number
}
