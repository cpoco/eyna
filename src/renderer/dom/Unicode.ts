import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

const DSC = "/"
const LRO = "\u{202D}"
const RLO = "\u{202E}"

export function highlight(str: string | null | undefined): vue.VNodeArrayChildren | undefined {
	if (str == null) {
		return undefined
	}

	let ary = [str]
	ary = Util.split(ary, DSC)
	ary = Util.split(ary, LRO)
	ary = Util.split(ary, RLO)

	let ret: vue.VNodeArrayChildren = []
	for (var s of ary) {
		if (s == "." || s == "..") {
			ret.push(vue.h("span", { class: { "c-trv": true } }, s))
		}
		else if (s == DSC) {
			ret.push(vue.h("span", { class: { "c-dsc": true } }, s))
		}
		else if (s == LRO) {
			ret.push(vue.h("span", { class: { "c-lro": true } }, "[LRO]"))
		}
		else if (s == RLO) {
			ret.push(vue.h("span", { class: { "c-rlo": true } }, "[RLO]"))
		}
		else {
			ret.push(s)
		}
	}
	return ret
}
