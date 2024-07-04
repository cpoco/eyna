import * as vue from "@vue/runtime-dom"

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
		const vid = vue.ref<HTMLVideoElement>()
		const src = vue.ref<HTMLSourceElement>()

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
				src.value!.src = `file://${props.path}`
			})
		})

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
			vid,
			src,
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
