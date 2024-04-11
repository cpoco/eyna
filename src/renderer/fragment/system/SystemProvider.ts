import * as vue from "@vue/runtime-dom"

import * as Conf from "@/app/Conf"

type reactive = {
	app: {
		ready: boolean
		active: boolean
	}
	dialog: {
		version: boolean
	}
	style: {
		fontSize: number
		lineHeight: number
	}
}
const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("SystemProvider")

function _create() {
	const reactive = vue.reactive<reactive>({
		app: {
			ready: false,
			active: false,
		},
		dialog: {
			version: false,
		},
		style: {
			fontSize: 0,
			lineHeight: 0,
		},
	})

	vue.watch(
		() => {
			return reactive.style.fontSize
		},
		(v) => {
			document.documentElement.style.setProperty(Conf.STYLE_FONT_SIZE, `${v}px`)
		},
	)
	vue.watch(
		() => {
			return reactive.style.lineHeight
		},
		(v) => {
			document.documentElement.style.setProperty(Conf.STYLE_LINE_HEIGHT, `${v}px`)
		},
	)

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
