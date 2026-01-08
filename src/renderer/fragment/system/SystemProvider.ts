import * as vue from "@vue/runtime-dom"

import * as Conf from "@/app/Conf"

type Reactive = {
	app: {
		ready: boolean
		active: boolean
	}
	overlay: {
		version: boolean
	}
	style: {
		fontFamily: string
		fontSize: number
		lineHeight: number
	}
}

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("SystemProvider")

function _create() {
	const reactive = vue.reactive<Reactive>({
		app: {
			ready: false,
			active: false,
		},
		overlay: {
			version: false,
		},
		style: {
			fontFamily: "",
			fontSize: 0,
			lineHeight: 0,
		},
	})

	vue.watch(
		() => {
			return reactive.style.fontFamily
		},
		(v) => {
			document.documentElement.style.setProperty(Conf.STYLE_FONT_FAMILY, v)
		},
	)
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

export function create(app: vue.App<Element>): void {
	app.provide(KEY, _create())
}

export function inject(): ReturnType<typeof _create> {
	return vue.inject(KEY)!
}
