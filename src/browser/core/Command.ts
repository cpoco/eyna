import * as electron from "electron"
import * as _ from "lodash-es"
import * as fs from "node:fs"

import { Platform } from "@browser/core/Platform"

export namespace Command {
	export enum When {
		always = "always",
		filer = "filer",
		modal = "modal",
		viewer = "viewer",
	}
	export type WhenType = When.always | When.filer | When.modal | When.viewer

	export type KeyData = {
		[code: number]: {
			[When.always]?: Config
			[When.filer]?: Config
			[When.modal]?: Config
			[When.viewer]?: Config
		}
	}
	export type LoadConfig = {
		ver: string
		key: {
			when: When
			key: string | string[]
			cmd: string | string[]
			prm?: string | string[]
		}[]
	}
	export type Config = {
		when: When
		cmd: string[]
		prm: string[]
	}

	class Manager {
		private path: string = ""
		private when: WhenType = When.filer
		private keyData: KeyData = {}

		set whenType(when: string | undefined) {
			switch (when) {
				case When.always:
					break
				case When.filer: // fallthrough
				case When.modal: // fallthrough
				case When.viewer:
					this.when = when
			}
		}

		load(path: string) {
			this.path = path
			this.reload()
		}

		reload() {
			this.whenType = When.filer
			this.keyData = {}
			try {
				let loadConfig: LoadConfig = JSON.parse(fs.readFileSync(this.path, "utf8"))
				// console.log(JSON.stringify(loadConfig, null, 2))

				loadConfig.key.forEach((conf) => {
					try {
						let code: number = acceleratorToCode(conf.key)
						if (0 < code) {
							_.set(this.keyData, [code, conf.when], {
								when: conf.when,
								cmd: _.isString(conf.cmd) ? [conf.cmd] : _.isArray(conf.cmd) ? conf.cmd : [],
								prm: _.isString(conf.prm) ? [conf.prm] : _.isArray(conf.prm) ? conf.prm : [],
							})
						}
					}
					catch (err) {
						console.error(err)
					}
				})
				// console.log(JSON.stringify(this.keyData, null, 2))
			}
			catch (err) {
				console.error(err)
			}
		}

		get(input: electron.Input): Config | null {
			let code = inputToCode(input)
			return this.keyData[code]?.[When.always] ?? this.keyData[code]?.[this.when] ?? null
		}
	}

	export const manager = new Manager()

	function inputToCode(i: electron.Input): number {
		let ret = 0

		if (i.shift) {
			ret |= EventFlags.EF_SHIFT_DOWN << 12
		}
		// win ctrl
		// mac command
		if (Platform.win && i.control || Platform.mac && i.meta) {
			ret |= EventFlags.EF_CONTROL_DOWN << 12
		}
		// win alt
		// mac option
		if (i.alt) {
			ret |= EventFlags.EF_ALT_DOWN << 12
		}
		// mac control
		// if (Platform.mac && i.control) {
		// }

		ret |= CodeMap[i.code.toLowerCase()] ?? KeyMap[i.key.toLowerCase()] ?? 0

		return ret
	}

	function acceleratorToCode(key: string | string[]): number {
		let ret: number = 0
		let ary: string[] = _.isString(key) ? [key] : _.isArray(key) ? key : []

		ary.forEach((key: string) => {
			key = key.toLowerCase()
			ret |= (FlagMap[key] ?? 0) << 12
			ret |= CodeMap[key] ?? 0
			ret |= KeyMap[key] ?? 0
		})

		return ret
	}

	// https://chromium.googlesource.com/chromium/src.git/+/master/ui/events/event_constants.h
	enum EventFlags {
		EF_NONE = 0,
		EF_SHIFT_DOWN = 1 << 1,
		EF_CONTROL_DOWN = 1 << 2,
		EF_ALT_DOWN = 1 << 3,
	}

	// https://chromium.googlesource.com/chromium/src.git/+/master/ui/events/keycodes/keyboard_codes_posix.h
	enum KeyboardCode {
		VKEY_BACK = 0x08,
		VKEY_TAB = 0x09,
		VKEY_RETURN = 0x0D,
		VKEY_PAUSE = 0x13,
		VKEY_CAPITAL = 0x14,
		VKEY_ESCAPE = 0x1B,
		VKEY_SPACE = 0x20,
		VKEY_PRIOR = 0x21,
		VKEY_NEXT = 0x22,
		VKEY_END = 0x23,
		VKEY_HOME = 0x24,
		VKEY_LEFT = 0x25,
		VKEY_UP = 0x26,
		VKEY_RIGHT = 0x27,
		VKEY_DOWN = 0x28,
		VKEY_SNAPSHOT = 0x2C,
		VKEY_INSERT = 0x2D,
		VKEY_DELETE = 0x2E,

