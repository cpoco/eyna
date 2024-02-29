import * as vue from "@vue/runtime-dom"

import * as Conf from "@/app/Conf"

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("SystemProvider")

function _create() {
	const reactive = vue.reactive({
		ready: false,
		active: false,
		dynamicFontSize: Conf.DYNAMIC_FONT_SIZE,
		dynamicLineHeight: Conf.DYNAMIC_LINE_HEIGHT,
	})
	const refs = vue.toRefs(reactive)

	const e = document.querySelector<HTMLElement>(":root")
	e?.style.setProperty(Conf.DYNAMIC_NAVBAR_HEIGHT_STYLE, `${Conf.DYNAMIC_NAVBAR_HEIGHT}px`)
	e?.style.setProperty(Conf.DYNAMIC_FONT_SIZE_STYLE, `${Conf.DYNAMIC_FONT_SIZE}px`)
	e?.style.setProperty(Conf.DYNAMIC_LINE_HEIGHT_STYLE, `${Conf.DYNAMIC_LINE_HEIGHT}px`)

	vue.watch(refs.dynamicFontSize, (v) => {
		const e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.DYNAMIC_FONT_SIZE_STYLE, `${v}px`)
	})

	vue.watch(refs.dynamicLineHeight, (v) => {
		const e = document.querySelector<HTMLElement>(":root")
		e?.style.setProperty(Conf.DYNAMIC_LINE_HEIGHT_STYLE, `${v}px`)
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
