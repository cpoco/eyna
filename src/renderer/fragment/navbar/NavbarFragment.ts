import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as Unicode from "@/renderer/dom/Unicode"
import root from "@/renderer/Root"

type reactive = {
	title: string
}

const TAG = "navbar"

export const V = vue.defineComponent({
	setup() {
		const reactive = vue.reactive<reactive>({
			title: "",
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Navbar.Title.CH, (_: number, data: Bridge.Navbar.Title.Data) => {
					reactive.title = data
				})
		})

		return {
			reactive,
		}
	},

	render() {
		return vue.h(TAG, { class: { "navbar-fragment": true } }, [
			vue.h("div", { class: { "navbar-title": true } }, Unicode.highlight(this.reactive.title)),
		])
	},
})
