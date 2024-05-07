import * as Native from "@eyna/native/lib/renderer"
import * as vue from "@vue/runtime-dom"

import * as Unicode from "@/renderer/dom/Unicode"
import * as FilerProvider from "@/renderer/fragment/filer/FilerProvider"

const TAG = "navbar"

export const V = vue.defineComponent({
	setup() {
		const filer = FilerProvider.inject()

		return {
			title: filer.reactive.title,
		}
	},

	render() {
		const title = this.title.attr[0]?.full ?? this.title.wd
		const err = this.title.attr[0]?.file_type == Native.AttributeFileType.None

		return vue.h(TAG, { class: { "navbar-fragment": true } }, [
			vue.h("div", { class: { "navbar-title": true } }, Unicode.highlight(title, err)),
		])
	},
})
