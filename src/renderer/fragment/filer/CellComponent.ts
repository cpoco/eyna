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
	pad: Pad
	attr: Native.Attributes
}

type Pad = {
	size: number
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
			return props.cell.attr.length == 0
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
			type: Object as vue.PropType<Pad>,
		},
		attr: {
			required: true,
			type: Object as vue.PropType<Native.Attributes>,
		},
	},

	setup(props) {
		const is_empty = vue.computed((): boolean => {
			return props.attr.length === 0
		})

		const is_link = vue.computed((): boolean => {
			if (is_empty.value) {
				return false
			}
			return props.attr[0]?.link_type != Native.LinkType.None
		})

		const icon_url = vue.computed((): string => {
			if (is_empty.value) {
				return `eyna://icon-type/`
			}
			if (props.attr[0]?.entry === false) {
				return `eyna://icon-path/${encodeURIComponent(props.attr[0]?.full ?? "")}`
			}
			if (props.attr[0]?.file_type === Native.FileType.Directory) {
				return `eyna://icon-type/${encodeURIComponent("/")}`
			}
			return `eyna://icon-type/${encodeURIComponent(props.attr[0]?.exte.replace(/^\./, "") ?? "")}`
		})

		const name_class = vue.computed((): string => {
			const f = props.attr[0]?.file_type
			if (f == Native.FileType.File) {
				const l = props.attr[0]?.link_type
				if (l == Native.LinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (l == Native.LinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (f == Native.FileType.Link) {
				return "c-link"
			}
			else if (f == Native.FileType.Directory) {
				return "c-directory"
			}
			else if (f == Native.FileType.Drive) {
				return "c-drive"
			}
			else if (f == Native.FileType.HomeUser) {
				return "c-homeuser"
			}
			else if (f == Native.FileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const trgt_class = vue.computed((): string => {
			const f = props.attr[1]?.file_type
			if (f == Native.FileType.File) {
				const l = props.attr[1]?.link_type
				if (l == Native.LinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (l == Native.LinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (f == Native.FileType.Link) {
				const last = Util.last(props.attr)
				if (last == null || last.file_type == Native.FileType.None) {
					return "c-warn"
				}
				else {
					return "c-link"
				}
			}
			else if (f == Native.FileType.Directory) {
				return "c-directory"
			}
			else if (f == Native.FileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const exte = vue.computed((): string | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type != Native.FileType.File
				|| props.attr[0]?.link_type != Native.LinkType.None
			) {
				return undefined
			}
			return props.attr[0]?.exte.replace(/^\./, "")
		})

		const size = vue.computed((): string | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type != Native.FileType.File
			) {
				return undefined
			}
			return props.attr[0]?.size.toLocaleString().padStart(props.pad.size, " ")
		})

		const date = vue.computed((): { date: string; time: string } | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type == Native.FileType.Drive
				|| props.attr[0]?.file_type == Native.FileType.HomeUser
			) {
				return undefined
			}
			return Util.DateTime(props.attr[0]?.time ?? 0)
		})

		const dragstart = (event: DragEvent) => {
			event.preventDefault()
			root.send(Bridge.List.Drag.CH, -1, { full: props.attr[0]?.full ?? "" })
		}

		return {
			is_link,
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
								Unicode.highlight(this.attr[0]?.rltv),
							),
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-link": true, "c-operator": true } },
								Font.Icon.ArrowRight,
							),
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-trgt": true, [this.trgt_class]: true } },
								Unicode.highlight(this.attr[0]?.link),
							),
						]
						: [
							vue.h(
								"span",
								{ class: { "filer-cell-attr-name-file": true, [this.name_class]: true } },
								Unicode.highlight(this.attr[0]?.rltv),
							),
						],
				),
				vue.h("span", { class: { "filer-cell-attr-exte": true, "c-cloud": this.attr[0]?.cloud } }, this.exte),
				vue.h("span", { class: { "filer-cell-attr-size": true, "c-cloud": this.attr[0]?.cloud } }, this.size),
				vue.h("span", { class: { "filer-cell-attr-date": true, "c-cloud": this.attr[0]?.cloud } }, this.date?.date),
				vue.h("span", { class: { "filer-cell-attr-time": true, "c-cloud": this.attr[0]?.cloud } }, this.date?.time),
			],
		)
	},
})
