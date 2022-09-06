import * as vue from "vue"

import * as Bridge from "@/bridge/Bridge"
import * as ImageComponent from "@/renderer/fragment/viewer/ImageComponent"
import * as MonacoComponent from "@/renderer/fragment/viewer/MonacoComponent"
import * as VideoComponent from "@/renderer/fragment/viewer/VideoComponent"
import root from "@/renderer/Root"

type reactive = {
	type: "text" | "image" | "video" | null
	path: string
	size: bigint
}

const TAG = "viewer"

export const V = vue.defineComponent({
	setup() {
		const reactive = vue.reactive<reactive>({
			type: null,
			path: "",
			size: 0n,
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Viewer.Open.CH, (_: number, data: Bridge.Viewer.Open.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "opened" }],
					})
					if (data.type == "text" || data.type == "image" || data.type == "video") {
						reactive.type = data.type
						reactive.path = data.path
						reactive.size = data.size
					}
				})
				.on(Bridge.Viewer.Close.CH, (_: number, _data: Bridge.Viewer.Close.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "closed" }],
					})
					reactive.type = null
					reactive.path = ""
					reactive.size = 0n
				})
		})

		return {
			reactive,
		}
	},

	render() {
		if (this.reactive.type == "text") {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoComponent.V, {
					path: this.reactive.path,
				}, undefined),
			])
		}
		else if (this.reactive.type == "image") {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(ImageComponent.V, {
					path: this.reactive.path,
					size: this.reactive.size,
				}, undefined),
			])
		}
		else if (this.reactive.type == "video") {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(VideoComponent.V, {
					path: this.reactive.path,
					size: this.reactive.size,
				}, undefined),
			])
		}
		return null
	},
})
