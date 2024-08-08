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
			return props.attr.length == 0
		})

		const is_link = vue.computed((): boolean => {
			if (props.attr.length == 0) {
				return false
			}
			return props.attr[0]?.link_type != Native.AttributeLinkType.None
		})

		const name_class = vue.computed((): string => {
			const f = props.attr[0]?.file_type
			if (f == Native.AttributeFileType.File) {
				const l = props.attr[0]?.link_type
				if (l == Native.AttributeLinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (l == Native.AttributeLinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (f == Native.AttributeFileType.Link) {
				return "c-link"
			}
			else if (f == Native.AttributeFileType.Directory) {
				return "c-directory"
			}
			else if (f == Native.AttributeFileType.Drive) {
				return "c-drive"
			}
			else if (f == Native.AttributeFileType.HomeUser) {
				return "c-homeuser"
			}
			else if (f == Native.AttributeFileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const trgt_class = vue.computed((): string => {
			const f = props.attr[1]?.file_type
			if (f == Native.AttributeFileType.File) {
				const l = props.attr[1]?.link_type
				if (l == Native.AttributeLinkType.Shortcut) {
					return "c-shortcut"
				}
				else if (l == Native.AttributeLinkType.Bookmark) {
					return "c-bookmark"
				}
				else {
					return "c-file"
				}
			}
			else if (f == Native.AttributeFileType.Link) {
				const last = Util.last(props.attr)
				if (last == null || last.file_type == Native.AttributeFileType.None) {
					return "c-warn"
				}
				else {
					return "c-link"
				}
			}
			else if (f == Native.AttributeFileType.Directory) {
				return "c-directory"
			}
			else if (f == Native.AttributeFileType.Special) {
				return "c-special"
			}
			else {
				return "c-miss"
			}
		})

		const exte = vue.computed((): string | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type != Native.AttributeFileType.File
				|| props.attr[0]?.link_type != Native.AttributeLinkType.None
			) {
				return undefined
			}
			return props.attr[0]?.exte.replace(/^\./, "")
		})

		const size = vue.computed((): string | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type != Native.AttributeFileType.File
			) {
				return undefined
			}
			return props.attr[0]?.size.toLocaleString().padStart(props.pad.size, " ")
		})

		const date = vue.computed((): { date: string; time: string } | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type == Native.AttributeFileType.Drive
				|| props.attr[0]?.file_type == Native.AttributeFileType.HomeUser
			) {
				return undefined
			}
			return Util.DateTime(props.attr[0]?.time ?? 0)
		})

		const dragstart = (event: DragEvent) => {
			event.preventDefault()
			root.send<Bridge.List.Drag.Send>({
				ch: "filer-drag",
				id: -1,
				data: {
					full: props.attr[0]?.full ?? "",
				},
			})
		}

		return {
			is_link,
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
							class: { "filer-cell-attr-img": true },
							src: `eyna://icon/${encodeURIComponent(this.attr[0]?.full ?? "")}`,
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
								{ class: { "filer-cell-attr-file": true, [this.name_class]: true } },
								Unicode.highlight(this.attr[0]?.rltv),
							),
							vue.h("span", { class: { "filer-cell-attr-link": true, "c-operator": true } }, Font.Icon.ArrowRight),
							vue.h(
								"span",
								{ class: { "filer-cell-attr-trgt": true, [this.trgt_class]: true } },
								Unicode.highlight(this.attr[0]?.link),
							),
						]
						: [
							vue.h(
								"span",
								{ class: { "filer-cell-attr-file": true, [this.name_class]: true } },
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
