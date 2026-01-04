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
	href: string[]
	path: string[]
	size: bigint[]
}

const TAG = "viewer"

const DIFF = "diff"
const AUDIO = "audio"
const VIDEO = "video"

export const V = vue.defineComponent({
	setup() {
		const diff = vue.useTemplateRef<InstanceType<typeof MonacoDiffComponent.V>>(DIFF)
		const audio = vue.useTemplateRef<InstanceType<typeof AudioComponent.V>>(AUDIO)
		const video = vue.useTemplateRef<InstanceType<typeof VideoComponent.V>>(VIDEO)

		const reactive = vue.reactive<Reactive>({
			type: null,
			mime: [],
			href: [],
			path: [],
			size: [],
		})

		vue.onMounted(() => {
			root
				.on(Bridge.Viewer.Open.CH, (_, data) => {
					root.send(Bridge.Viewer.Event.CH, -1, "opened")
					if (data.type !== null) {
						reactive.type = data.type
						reactive.mime = data.mime
						reactive.href = data.href
						reactive.path = data.path
						reactive.size = data.size
					}
				})
				.on(Bridge.Viewer.Close.CH, (_, _data) => {
					root.send(Bridge.Viewer.Event.CH, -1, "closed")
					reactive.type = null
					reactive.mime = []
					reactive.href = []
					reactive.path = []
					reactive.size = []
				})
				.on(Bridge.Viewer.Diff.CH, (_, data) => {
					diff.value?.[data]()
				})
				.on(Bridge.Viewer.Audio.CH, (_, data) => {
					audio.value?.[data]()
				})
				.on(Bridge.Viewer.Video.CH, (_, data) => {
					video.value?.[data]()
				})
		})

		return {
			reactive,
		}
	},

	render() {
		if (this.reactive.type === Bridge.Viewer.Type.Text) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoComponent.V, {
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type === Bridge.Viewer.Type.Diff) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoDiffComponent.V, {
					ref: DIFF,
					original_href: this.reactive.href[0] ?? "",
					modified_href: this.reactive.href[1] ?? "",
					original: this.reactive.path[0] ?? "",
					modified: this.reactive.path[1] ?? "",
					original_size: this.reactive.size[0] ?? 0n,
					modified_size: this.reactive.size[1] ?? 0n,
				}, undefined),
			])
		}
		if (this.reactive.type === Bridge.Viewer.Type.Hex) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(MonacoHexComponent.V, {
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type === Bridge.Viewer.Type.Image) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(ImageComponent.V, {
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type === Bridge.Viewer.Type.Audio) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(AudioComponent.V, {
					ref: AUDIO,
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type === Bridge.Viewer.Type.Video) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(VideoComponent.V, {
					ref: VIDEO,
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		else if (this.reactive.type === Bridge.Viewer.Type.Embed) {
			return vue.h(TAG, {
				class: {
					"viewer-fragment": true,
				},
			}, [
				vue.h(EmbedComponent.V, {
					mime: this.reactive.mime[0] ?? "",
					href: this.reactive.href[0] ?? "",
					path: this.reactive.path[0] ?? "",
					size: this.reactive.size[0] ?? 0n,
				}, undefined),
			])
		}
		return null
	},
})
