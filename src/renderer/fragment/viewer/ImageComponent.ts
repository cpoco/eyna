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
		const img = vue.ref<HTMLImageElement>()

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			img.value!.onload = () => {
				head.value = `${img.value!.naturalWidth.toLocaleString()}`
					+ ` x ${img.value!.naturalHeight.toLocaleString()}`
					+ ` | ${props.size.toLocaleString()} byte`
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
			prog,
			img,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-image": true } }, [
			vue.h("div", { class: { "viewer-image-head": true } }, this.head),
			vue.h(
				"div",
				{ class: { "viewer-image-stat": true } },
				this.prog
					? vue.h("div", { class: { "viewer-image-prog": true } }, undefined)
					: undefined,
			),
			vue.h("div", { class: { "viewer-image-back": true } }, [
				vue.h("img", {
					ref: "img",
					class: { "viewer-image-img": true },
				}, undefined),
			]),
		])
	},
})
