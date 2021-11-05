import * as vue from "vue"

export const TAG = "spinner"

export const V = vue.defineComponent({

	render() {
		return vue.h(TAG, { class: { "spinner": true } })
	}

})
