import * as vue from "@vue/runtime-dom"

import * as url from "@/renderer/util/url"

const AUD = "aud"
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
		const aud = vue.useTemplateRef<HTMLAudioElement>(AUD)
		const src = vue.useTemplateRef<HTMLSourceElement>(SRC)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			aud.value!.onloadeddata = () => {
				head.value = `${aud.value!.duration} sec | ${props.size.toLocaleString()} byte`
			}
			vue.nextTick(() => {
				src.value!.src = url.fileUrl(props.path)
			})
		})

		vue.onBeforeUnmount(() => {
			src.value!.src = ""
			aud.value!.load()
		})

		const toggle = () => {
			if (aud.value) {
				if (aud.value.paused) {
					aud.value.play()
				}
				else {
					aud.value.pause()
				}
			}
		}

		const ff = () => {
			if (aud.value) {
				aud.value.currentTime += 10
			}
		}

		const rw = () => {
			if (aud.value) {
				aud.value.currentTime -= 10
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
		return vue.h("div", { class: { "viewer-audio": true } }, [
			vue.h("div", { class: { "viewer-audio-head": true } }, this.head),
			vue.h(
				"div",
				{ class: { "viewer-audio-stat": true } },
				this.prog
					? vue.h("div", { class: { "viewer-audio-prog": true } }, undefined)
					: undefined,
			),
			vue.h("div", { class: { "viewer-audio-back": true } }, [
				vue.h("audio", {
					ref: AUD,
					class: { "viewer-audio-aud": true },
					preload: "none",
					autoplay: "",
					controls: "",
					controlslist: "nofullscreen",
					loop: "",
				}, [
					vue.h("source", {
						ref: SRC,
					}, undefined),
				]),
			]),
		])
	},
})
