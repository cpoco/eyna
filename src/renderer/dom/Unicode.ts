import * as vue from "@vue/runtime-dom"

import * as BIDI from "@/renderer/util/bidi"

const FRN = "\0"
const DSC = "/"
const REG = new RegExp(`(${FRN}|${DSC})`, "u")

export function highlight(str: string | null | undefined, err: boolean = false): vue.VNodeArrayChildren | undefined {
	if (str === null || str === undefined) {
		return undefined
	}

	const ret: vue.VNodeArrayChildren = []
	for (const s1 of str.split(REG)) {
		if (s1 === "") {
			continue
		}
		if (s1 === "." || s1 === "..") {
			ret.push(vue.h("span", { class: { "c-trv": true } }, s1))
		}
		else if (s1 === FRN) {
			ret.push(vue.h("span", " "))
		}
		else if (s1 === DSC) {
			ret.push(vue.h("span", { class: { "c-dsc": !err, "c-err": err } }, s1))
		}
		else {
			for (const s2 of s1.split(BIDI.REG)) {
				if (s2 === "") {
					continue
				}
				const ss = BIDI.MAP[s2]
				if (ss) {
					ret.push(vue.h("span", { class: { "c-bidi": true } }, ss))
				}
				else {
					ret.push(vue.h("span", s2))
				}
			}
		}
	}
	return ret
}
