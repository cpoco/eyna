import * as vue from "@vue/runtime-dom"

const DSC = "/"
const ALM = "\u{061C}"
const LRM = "\u{200E}"
const RLM = "\u{200F}"
const LRE = "\u{202A}"
const RLE = "\u{202B}"
const PDF = "\u{202C}"
const LRO = "\u{202D}"
const RLO = "\u{202E}"
const LRI = "\u{2066}"
const RLI = "\u{2067}"
const FSI = "\u{2068}"
const PDI = "\u{2069}"

const REG1 = new RegExp(`(${DSC})`, "u")
const REG2 = new RegExp(`(${ALM}|${LRM}|${RLM}|${LRE}|${RLE}|${PDF}|${LRO}|${RLO}|${LRI}|${RLI}|${FSI}|${PDI})`, "u")

const MAP: { [s: string]: string } = {
	[ALM]: "[ALM]",
	[LRM]: "[LRM]",
	[RLM]: "[RLM]",
	[LRE]: "[LRE]",
	[RLE]: "[RLE]",
	[PDF]: "[PDF]",
	[LRO]: "[LRO]",
	[RLO]: "[RLO]",
	[LRI]: "[LRI]",
	[RLI]: "[RLI]",
	[FSI]: "[FSI]",
	[PDI]: "[PDI]",
}

export function highlight(str: string | null | undefined, err: boolean = false): vue.VNodeArrayChildren | undefined {
	if (str == null) {
		return undefined
	}

	let ret: vue.VNodeArrayChildren = []
	for (const s1 of str.split(REG1)) {
		if (s1 == "") {
			continue
		}
		if (s1 == "." || s1 == "..") {
			ret.push(vue.h("span", { class: { "c-trv": true } }, s1))
		}
		else if (s1 == DSC) {
			ret.push(vue.h("span", { class: { "c-dsc": !err, "c-err": err } }, s1))
		}
		else {
			for (const s2 of s1.split(REG2)) {
				if (s2 == "") {
					continue
				}
				const ss = MAP[s2]
				if (ss) {
					ret.push(vue.h("span", { class: { "c-unicode": true } }, ss))
				}
				else {
					ret.push(vue.h("span", s2))
				}
			}
		}
	}
	return ret
}
