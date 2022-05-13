import * as _ from "lodash-es"
import * as vue from "vue"

import * as Native from "@module/native/ts/renderer"
import * as FilerProvider from "@renderer/fragment/filer/FilerProvider"
import * as IconComponent from "@renderer/fragment/filer/IconComponent"
import * as SpinnerComponent from "@renderer/fragment/filer/SpinnerComponent"

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
			return _.isEmpty(props.cell.attr)
		})

		const file_type = vue.computed((): Native.AttributeFileType[] => {
			return _.map<Native.Attribute, Native.AttributeFileType>(props.cell.attr, (it) => {
				return it ? it.file_type : Native.AttributeFileType.none
			})
		})

		const link_type = vue.computed((): Native.AttributeLinkType[] => {
			return _.map<Native.Attribute, Native.AttributeLinkType>(props.cell.attr, (it) => {
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
			if (ftype == Native.AttributeFileType.home || ftype == Native.AttributeFileType.homeuser) {
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

		let name: vue.AllowedComponentProps = { class: { "filer-cfile": true } }
		let link: vue.AllowedComponentProps = { class: { "filer-clink": true } }
		let trgt: vue.AllowedComponentProps = { class: { "filer-ctrgt": true } }

		let ftype = this.file_type[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			let ltype = this.link_type[0] ?? Native.AttributeLinkType.none
			if (ltype == Native.AttributeLinkType.shortcut) {
				name.class = _.assign(name.class, { "c-shortcut": true })
			}
			else if (ltype == Native.AttributeLinkType.bookmark) {
				name.class = _.assign(name.class, { "c-bookmark": true })
			}
			else {
				name.class = _.assign(name.class, { "c-file": true })
			}
		}
		else if (ftype == Native.AttributeFileType.link) {
			name.class = _.assign(name.class, { "c-link": true })
		}
		else if (ftype == Native.AttributeFileType.directory) {
			name.class = _.assign(name.class, { "c-directory": true })
		}
		else if (ftype == Native.AttributeFileType.special) {
			name.class = _.assign(name.class, { "c-special": true })
		}

		if (this.is_link) {
			let ftype2 = this.file_type[1] ?? Native.AttributeFileType.none
			if (ftype2 == Native.AttributeFileType.none) {
				trgt.class = _.assign(trgt.class, { "c-error": true })
			}
			else if (ftype2 == Native.AttributeFileType.file) {
				let ltype2 = this.link_type[1] ?? Native.AttributeLinkType.none
				if (ltype2 == Native.AttributeLinkType.shortcut) {
					trgt.class = _.assign(trgt.class, { "c-shortcut": true })
				}
				else if (ltype2 == Native.AttributeLinkType.bookmark) {
					trgt.class = _.assign(trgt.class, { "c-bookmark": true })
				}
			}
			else if (ftype2 == Native.AttributeFileType.link) {
				trgt.class = _.assign(trgt.class, { "c-link": true })
			}
			else if (ftype2 == Native.AttributeFileType.directory) {
				trgt.class = _.assign(trgt.class, { "c-directory": true })
			}
			else if (ftype2 == Native.AttributeFileType.special) {
				trgt.class = _.assign(trgt.class, { "c-special": true })
			}
		}

		return vue.h(TAG, node, [
			vue.h(
				"span",
				{ class: { "filer-cname": true } },
				this.is_link
					? [
						vue.h(IconComponent.V, { type: this.cell.attr[0]?.file_type ?? Native.AttributeFileType.none }),
						vue.h("span", name, this.cell.attr[0]?.rltv ?? undefined),
						vue.h("span", link, "->"),
						vue.h(IconComponent.V, { type: this.cell.attr[1]?.file_type ?? Native.AttributeFileType.none }),
						vue.h("span", trgt, this.cell.attr[0]?.link ?? undefined),
					]
					: [
						vue.h(IconComponent.V, { type: this.cell.attr[0]?.file_type ?? Native.AttributeFileType.none }),
						vue.h("span", name, this.cell.attr[0]?.rltv ?? undefined),
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
