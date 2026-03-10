import * as vue from "@vue/runtime-dom"

const IMG = "img"

export const V = vue.defineComponent({
	props: {
		href: {
			required: true,
			type: String,
		},
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
		const img = vue.useTemplateRef<HTMLImageElement>(IMG)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			prog.value = true
			head.value = `${props.size.toLocaleString()} byte`
			img.value!.onload = () => {
				head.value = `${img.value!.naturalWidth.toLocaleString()}`
					+ ` x ${img.value!.naturalHeight.toLocaleString()}`
					+ ` | ${props.size.toLocaleString()} byte`
					+ ` | ${window.devicePixelRatio}`
				prog.value = false
			}
			vue.nextTick(() => {
				img.value!.src = props.href
			})
		})

		vue.watch(
			() => {
				return props.href
			},
			(v) => {
				vue.nextTick(() => {
					img.value!.src = v
				})
			},
		)

		return {
			head,
			prog,
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
					ref: IMG,
					class: { "viewer-image-img": true },
					style: { "visibility": this.prog ? "hidden" : "visible" },
				}, undefined),
				vue.h("div", {
					class: { "viewer-image-line-l": true },
					style: { "visibility": this.prog ? "hidden" : "visible" },
				}, undefined),
				vue.h("div", {
					class: { "viewer-image-line-r": true },
					style: { "visibility": this.prog ? "hidden" : "visible" },
				}, undefined),
				vue.h("div", {
					class: { "viewer-image-line-t": true },
					style: { "visibility": this.prog ? "hidden" : "visible" },
				}, undefined),
				vue.h("div", {
					class: { "viewer-image-line-b": true },
					style: { "visibility": this.prog ? "hidden" : "visible" },
				}, undefined),
			]),
		])
	},
})
