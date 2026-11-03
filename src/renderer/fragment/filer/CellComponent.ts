import * as Native from "@eyna/native/lib/renderer"
import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import root from "@/renderer/Root"

const TAG = "cell"

export type Cell = {
	data: {
		top: number
	}
	back: {
		select: boolean
		cursor: boolean
	}
	pad: {
		size: number
	}
	attr: Native.Attributes
}

export const V = vue.defineComponent({
	props: {
		cell: {
			required: true,
			type: Object as vue.PropType<Cell>,
		},
	},

	setup(props) {
		const is_empty = vue.computed((): boolean => {
			return props.cell.attr.length === 0
		})

		return {
			is_empty,
		}
	},

	render() {
		return vue.h(
			TAG,
			{
				class: { "filer-cell": true },
				"data-top": this.cell.data.top,
			},
			this.is_empty
				? [
					vue.h(back, { back: this.cell.back }),
					vue.h(spnr),
				]
				: [
					vue.h(back, { back: this.cell.back }),
					vue.h(attr, { pad: this.cell.pad, attr: this.cell.attr }),
				],
		)
	},
})

const back = vue.defineComponent({
	props: {
		back: {
			required: true,
			type: Object as vue.PropType<{ select: boolean; cursor: boolean }>,
		},
	},

	render() {
		return vue.h(
			"span",
			{
				class: {
					"filer-cell-back": true,
					"filer-cell-back-select": this.back.select,
					"filer-cell-back-cursor": this.back.cursor,
				},
			},
		)
	},
})

const spnr = vue.defineComponent({
	render() {
		return vue.h("span", { class: { "filer-cell-spinner": true } })
	},
})

