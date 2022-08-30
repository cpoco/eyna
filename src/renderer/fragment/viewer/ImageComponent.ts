import * as vue from "vue"

export const V = vue.defineComponent({
	props: {
		"path": {
			required: true,
			type: String,
		},
	},

	setup(props) {
		const head = vue.ref<string>("")
		const img = vue.ref<HTMLImageElement>()

		vue.onMounted(() => {
			img.value!.onload = () => {
				head.value = `${img.value!.naturalWidth.toLocaleString()} × ${img.value!.naturalHeight.toLocaleString()}`
			}
			vue.nextTick(() => {
				img.value!.src = `file://${props.path}`
			})
		})
		
		vue.watch(vue.toRefs(props).path, () => {
			vue.nextTick(() => {
				img.value!.src = `file://${props.path}`
			})
		})

		return {
			head,
			img,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-image": true } }, [
			vue.h("div", { class: { "viewer-image-head": true } }, this.head),
			vue.h("div", { class: { "viewer-image-back": true } }, [
				vue.h("img", {
					ref: "img",
					class: { "viewer-image-img": true },
				}, undefined),
			]),
		])
	},
})
