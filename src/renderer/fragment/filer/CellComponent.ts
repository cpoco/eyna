import * as vue from "vue"

import * as Native from "@module/native/ts/renderer"
import * as FilerProvider from "@renderer/fragment/filer/FilerProvider"
import * as SpinnerComponent from "@renderer/fragment/filer/SpinnerComponent"
import * as Font from "@renderer/dom/Font"
import * as Unicode from "@renderer/dom/Unicode"
import * as Util from "@util/Util"

const TAG = "cell"

export const V = vue.defineComponent({
	props: {
		cell: {
			required: true,
			type: Object as vue.PropType<FilerProvider.Cell>,
		},
	},

	setup(props) {
		const is_empty = vue.computed((): boolean => {
			return props.cell.attr.length == 0
		})

		const file_type = vue.computed((): Native.AttributeFileType[] => {
			return props.cell.attr.map((it) => {
				return it ? it.file_type : Native.AttributeFileType.none
			})
		})

		const link_type = vue.computed((): Native.AttributeLinkType[] => {
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

		return {
			is_empty,
			file_type,
			link_type,
			is_link,
			is_size,
			is_date,
		}
	},

	render() {
		let node: vue.AllowedComponentProps = {
			class: this.cell.class,
			style: this.cell.style,
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

		let fraw = Font.error
		let traw = Font.error

		let ftype = this.file_type[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			let ltype = this.link_type[0] ?? Native.AttributeLinkType.none
			if (ltype == Native.AttributeLinkType.shortcut) {
				name.class["c-shortcut"] = true
				fraw = Font.link_external
			}
			else if (ltype == Native.AttributeLinkType.bookmark) {
				name.class["c-bookmark"] = true
				fraw = Font.link_external
			}
			else {
				name.class["c-file"] = true
				fraw = Font.file
			}
		}
		else if (ftype == Native.AttributeFileType.link) {
			name.class["c-link"] = true
			fraw = Font.link_external
		}
		else if (ftype == Native.AttributeFileType.directory) {
			name.class["c-directory"] = true
			fraw = Font.folder
		}
		else if (ftype == Native.AttributeFileType.drive) {
			fraw = Font.symbol_method
		}
		else if (ftype == Native.AttributeFileType.homeuser) {
			fraw = Font.home
		}
		else if (ftype == Native.AttributeFileType.special) {
			name.class["c-special"] = true
			fraw = Font.gear
		}
		else {
			name.class["c-miss"] = true
			fraw = Font.error
		}

		if (this.is_link) {
			let ftype2 = this.file_type[1] ?? Native.AttributeFileType.none
			if (ftype2 == Native.AttributeFileType.file) {
				let ltype2 = this.link_type[1] ?? Native.AttributeLinkType.none
				if (ltype2 == Native.AttributeLinkType.shortcut) {
					trgt.class["c-shortcut"] = true
					traw = Font.link_external
				}
				else if (ltype2 == Native.AttributeLinkType.bookmark) {
					trgt.class["c-bookmark"] = true
					traw = Font.link_external
				}
				else {
					trgt.class["c-file"] = true
					traw = Font.file
				}
			}
			else if (ftype2 == Native.AttributeFileType.link) {
				let ftype3 = Util.last(this.file_type) ?? Native.AttributeFileType.none
				if (ftype3 == Native.AttributeFileType.none) {
					trgt.class["c-warn"] = true
					traw = Font.link_external
				}
				else {
					trgt.class["c-link"] = true
					traw = Font.link_external
				}
			}
			else if (ftype2 == Native.AttributeFileType.directory) {
				trgt.class["c-directory"] = true
				traw = Font.folder
			}
			else if (ftype2 == Native.AttributeFileType.special) {
				trgt.class["c-special"] = true
				traw = Font.gear
			}
			else {
				trgt.class["c-miss"] = true
				traw = Font.error
			}
		}

		return vue.h(TAG, node, [
			vue.h(
				"span",
				{ class: { "filer-cname": true } },
				this.is_link
					? [
						vue.h("span", icon, fraw),
						vue.h("span", name, Unicode.rol(this.cell.attr[0]?.rltv)),
						vue.h("span", link, "->"),
						vue.h("span", icon, traw),
						vue.h("span", trgt, Unicode.rol(this.cell.attr[0]?.link)),
					]
					: [
						vue.h("span", icon, fraw),
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