const attr = vue.defineComponent({
	props: {
		pad: {
			required: true,
			type: Object as vue.PropType<{ size: number }>,
		},
		attr: {
			required: true,
			type: Object as vue.PropType<Native.Attributes>,
		},
	},

	setup(props) {
		const attr = vue.computed(
			(): { one: Native.Attribute | null; two: Native.Attribute | null; end: Native.Attribute | null } => {
				return {
					one: props.attr[0] ?? null,
					two: props.attr[1] ?? null,
					end: Util.last(props.attr),
				}
			},
		)

		const opt = vue.computed((): number => {
			return attr.value.one?.x?.opt ?? 0
		})

		const git = vue.computed((): number => {
			return attr.value.one?.x?.git ?? 0
		})

		const is_link = vue.computed((): boolean => {
			return attr.value.one?.link_type !== Native.LinkType.None
		})

		const icon_url = vue.computed((): string => {
			if ((opt.value & Native.Opt.ENTRY) == 0) {
				return `eyna://icon-path/${encodeURIComponent(attr.value.one?.full ?? "")}`
			}
			else if (attr.value.one?.file_type === Native.FileType.Directory) {
				return `eyna://icon-type/${encodeURIComponent("/")}`
			}
			else {
				return `eyna://icon-type/${encodeURIComponent(attr.value.one?.exte.replace(/^\./, "") ?? "")}`
			}
		})

		const name_class = vue.computed((): string => {
			if (attr.value.one?.file_type === Native.FileType.File) {
				if (attr.value.one?.link_type === Native.LinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (attr.value.one?.link_type === Native.LinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (attr.value.one?.file_type === Native.FileType.Link) {
				return "c-link"
			}
			else if (attr.value.one?.file_type === Native.FileType.Directory) {
				return "c-directory"
			}
			else if (attr.value.one?.file_type === Native.FileType.Drive) {
				return "c-drive"
			}
			else if (attr.value.one?.file_type === Native.FileType.Favorite) {
				return "c-favorite"
			}
			else if (attr.value.one?.file_type === Native.FileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const trgt_class = vue.computed((): string => {
			if (attr.value.two?.file_type === Native.FileType.File) {
				if (attr.value.two?.link_type === Native.LinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (attr.value.two?.link_type === Native.LinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (attr.value.two?.file_type === Native.FileType.Link) {
				if (attr.value.end === null || attr.value.end.file_type === Native.FileType.None) {
					return "c-warn"
				}
				else {
					return "c-link"
				}
			}
			else if (attr.value.two?.file_type === Native.FileType.Directory) {
				return "c-directory"
			}
			else if (attr.value.two?.file_type === Native.FileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const opt_class = vue.computed((): Record<string, boolean> => {
			return {
				"c-cloud": (opt.value & Native.Opt.CLOUD) != 0,
				"c-implicit": (opt.value & Native.Opt.IMPLICIT) != 0,
				"c-encrypted": (opt.value & Native.Opt.ENCRYPTED) != 0,
			}
		})

		const git_class = vue.computed((): Record<string, boolean> => {
			if (git.value === 0) {
				return {}
			}

			return {
				"c-git-ignored": (git.value & (Native.Git.IGNORED)) != 0,
				"c-git-internal": (git.value & (Native.Git.INTERNAL | Native.Git.SUBMODULE)) != 0,
				"c-git-phantom": (git.value & (Native.Git.PHANTOM)) != 0,
				"c-git-a": (git.value & (Native.Git.WT_NEW | Native.Git.IX_NEW)) != 0,
				"c-git-m": (git.value & (Native.Git.WT_MODIFIED | Native.Git.IX_MODIFIED)) != 0,
				"c-git-d": (git.value & (Native.Git.WT_DELETED | Native.Git.IX_DELETED)) != 0,
			}
		})

		const exte = vue.computed((): string | undefined => {
			if (attr.value.one?.file_type !== Native.FileType.File || attr.value.one?.link_type !== Native.LinkType.None) {
				return undefined
			}
			return attr.value.one?.exte.replace(/^\./, "")
		})

		const size = vue.computed((): string | undefined => {
			if (attr.value.one?.file_type !== Native.FileType.File) {
				return undefined
			}
			return attr.value.one?.size.toLocaleString().padStart(props.pad.size, " ")
		})

		const date = vue.computed((): { date: string; time: string } | undefined => {
			if (
				attr.value.one?.file_type === Native.FileType.Drive || attr.value.one?.file_type === Native.FileType.Favorite
			) {
				return undefined
			}
			return Util.DateTime(attr.value.one?.mtime ?? 0n)
		})

		const dragstart = (event: DragEvent) => {
			event.preventDefault()
			root.send(Bridge.List.Drag.CH, -1, { full: attr.value.one?.full ?? "" })
		}

		return {
			attr,
			is_link,
			icon_url,
			name_class,
			trgt_class,
			opt_class,
			git_class,
			exte,
			size,
			date,
			dragstart,
		}
	},

	render() {
		return vue.h(
			"span",
			{ class: { "filer-cell-attr": true } },
			[
				vue.h(
					"span",
					{ class: { "filer-cell-attr-icon": true }, draggable: true, onDragstart: this.dragstart },
					[
						vue.h("img", {
							class: { "filer-cell-attr-icon-img": true },
							src: this.icon_url,
						}),
					],
				),
				vue.h(
					"span",
					{ class: { "filer-cell-attr-name": true } },
					this.is_link
						? [
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-file": true, [this.name_class]: true } },
								Unicode.highlight(this.attr.one?.rltv),
							),
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-link": true, "c-operator": true } },
								Font.Icon.ArrowRight,
							),
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-trgt": true, [this.trgt_class]: true } },
								Unicode.highlight(this.attr.one?.link),
							),
						]
						: [
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-file": true, [this.name_class]: true } },
								Unicode.highlight(this.attr.one?.rltv),
							),
						],
				),
				vue.h("span", { class: { "filer-cell-attr-exte": true, ...this.opt_class, ...this.git_class } }, this.exte),
				vue.h("span", { class: { "filer-cell-attr-size": true, ...this.opt_class, ...this.git_class } }, this.size),
				vue.h(
					"span",
					{ class: { "filer-cell-attr-date": true, ...this.opt_class, ...this.git_class } },
					this.date?.date,
				),
				vue.h(
					"span",
					{ class: { "filer-cell-attr-time": true, ...this.opt_class, ...this.git_class } },
					this.date?.time,
				),
			],
		)
	},
})
