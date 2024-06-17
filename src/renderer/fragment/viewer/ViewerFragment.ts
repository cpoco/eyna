import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as AudioComponent from "@/renderer/fragment/viewer/AudioComponent"
import * as EmbedComponent from "@/renderer/fragment/viewer/EmbedComponent"
import * as ImageComponent from "@/renderer/fragment/viewer/ImageComponent"
import * as MonacoComponent from "@/renderer/fragment/viewer/MonacoComponent"
import * as MonacoDiffComponent from "@/renderer/fragment/viewer/MonacoDiffComponent"
import * as MonacoHexComponent from "@/renderer/fragment/viewer/MonacoHexComponent"
import * as VideoComponent from "@/renderer/fragment/viewer/VideoComponent"
import root from "@/renderer/Root"

type Reactive = {
	type: Bridge.Viewer.Type | null
	mime: string[]
	path: string[]
	size: bigint[]
}

const TAG = "viewer"

export const V = vue.defineComponent({
	setup() {
		const diff = vue.ref<InstanceType<typeof MonacoDiffComponent.V>>()

		const reactive = vue.reactive<Reactive>({
			type: null,
			mime: [],
			path: [],
			size: [],
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Viewer.Open.CH, (_: number, data: Bridge.Viewer.Open.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						id: -1,
						data: "opened",
					})
					if (data.type != null) {
						reactive.type = data.type
						reactive.mime = data.mime
						reactive.path = data.path
						reactive.size = data.size
					}
				})
				.on(Bridge.Viewer.Close.CH, (_: number, _data: Bridge.Viewer.Close.Data) => {
					root.send<Bridge.Viewer.Event.Send>({
						ch: "viewer-event",
						id: -1,
						data: "closed",
					})
					reactive.type = null
					reactive.mime = []
					reactive.path = []
					reactive.size = []
				})
				.on(Bridge.Viewer.Diff.CH, (_: number, data: Bridge.Viewer.Diff.Data) => {
					if (data == "prev") {
						diff.value?.prev()
					}
					else if (data == "next") {
						diff.value?.next()
					}
				})
		})

		return {
			reactive,
			diff,
		}
	},

	render() {
		if (this.reactive.type == Bridge.Viewer.Type.Text) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoComponent.V, {
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type == Bridge.Viewer.Type.Diff) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoDiffComponent.V, {
					ref: "diff",
					original: this.reactive.path[0] ?? "",
					modified: this.reactive.path[1] ?? "",
					original_size: this.reactive.size[0] ?? 0n,
					modified_size: this.reactive.size[1] ?? 0n,
				}, undefined),
			])
		}
		if (this.reactive.type == Bridge.Viewer.Type.Hex) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoHexComponent.V, {
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type == Bridge.Viewer.Type.Image) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(ImageComponent.V, {
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type == Bridge.Viewer.Type.Audio) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(AudioComponent.V, {
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type == Bridge.Viewer.Type.Video) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(VideoComponent.V, {
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type == Bridge.Viewer.Type.Embed) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(EmbedComponent.V, {
					mime: this.reactive.mime[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		return null
	},
})
