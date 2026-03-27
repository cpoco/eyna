import * as vue from "@vue/runtime-dom"

import * as Unicode from "@/renderer/dom/Unicode"
import * as FilerProvider from "@/renderer/fragment/filer/FilerProvider"
import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"

const TAG = "navbar"

export const V = vue.defineComponent({
	setup() {
		const sys = SystemProvider.inject()
		const filer = FilerProvider.inject()

		return {
			app: sys.reactive.app,
			title: filer.reactive.title,
		}
	},

	render() {
		return vue.h(TAG, { class: { "navbar-fragment": true }, style: { background: this.app.background } }, [
			vue.h("div", { class: { "navbar-title": true } }, Unicode.highlight(this.title.wd, this.title.err)),
		])
	},
})
