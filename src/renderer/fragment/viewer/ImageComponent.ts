import * as vue from "vue"

export const V = vue.defineComponent({
	props: {
		"path": {
			required: true,
			type: String,
		},
	},

	setup(props) {
		const img = vue.ref<HTMLImageElement>()

		vue.onMounted(() => {
			vue.nextTick(() => {
				img.value!.onload = () => {
					console.log("img onload", img.value!.naturalWidth, img.value!.naturalHeight)
				}
				img.value!.src = `file://${props.path}`
			})
		})

		return {
			img,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-image": true } }, [
			vue.h("img", {
				ref: "img",
				class: { "viewer-image-img": true },
			}, undefined),
		])
	},
})
