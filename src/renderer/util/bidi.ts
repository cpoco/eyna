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

export const MAP: Record<string, string> = {
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

const PATTERN = `(${ALM}|${LRM}|${RLM}|${LRE}|${RLE}|${PDF}|${LRO}|${RLO}|${LRI}|${RLI}|${FSI}|${PDI})`

export const REG = new RegExp(PATTERN, "u")
export const REG_GLOBAL = new RegExp(PATTERN, "gu")