		VKEY_NUMPAD0 = 0x60,
		VKEY_NUMPAD1 = 0x61,
		VKEY_NUMPAD2 = 0x62,
		VKEY_NUMPAD3 = 0x63,
		VKEY_NUMPAD4 = 0x64,
		VKEY_NUMPAD5 = 0x65,
		VKEY_NUMPAD6 = 0x66,
		VKEY_NUMPAD7 = 0x67,
		VKEY_NUMPAD8 = 0x68,
		VKEY_NUMPAD9 = 0x69,
		VKEY_MULTIPLY = 0x6A,
		VKEY_ADD = 0x6B,
		VKEY_SEPARATOR = 0x6C,
		VKEY_SUBTRACT = 0x6D,
		VKEY_DECIMAL = 0x6E,
		VKEY_DIVIDE = 0x6F,

		VKEY_F1 = 0x70,
		VKEY_F2 = 0x71,
		VKEY_F3 = 0x72,
		VKEY_F4 = 0x73,
		VKEY_F5 = 0x74,
		VKEY_F6 = 0x75,
		VKEY_F7 = 0x76,
		VKEY_F8 = 0x77,
		VKEY_F9 = 0x78,
		VKEY_F10 = 0x79,
		VKEY_F11 = 0x7A,
		VKEY_F12 = 0x7B,
		VKEY_F13 = 0x7C,
		VKEY_F14 = 0x7D,
		VKEY_F15 = 0x7E,
		VKEY_F16 = 0x7F,
		VKEY_F17 = 0x80,
		VKEY_F18 = 0x81,
		VKEY_F19 = 0x82,
		VKEY_F20 = 0x83,
		VKEY_F21 = 0x84,
		VKEY_F22 = 0x85,
		VKEY_F23 = 0x86,
		VKEY_F24 = 0x87,

		VKEY_NUMLOCK = 0x90,
		VKEY_SCROLL = 0x91,
	}

	interface map {
		[key: string]: EventFlags | KeyboardCode | number
	}

	const FlagMap: map = {
		"shift": EventFlags.EF_SHIFT_DOWN,

		"ctrl": EventFlags.EF_CONTROL_DOWN,

		"alt": EventFlags.EF_ALT_DOWN,
	}

