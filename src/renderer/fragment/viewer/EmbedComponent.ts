import * as vue from "@vue/runtime-dom"

import * as url from "@/renderer/util/url"

const EMBED = "embed"

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
		const embed = vue.useTemplateRef<HTMLEmbedElement>(EMBED)

		const head = vue.ref<string>("")
		const prog = vue.ref<boolean>(false)

		vue.onMounted(() => {
			embed.value!.onload = () => {
				head.value = `${props.size.toLocaleString()} byte`
			}
			vue.nextTick(() => {
				embed.value!.type = props.mime
				embed.value!.src = url.fileUrl(props.path) + "#toolbar=0&view=Fit"
			})
		})

		return {
			head,
			prog,
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
				ref: EMBED,
				class: { "viewer-embed-embed": true },
			}, undefined),
		])
	},
})
