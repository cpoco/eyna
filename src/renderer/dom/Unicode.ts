import * as vue from "@/renderer/Vue"

import * as Util from "@eyna/util/ts/Util"

const RLO = "\u{202E}"

export function rol(str: string | null | undefined): vue.VNodeArrayChildren | undefined {
	if (str == null) {
		return undefined
	}

	let ret: vue.VNodeArrayChildren = []
	for (var s of Util.split([str], RLO)) {
		if (s == RLO) {
			ret.push(vue.h("span", { class: { "c-code": true } }, "[RLO]"))
		}
		else {
			ret.push(s)
		}
	}
	return ret
}
