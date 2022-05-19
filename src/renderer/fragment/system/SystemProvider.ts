import * as vue from "vue"

import * as Conf from "@app/Conf"

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("SystemProvider")

function _create() {
	const reactive = vue.reactive({
		ready: false,
		styleFontSize: Conf.DYNAMIC_FONT_SIZE,
		styleLineHeight: Conf.DYNAMIC_LINE_HEIGHT,
	})
	const refs = vue.toRefs(reactive)

	const e = document.querySelector<HTMLElement>(":root")
	e?.style.setProperty(Conf.STYLE_DYNAMIC_FONT_SIZE, `${Conf.DYNAMIC_FONT_SIZE}px`)
	e?.style.setProperty(Conf.STYLE_DYNAMIC_LINE_HEIGHT, `${Conf.DYNAMIC_LINE_HEIGHT}px`)

	vue.watch(refs.styleFontSize, (v) => {
		const e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.STYLE_DYNAMIC_FONT_SIZE, `${v}px`)
	})

	vue.watch(refs.styleLineHeight, (v) => {
		const e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.STYLE_DYNAMIC_LINE_HEIGHT, `${v}px`)
	})

	return {
		reactive,
	}
}

export function create(): ReturnType<typeof _create> {
	const v = _create()
	vue.provide(KEY, v)
	return v
}

export function inject(): ReturnType<typeof _create> {
	return vue.inject(KEY)!
}
