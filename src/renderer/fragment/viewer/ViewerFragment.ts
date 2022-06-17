import * as vue from "vue"

import * as Bridge from "@/bridge/Bridge"
import * as MonacoComponent from "@/renderer/fragment/viewer/MonacoComponent"
import root from "@/renderer/Root"

type reactive = {
	type: "text" | "image" | "error" | null
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

		const img = vue.ref<HTMLImageElement>()

		vue.onMounted(() => {
			root
				.on(Bridge.Viewer.Open.CH, (_: number, data: Bridge.Viewer.Open.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						args: [-1, { event: "opened" }],
					})
					if (data.type == "text") {
						fetch(`file://${data.path}`)
							.then((res) => {
								return res.text()
							})
							.then((text) => {
								reactive.type = data.type
								reactive.path = data.path
								reactive.data = text
							})
							.catch((e) => {
								reactive.type = "error"
								reactive.path = ""
								reactive.data = e.message
							})
					}
					else if (data.type == "image") {
						reactive.type = data.type
						reactive.path = data.path
						reactive.data = ""
						vue.nextTick(() => {
							img.value!.onload = () => {
								console.log("img onload", img.value!.naturalWidth, img.value!.naturalHeight)
							}
							img.value!.src = `file://${data.path}`
						})
					}
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
			img,
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
					class: { "viewer-monaco": true },
					path: this.reactive.path,
					value: this.reactive.data,
				}, undefined),
			])
		}
		else if (this.reactive.type == "image") {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
					"viewer-fragment-flex": true,
					"viewer-fragment-background-image": true,
				},
			}, [
				vue.h("img", {
					ref: "img",
					class: { "viewer-image": true },
				}, undefined),
			])
		}
		else if (this.reactive.type == "error") {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
					"viewer-fragment-flex": true,
					"viewer-fragment-background": true,
				},
			}, [
				vue.h("span", {}, this.reactive.data),
			])
		}
		return null
	},
})
