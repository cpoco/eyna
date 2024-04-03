import * as Native from "@eyna/native/ts/renderer"
import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import root from "@/renderer/Root"

const TAG = "cell"

type style =
	& {
		class: {
			"filer-cfile"?: boolean
			"filer-clink"?: boolean
			"filer-ctrgt"?: boolean

			"c-operator"?: boolean
			"c-drive"?: boolean
			"c-homeuser"?: boolean
			"c-link"?: boolean
			"c-file"?: boolean
			"c-directory"?: boolean
			"c-shortcut"?: boolean
			"c-bookmark"?: boolean
			"c-special"?: boolean
			"c-warn"?: boolean
			"c-miss"?: boolean
		}
	}
	& vue.AllowedComponentProps

export type Cell = {
	style: {
		top: string
	}
	back: {
		select: boolean
		cursor: boolean
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
				key: this.cell.attr[0]?.full ?? "",
				class: {
					"filer-cell": true,
				},
				style: this.cell.style,
			},
			this.is_empty
				? [
					vue.h(back, { back: this.cell.back }),
					vue.h(spnr),
				]
				: [
					vue.h(back, { back: this.cell.back }),
					vue.h(attr, { attr: this.cell.attr }),
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
					"filer-cback": true,
					"filer-cback-select": this.back.select,
					"filer-cback-cursor": this.back.cursor,
				},
			},
		)
	},
})

const spnr = vue.defineComponent({
	render() {
		return vue.h("span", { class: { "filer-spinner": true } })
	},
})

const attr = vue.defineComponent({
	props: {
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

		const name = vue.computed((): style => {
			const ret: style = { class: { "filer-cfile": true } }

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

		const link = vue.computed((): style => {
			return { class: { "filer-clink": true, "c-operator": true } }
		})

		const trgt = vue.computed((): style => {
			const ret: style = { class: { "filer-ctrgt": true } }

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

		const size = vue.computed((): string | undefined => {
			if (
				is_empty.value
				|| props.attr[0]?.file_type != Native.AttributeFileType.File
			) {
				return undefined
			}
			return props.attr[0]?.size.toLocaleString()
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
				args: [
					-1,
					{
						data: {
							full: props.attr[0]?.full ?? "",
						},
					},
				],
			})
		}

		return {
			is_link,
			name,
			link,
			trgt,
			size,
			date,
			dragstart,
		}
	},

	render() {
		return vue.h(
			"span",
			{ class: { "filer-cflex": true } },
			[
				vue.h(
					"span",
					{ class: { "filer-cicon": true }, draggable: true, onDragstart: this.dragstart },
					[
						vue.h("img", {
							class: { "filer-cimg": true },
							src: `eyna://icon/${encodeURIComponent(this.attr[0]?.full ?? "")}`,
						}),
					],
				),
				vue.h(
					"span",
					{ class: { "filer-cname": true } },
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
				vue.h("span", { class: { "filer-csize": true } }, this.size),
				vue.h("span", { class: { "filer-cdate": true } }, this.date?.date),
				vue.h("span", { class: { "filer-ctime": true } }, this.date?.time),
			],
		)
	},
})
