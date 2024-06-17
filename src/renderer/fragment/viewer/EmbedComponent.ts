import * as vue from "@vue/runtime-dom"

export const V = vue.defineComponent({
	props: {
		mime: {
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
		const embed = vue.ref<HTMLEmbedElement>()

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			embed.value!.onload = () => {
				head.value = `${props.size.toLocaleString()} byte`
			}
			vue.nextTick(() => {
				embed.value!.type = props.mime
				embed.value!.src = `file://${props.path}`
			})
		})

		return {
			head,
			prog,
			embed,
		}
	},

	render() {
		return vue.h("div", { class: { "viewer-embed": true } }, [
			vue.h("div", { class: { "viewer-embed-head": true } }, this.head),
			vue.h(
				"div",
				{ class: { "viewer-embed-stat": true } },
				this.prog
					? vue.h("div", { class: { "viewer-embed-prog": true } }, undefined)
					: undefined,
			),
			vue.h("embed", {
				ref: "embed",
				class: { "viewer-embed-embed": true },
			}, undefined),
		])
	},
})
