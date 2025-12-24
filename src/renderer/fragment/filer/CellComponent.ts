import * as Native from "@eyna/native/lib/renderer"
import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import root from "@/renderer/Root"

const TAG = "cell"

export type Cell = {
	style: {
		top: string
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
				style: this.cell.style,
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

		const is_link = vue.computed((): boolean => {
			return attr.value.one?.link_type !== Native.LinkType.None
		})

		const is_cloud = vue.computed((): boolean => {
			return attr.value.one?.x?.cloud === true
		})

		const icon_url = vue.computed((): string => {
			if (attr.value.one?.x?.entry !== true) {
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
			else if (attr.value.one?.file_type === Native.FileType.HomeUser) {
				return "c-homeuser"
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
			else if (attr.value.one?.x?.entry) {
				return "c-maybe"
			}
			else {
				return "c-miss"
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
				attr.value.one?.file_type === Native.FileType.Drive || attr.value.one?.file_type === Native.FileType.HomeUser
			) {
				return undefined
			}
			return Util.DateTime(attr.value.one?.time ?? 0)
		})

		const dragstart = (event: DragEvent) => {
			event.preventDefault()
			root.send(Bridge.List.Drag.CH, -1, { full: attr.value.one?.full ?? "" })
		}

		return {
			attr,
			is_link,
			is_cloud,
			icon_url,
			name_class,
			trgt_class,
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
				vue.h("span", { class: { "filer-cell-attr-exte": true, "c-cloud": this.is_cloud } }, this.exte),
				vue.h("span", { class: { "filer-cell-attr-size": true, "c-cloud": this.is_cloud } }, this.size),
				vue.h("span", { class: { "filer-cell-attr-date": true, "c-cloud": this.is_cloud } }, this.date?.date),
				vue.h("span", { class: { "filer-cell-attr-time": true, "c-cloud": this.is_cloud } }, this.date?.time),
			],
		)
	},
})
