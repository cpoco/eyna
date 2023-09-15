import * as vue from "@/renderer/Vue"

import * as Bridge from "@/bridge/Bridge"
import * as Unicode from "@/renderer/dom/Unicode"
import * as SpinnerComponent from "@/renderer/fragment/filer/SpinnerComponent"
import root from "@/renderer/Root"
import * as Native from "@eyna/native/ts/renderer"
import * as Util from "@eyna/util/ts/Util"

const TAG = "cell"

export type Cell = {
	style: {
		top: string
	}
	back: {
		selcur: boolean
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

		const file_type = vue.computed((): Native.AttributeFileValues[] => {
			return props.cell.attr.map((it) => {
				return it ? it.file_type : Native.AttributeFileType.none
			})
		})

		const link_type = vue.computed((): Native.AttributeLinkValues[] => {
			return props.cell.attr.map((it) => {
				return it ? it.link_type : Native.AttributeLinkType.none
			})
		})

		const is_link = vue.computed((): boolean => {
			if (is_empty.value) {
				return false
			}

			let ftype = file_type.value[0] ?? Native.AttributeFileType.none
			if (ftype == Native.AttributeFileType.file) {
				let ltype = link_type.value[0] ?? Native.AttributeLinkType.none
				if (ltype == Native.AttributeLinkType.shortcut || ltype == Native.AttributeLinkType.bookmark) {
					return true
				}
			}
			else if (ftype == Native.AttributeFileType.link) {
				return true
			}

			return false
		})

		const is_size = vue.computed((): boolean => {
			if (is_empty.value) {
				return false
			}

			let ftype = file_type.value[0] ?? Native.AttributeFileType.none
			if (ftype == Native.AttributeFileType.file) {
				return true
			}

			return false
		})

		const is_date = vue.computed((): boolean => {
			if (is_empty.value) {
				return false
			}

			let ftype = file_type.value[0] ?? Native.AttributeFileType.none
			if (ftype == Native.AttributeFileType.drive || ftype == Native.AttributeFileType.homeuser) {
				return false
			}

			return true
		})

		const dragstart = (event: DragEvent) => {
			event.preventDefault()
			root.send<Bridge.List.Drag.Send>({
				ch: "filer-drag",
				args: [
					-1,
					{
						data: {
							full: props.cell.attr[0]?.full ?? "",
						},
					},
				],
			})
		}

		return {
			is_empty,
			file_type,
			link_type,
			is_link,
			is_size,
			is_date,
			dragstart,
		}
	},

	render() {
		type drag = {
			draggable: boolean
			onDragstart: (event: DragEvent) => void
		}

		let node: vue.VNodeProps & vue.AllowedComponentProps & drag = {
			key: this.cell.attr[0]?.full ?? "",
			class: {
				"filer-cell": true,
			},
			style: this.cell.style,
			draggable: true,
			onDragstart: this.dragstart,
		}

		if (this.is_empty) {
			return vue.h(TAG, node, vue.h(SpinnerComponent.V))
		}

		type style = {
			class: {
				"filer-cicon"?: boolean
				"filer-cfile"?: boolean
				"filer-clink"?: boolean
				"filer-ctrgt"?: boolean

				"c-warn"?: boolean
				"c-miss"?: boolean
				"c-directory"?: boolean
				"c-link"?: boolean
				"c-file"?: boolean
				"c-special"?: boolean
				"c-shortcut"?: boolean
				"c-bookmark"?: boolean
			}
		} & vue.AllowedComponentProps

		let icon: style = { class: { "filer-cicon": true } }
		let name: style = { class: { "filer-cfile": true } }
		let link: style = { class: { "filer-clink": true } }
		let trgt: style = { class: { "filer-ctrgt": true } }

		let ftype = this.file_type[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			let ltype = this.link_type[0] ?? Native.AttributeLinkType.none
			if (ltype == Native.AttributeLinkType.shortcut) {
				name.class["c-shortcut"] = true
			}
			else if (ltype == Native.AttributeLinkType.bookmark) {
				name.class["c-bookmark"] = true
			}
			else {
				name.class["c-file"] = true
			}
		}
		else if (ftype == Native.AttributeFileType.link) {
			name.class["c-link"] = true
		}
		else if (ftype == Native.AttributeFileType.directory) {
			name.class["c-directory"] = true
		}
		else if (ftype == Native.AttributeFileType.drive) {
		}
		else if (ftype == Native.AttributeFileType.homeuser) {
		}
		else if (ftype == Native.AttributeFileType.special) {
			name.class["c-special"] = true
		}
		else {
			name.class["c-miss"] = true
		}

		if (this.is_link) {
			let ftype2 = this.file_type[1] ?? Native.AttributeFileType.none
			if (ftype2 == Native.AttributeFileType.file) {
				let ltype2 = this.link_type[1] ?? Native.AttributeLinkType.none
				if (ltype2 == Native.AttributeLinkType.shortcut) {
					trgt.class["c-shortcut"] = true
				}
				else if (ltype2 == Native.AttributeLinkType.bookmark) {
					trgt.class["c-bookmark"] = true
				}
				else {
					trgt.class["c-file"] = true
				}
			}
			else if (ftype2 == Native.AttributeFileType.link) {
				let ftype3 = Util.last(this.file_type) ?? Native.AttributeFileType.none
				if (ftype3 == Native.AttributeFileType.none) {
					trgt.class["c-warn"] = true
				}
				else {
					trgt.class["c-link"] = true
				}
			}
			else if (ftype2 == Native.AttributeFileType.directory) {
				trgt.class["c-directory"] = true
			}
			else if (ftype2 == Native.AttributeFileType.special) {
				trgt.class["c-special"] = true
			}
			else {
				trgt.class["c-miss"] = true
			}
		}

		return vue.h(TAG, node, [
			vue.h(
				"span",
				{
					class: {
						"filer-cback": true,
						"filer-cback-selcur": this.cell.back.selcur,
						"filer-cback-select": this.cell.back.select,
						"filer-cback-cursor": this.cell.back.cursor,
					},
				},
			),
			vue.h(
				"span",
				{ class: { "filer-cflex": true } },
				[
					vue.h(
						"span",
						{ class: { "filer-cname": true } },
						this.is_link
							? [
								vue.h("span", icon, [
									vue.h("img", { src: `eyna://icon?p=${encodeURIComponent(this.cell.attr[0]?.full ?? "")}` }),
								]),
								vue.h("span", name, Unicode.rol(this.cell.attr[0]?.rltv)),
								vue.h("span", link, " -> "),
								vue.h("span", trgt, Unicode.rol(this.cell.attr[0]?.link)),
							]
							: [
								vue.h("span", icon, [
									vue.h("img", { src: `eyna://icon?p=${encodeURIComponent(this.cell.attr[0]?.full ?? "")}` }),
								]),
								vue.h("span", name, Unicode.rol(this.cell.attr[0]?.rltv)),
							],
					),
					vue.h(
						"span",
						{ class: { "filer-csize": true } },
						this.is_size
							? this.cell.attr[0]?.size.toLocaleString() ?? undefined
							: undefined,
					),
					vue.h(
						"span",
						{ class: { "filer-cdate": true } },
						this.is_date
							? date(this.cell.attr[0]?.time ?? 0)
							: undefined,
					),
					vue.h(
						"span",
						{ class: { "filer-ctime": true } },
						this.is_date
							? time(this.cell.attr[0]?.time ?? 0)
							: undefined,
					),
				],
			),
		])
	},
})

function date(sec: number): string {
	if (sec == 0) {
		return "----/--/--"
	}
	let d = new Date(sec * 1000)
	return [
		d.getFullYear(),
		(`0${d.getMonth() + 1}`).slice(-2),
		(`0${d.getDate()}`).slice(-2),
	].join("/")
}

function time(sec: number): string {
	if (sec == 0) {
		return "--:--:--"
	}
	let d = new Date(sec * 1000)
	return [
		(`0${d.getHours()}`).slice(-2),
		(`0${d.getMinutes()}`).slice(-2),
		(`0${d.getSeconds()}`).slice(-2),
	].join(":")
}
