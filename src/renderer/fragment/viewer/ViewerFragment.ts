import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as MonacoComponent from "@renderer/fragment/viewer/MonacoComponent"
import root from "@renderer/Root"

type reactive = {
	type: "text" | null
	path: string
	data: string
}

const TAG = "viewer"

export const V = vue.defineComponent({
	setup() {
		const reactive = vue.reactive<reactive>({
			type: null,
			path: "",
			data: "",
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Viewer.Open.CH, (_: number, data: Bridge.Viewer.Open.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "opened" }],
					})
					reactive.type = data.type
					reactive.path = data.path
					reactive.data = data.data
				})
				.on(Bridge.Viewer.Close.CH, (_: number, _data: Bridge.Viewer.Close.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "closed" }],
					})
					reactive.type = null
					reactive.path = ""
					reactive.data = ""
				})
		})

		return {
			reactive,
		}
	},

	render() {
		if (this.reactive.type == "text") {
			return vue.h(TAG, { class: { "viewer-fragment": true } }, [
				vue.h(MonacoComponent.V, {
					class: { "viewer-monaco": true },
					path: this.reactive.path,
					value: this.reactive.data,
				}, undefined),
			])
		}
		return null
	},
})
