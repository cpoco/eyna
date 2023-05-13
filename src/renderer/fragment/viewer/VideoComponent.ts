import * as vue from "@/renderer/Vue"

export const V = vue.defineComponent({
	props: {
		"path": {
			required: true,
			type: String,
		},
		"size": {
			required: true,
			type: Object as vue.PropType<BigInt>,
		},
	},

	setup(props) {
		const head = vue.ref<string>("")
		const vid = vue.ref<HTMLVideoElement>()
		const src = vue.ref<HTMLSourceElement>()

		vue.onMounted(() => {
			vid.value!.onloadeddata = () => {
				head.value = `${vid.value!.videoWidth.toLocaleString()}`
					+ ` x ${vid.value!.videoHeight.toLocaleString()}`
					+ ` | ${props.size.toLocaleString()} byte`
					+ ` | ${vid.value!.duration} sec`
			}
			vue.nextTick(() => {
				src.value!.src = `file://${props.path}`
			})
		})

		return {
			head,
			vid,
			src,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-video": true } }, [
			vue.h("div", { class: { "viewer-video-head": true } }, this.head),
			vue.h("div", { class: { "viewer-video-back": true } }, [
				vue.h("video", {
					ref: "vid",
					class: { "viewer-video-vid": true },
					autoplay: "",
					controls: "",
					controlslist: "nofullscreen",
					disablepictureinpicture: "",
					loop: "",
				}, [
					vue.h("source", {
						ref: "src",
					}, undefined),
				]),
			]),
		])
	},
})
