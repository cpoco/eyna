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
		const aud = vue.ref<HTMLAudioElement>()
		const src = vue.ref<HTMLSourceElement>()

		vue.onMounted(() => {
			aud.value!.onloadeddata = () => {
				head.value = `${props.size.toLocaleString()} byte | ${aud.value!.duration} sec`
			}
			vue.nextTick(() => {
				src.value!.src = `file://${props.path}`
			})
		})

		return {
			head,
			aud,
			src,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-audio": true } }, [
			vue.h("div", { class: { "viewer-audio-head": true } }, this.head),
			vue.h("div", { class: { "viewer-audio-back": true } }, [
				vue.h("audio", {
					ref: "aud",
					class: { "viewer-audio-aud": true },
					autoplay: "",
					controls: "",
					controlslist: "nofullscreen",
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