	const CodeMap: map = {
		"backspace": KeyboardCode.VKEY_BACK,
		"tab": KeyboardCode.VKEY_TAB,
		"return": KeyboardCode.VKEY_RETURN,
		"enter": KeyboardCode.VKEY_RETURN,
		"pause": KeyboardCode.VKEY_PAUSE,
		"capslock": KeyboardCode.VKEY_CAPITAL,
		"escape": KeyboardCode.VKEY_ESCAPE,
		"esc": KeyboardCode.VKEY_ESCAPE,
		"space": KeyboardCode.VKEY_SPACE,

		"pageup": KeyboardCode.VKEY_PRIOR,
		"pagedown": KeyboardCode.VKEY_NEXT,
		"end": KeyboardCode.VKEY_END,
		"home": KeyboardCode.VKEY_HOME,
		"insert": KeyboardCode.VKEY_INSERT,
		"delete": KeyboardCode.VKEY_DELETE,

		"arrowleft": KeyboardCode.VKEY_LEFT,
		"left": KeyboardCode.VKEY_LEFT,
		"arrowup": KeyboardCode.VKEY_UP,
		"up": KeyboardCode.VKEY_UP,
		"arrowright": KeyboardCode.VKEY_RIGHT,
		"right": KeyboardCode.VKEY_RIGHT,
		"arrowdown": KeyboardCode.VKEY_DOWN,
		"down": KeyboardCode.VKEY_DOWN,

		"printscreen": KeyboardCode.VKEY_SNAPSHOT,

		"numpadenter": KeyboardCode.VKEY_RETURN,

		"numpad0": KeyboardCode.VKEY_NUMPAD0,
		"numpad1": KeyboardCode.VKEY_NUMPAD1,
		"numpad2": KeyboardCode.VKEY_NUMPAD2,
		"numpad3": KeyboardCode.VKEY_NUMPAD3,
		"numpad4": KeyboardCode.VKEY_NUMPAD4,
		"numpad5": KeyboardCode.VKEY_NUMPAD5,
		"numpad6": KeyboardCode.VKEY_NUMPAD6,
		"numpad7": KeyboardCode.VKEY_NUMPAD7,
		"numpad8": KeyboardCode.VKEY_NUMPAD8,
		"numpad9": KeyboardCode.VKEY_NUMPAD9,
		"numpadmultiply": KeyboardCode.VKEY_MULTIPLY,
		"numpadadd": KeyboardCode.VKEY_ADD,
		"numpadsubtract": KeyboardCode.VKEY_SUBTRACT,
		"numpaddecimal": KeyboardCode.VKEY_DECIMAL,
		"numpaddivide": KeyboardCode.VKEY_DIVIDE,

		"f1": KeyboardCode.VKEY_F1,
		"f2": KeyboardCode.VKEY_F2,
		"f3": KeyboardCode.VKEY_F3,
		"f4": KeyboardCode.VKEY_F4,
		"f5": KeyboardCode.VKEY_F5,
		"f6": KeyboardCode.VKEY_F6,
		"f7": KeyboardCode.VKEY_F7,
		"f8": KeyboardCode.VKEY_F8,
		"f9": KeyboardCode.VKEY_F9,
		"f10": KeyboardCode.VKEY_F10,
		"f11": KeyboardCode.VKEY_F11,
		"f12": KeyboardCode.VKEY_F12,

		"numlock": KeyboardCode.VKEY_NUMLOCK,
		"scrolllock": KeyboardCode.VKEY_SCROLL,
		/*
		"semicolon":	KeyboardCode.VKEY_OEM_1,		// ; ;
		"equal":		KeyboardCode.VKEY_OEM_PLUS,		// = ^
		"comma":		KeyboardCode.VKEY_OEM_COMMA,	// , ,
		"minus":		KeyboardCode.VKEY_OEM_MINUS,	// - -
		"period":		KeyboardCode.VKEY_OEM_PERIOD,	// . .
		"slash":		KeyboardCode.VKEY_OEM_2,		// / /
		"quote":		KeyboardCode.VKEY_OEM_3,		// ` :
		"bracketleft":	KeyboardCode.VKEY_OEM_4,		// [ @
		"intlyen":		KeyboardCode.VKEY_OEM_5,		// \ \
		"bracketright":	KeyboardCode.VKEY_OEM_6,		// ] [
		"intlro":		KeyboardCode.VKEY_OEM_7,		// ' \
		*/
	}

	const KeyMap: map = {
		"!": 0x121,
		"\"": 0x122,
		"#": 0x123,
		"$": 0x124,
		"%": 0x125,
		"&": 0x126,
		"'": 0x127,
		"(": 0x128,
		")": 0x129,
		"*": 0x12a,
		"+": 0x12b,
		",": 0x12c,
		"-": 0x12d,
		".": 0x12e,
		"/": 0x12f,
		"0": 0x130,
		"1": 0x131,
		"2": 0x132,
		"3": 0x133,
		"4": 0x134,
		"5": 0x135,
		"6": 0x136,
		"7": 0x137,
		"8": 0x138,
		"9": 0x139,
		":": 0x13a,
		";": 0x13b,
		"<": 0x13c,
		"=": 0x13d,
		">": 0x13e,
		"?": 0x13f,
		"@": 0x140,

		"[": 0x15b,
		"\\": 0x15c, // [U+005C] REVERSE SOLIDUS
		"]": 0x15d,
		"^": 0x15e,
		"_": 0x15f,
		"`": 0x160,
		"a": 0x161,
		"b": 0x162,
		"c": 0x163,
		"d": 0x164,
		"e": 0x165,
		"f": 0x166,
		"g": 0x167,
		"h": 0x168,
		"i": 0x169,
		"j": 0x16a,
		"k": 0x16b,
		"l": 0x16c,
		"m": 0x16d,
		"n": 0x16e,
		"o": 0x16f,
		"p": 0x170,
		"q": 0x171,
		"r": 0x172,
		"s": 0x173,
		"t": 0x174,
		"u": 0x175,
		"v": 0x176,
		"w": 0x177,
		"x": 0x178,
		"y": 0x179,
		"z": 0x17a,
		"{": 0x17b,
		"|": 0x17c,
		"}": 0x17d,
		"~": 0x17e,
		"¥": 0x1a5, // [U+00A5] YEN SIGN
	}
}
