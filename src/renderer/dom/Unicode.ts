import * as vue from "@vue/runtime-dom"

const DSC = "/"
const LRO = "\u{202D}"
const RLO = "\u{202E}"

const REG = new RegExp(`(${DSC}|${LRO}|${RLO})`, "u")

export function highlight(str: string | null | undefined, err: boolean = false): vue.VNodeArrayChildren | undefined {
	if (str == null) {
		return undefined
	}

	let ret: vue.VNodeArrayChildren = []
	for (const s of str.split(REG)) {
		if (s == "") {
			continue
		}
		if (s == "." || s == "..") {
			ret.push(vue.h("span", { class: { "c-trv": true } }, s))
		}
		else if (s == DSC) {
			ret.push(vue.h("span", { class: { "c-dsc": !err, "c-err": err } }, s))
		}
		else if (s == LRO) {
			ret.push(vue.h("span", { class: { "c-lro": true } }, "[LRO]"))
		}
		else if (s == RLO) {
			ret.push(vue.h("span", { class: { "c-rlo": true } }, "[RLO]"))
		}
		else {
			ret.push(vue.h("span", s))
		}
	}
	return ret
}
