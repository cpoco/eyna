import * as vue from "@/renderer/Vue"

const TAG = "spinner"

export const V = vue.defineComponent({
	render() {
		return vue.h(TAG, { class: { "filer-spinner": true } })
	},
})
