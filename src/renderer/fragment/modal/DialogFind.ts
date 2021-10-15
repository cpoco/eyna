import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export class DialogFind extends Vue {

	static readonly TAG = 'dialog-find'

	title: string = ""
	rg: [string, string] = ["", ""]
	dp: [string, string] = ["0", "0"]
	callbackClose: (rg: string, dp: string) => void = () => { }
	callbackCancel: () => void = () => { }

	open(title: string, rg: string, callbackClose: (text: string, dp: string) => void, callbackCancel: () => void) {
		this.title = title
		this.rg = [rg, rg]
		this.dp = ["0", "0"]
		this.callbackClose = callbackClose
		this.callbackCancel = callbackCancel
	}

	updated() {
		setTimeout(() => {
			(<HTMLElement>this.$refs.rg).focus()
		}, 0)
	}

	private close() {
		this.callbackClose(this.rg[0], this.dp[0])
	}

	private cancel() {
		this.callbackCancel()
	}

	private keydown(key: KeyboardEvent) {
		if (key.isComposing) {
			return
		}

		if (key.key == "Enter") {
			this.close()
		}
		else if (key.key == "Escape") {
			this.cancel()
		}
	}

	private input1(input: InputEvent) {
		this.rg[0] = (<HTMLDivElement>input.target).innerText
	}

	private input2(input: InputEvent) {
		this.dp[0] = (<HTMLDivElement>input.target).innerText
	}

	render(ce: Vue.CreateElement) {
		return ce(DialogFind.TAG, { class: { "modal-dialog": true }, on: { keydown: this.keydown } }, [
			ce("div", { class: { "modal-title": true } }, this.title),
			ce("div", {
				class: { "modal-prompt": true },
				attrs: { contenteditable: true },
				ref: "rg",
				on: { input: this.input1 }
			}, this.rg[1]),
			ce("div", {
				class: { "modal-prompt": true },
				attrs: { contenteditable: true },
				ref: "dp",
				on: { input: this.input2 }
			}, this.dp[1]),
		])
	}
}
