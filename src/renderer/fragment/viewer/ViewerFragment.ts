import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as MonacoComponent from "@renderer/fragment/viewer/MonacoComponent"
import root from "@renderer/Root"

type reactive = {
	type: "text" | null
	data: string
}

const TAG = "viewer"

export const V = vue.defineComponent({
	setup() {
		const reactive = vue.reactive<reactive>({
			type: null,
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
					if (data.size <= 1_000_000) {
						window.fs.read(data.path).then((buff) => {
							reactive.data = (new TextDecoder()).decode(buff)
						})
					}
					else {
						reactive.data = "file too large"
					}
				})
				.on(Bridge.Viewer.Close.CH, (_: number, _data: Bridge.Viewer.Close.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "closed" }],
					})
					reactive.type = null
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
				vue.h(MonacoComponent.V, { class: { "viewer-monaco": true }, value: this.reactive.data }, undefined),
			])
		}
		return null
	},
})
