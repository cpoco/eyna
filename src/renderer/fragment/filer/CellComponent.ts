import * as Native from "@eyna/native/lib/renderer"
import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import root from "@/renderer/Root"

const TAG = "cell"

type ClassCell =
	| "filer-cell-attr-file"
	| "filer-cell-attr-link"
	| "filer-cell-attr-trgt"

type ClassColor =
	| "c-operator"
	| "c-drive"
	| "c-homeuser"
	| "c-link"
	| "c-file"
	| "c-directory"
	| "c-shortcut"
	| "c-bookmark"
	| "c-special"
	| "c-warn"
	| "c-miss"

type Style =
	& { class: { [key in ClassCell | ClassColor]?: boolean } }
	& vue.AllowedComponentProps

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

		const name = vue.computed((): Style => {
			const ret: Style = { class: { "filer-cell-attr-file": true } }

			const f = props.attr[0]?.file_type
			if (f == Native.AttributeFileType.File) {
				const l = props.attr[0]?.link_type
				if (l == Native.AttributeLinkType.Shortcut) {
					ret.class["c-shortcut"] = true
				}
				else if (l == Native.AttributeLinkType.Bookmark) {
					ret.class["c-bookmark"] = true
				}
				else {
					ret.class["c-file"] = true
				}
			}
			else if (f == Native.AttributeFileType.Link) {
				ret.class["c-link"] = true
			}
			else if (f == Native.AttributeFileType.Directory) {
				ret.class["c-directory"] = true
			}
			else if (f == Native.AttributeFileType.Drive) {
				ret.class["c-drive"] = true
			}
			else if (f == Native.AttributeFileType.HomeUser) {
				ret.class["c-homeuser"] = true
			}
			else if (f == Native.AttributeFileType.Special) {
				ret.class["c-special"] = true
			}
			else {
				ret.class["c-miss"] = true
			}

			return ret
		})

		const link = vue.computed((): Style => {
			return { class: { "filer-cell-attr-link": true, "c-operator": true } }
		})

		const trgt = vue.computed((): Style => {
			const ret: Style = { class: { "filer-cell-attr-trgt": true } }

			const f = props.attr[1]?.file_type
			if (f == Native.AttributeFileType.File) {
				const l = props.attr[1]?.link_type
				if (l == Native.AttributeLinkType.Shortcut) {
					ret.class["c-shortcut"] = true
				}
				else if (l == Native.AttributeLinkType.Bookmark) {
					ret.class["c-bookmark"] = true
				}
				else {
					ret.class["c-file"] = true
				}
			}
			else if (f == Native.AttributeFileType.Link) {
				const last = Util.last(props.attr)
				if (last == null || last.file_type == Native.AttributeFileType.None) {
					ret.class["c-warn"] = true
				}
				else {
					ret.class["c-link"] = true
				}
			}
			else if (f == Native.AttributeFileType.Directory) {
				ret.class["c-directory"] = true
			}
			else if (f == Native.AttributeFileType.Special) {
				ret.class["c-special"] = true
			}
			else {
				ret.class["c-miss"] = true
			}

			return ret
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
			name,
			link,
			trgt,
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
							vue.h("span", this.name, Unicode.highlight(this.attr[0]?.rltv)),
							vue.h("span", this.link, Font.Icon.ArrowRight),
							vue.h("span", this.trgt, Unicode.highlight(this.attr[0]?.link)),
						]
						: [
							vue.h("span", this.name, Unicode.highlight(this.attr[0]?.rltv)),
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
