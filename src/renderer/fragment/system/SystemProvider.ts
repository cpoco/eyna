import * as vue from "vue"

import * as Conf from "@app/Conf"

const KEY: vue.InjectionKey<ReturnType<typeof create>> = Symbol("SystemProvider")

function create() {
	const ready = vue.ref<boolean>(false)
	const styleFontSize = vue.ref<number>(Conf.DYNAMIC_FONT_SIZE)
	const styleLineHeight = vue.ref<number>(Conf.DYNAMIC_LINE_HEIGHT)

	vue.watch(styleFontSize, (v) => {
		let e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.STYLE_DYNAMIC_FONT_SIZE, `0${v}px`)
	})

	vue.watch(styleLineHeight, (v) => {
		let e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.STYLE_DYNAMIC_LINE_HEIGHT, `${v}px`)
	})

	return {
		ready,
		styleFontSize,
		styleLineHeight,
	}
}

export function provide(): ReturnType<typeof create> {
	const v = create()
	vue.provide(KEY, v)
	return v
}

export function inject(): ReturnType<typeof create> {
	return vue.inject(KEY)!
}
