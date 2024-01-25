import * as vue from "@vue/runtime-dom"

const TAG = "spinner"

export const V = vue.defineComponent({
	render() {
		return vue.h(TAG, { class: { "filer-spinner": true } })
	},
})
