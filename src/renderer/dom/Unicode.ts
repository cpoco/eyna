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

const REG = new RegExp(
	`(${DSC}|${ALM}|${LRM}|${RLM}|${LRE}|${RLE}|${PDF}|${LRO}|${RLO}|${LRI}|${RLI}|${FSI}|${PDI})`,
	"u",
)

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
		else {
			const ss = MAP[s]
			if (ss) {
				ret.push(vue.h("span", { class: { "c-unicode": true } }, ss))
			}
			else {
				ret.push(vue.h("span", s))
			}
		}
	}
	return ret
}
