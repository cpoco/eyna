import * as vue from "@vue/runtime-dom"

import * as url from "@/renderer/util/url"

const VID = "vid"
const SRC = "src"

export const V = vue.defineComponent({
	props: {
		path: {
			required: true,
			type: String,
		},
		size: {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const vid = vue.useTemplateRef<HTMLVideoElement>(VID)
		const src = vue.useTemplateRef<HTMLSourceElement>(SRC)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			vid.value!.onloadeddata = () => {
				head.value = `${vid.value!.videoWidth.toLocaleString()}`
					+ ` x ${vid.value!.videoHeight.toLocaleString()}`
					+ ` | ${vid.value!.duration} sec`
					+ ` | ${props.size.toLocaleString()} byte`
					+ ` | ${window.devicePixelRatio}`
			}
			vue.nextTick(() => {
				src.value!.src = url.fileUrl(props.path)
			})
		})

		// vue.onBeforeUnmount(() => {
		// 	src.value!.src = ""
		// 	vid.value!.load()
		// })

		const toggle = () => {
			if (vid.value) {
				if (vid.value.paused) {
					vid.value.play()
				}
				else {
					vid.value.pause()
				}
			}
		}

		const ff = () => {
			if (vid.value) {
				vid.value.currentTime += 10
			}
		}

		const rw = () => {
			if (vid.value) {
				vid.value.currentTime -= 10
			}
		}

		return {
			head,
			prog,
			toggle,
			ff,
			rw,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-video": true } }, [
			vue.h("div", { class: { "viewer-video-head": true } }, this.head),
			vue.h(
				"div",
				{ class: { "viewer-video-stat": true } },
				this.prog
					? vue.h("div", { class: { "viewer-video-prog": true } }, undefined)
					: undefined,
			),
			vue.h("div", { class: { "viewer-video-back": true } }, [
				vue.h("video", {
					ref: VID,
					class: { "viewer-video-vid": true },
					preload: "none",
					autoplay: "",
					controls: "",
					controlslist: "nofullscreen",
					disablepictureinpicture: "",
					loop: "",
				}, [
					vue.h("source", {
						ref: SRC,
					}, undefined),
				]),
				vue.h("div", { class: { "viewer-video-line-l": true } }),
				vue.h("div", { class: { "viewer-video-line-r": true } }),
				vue.h("div", { class: { "viewer-video-line-t": true } }),
				vue.h("div", { class: { "viewer-video-line-b": true } }),
			]),
		])
	},
})
