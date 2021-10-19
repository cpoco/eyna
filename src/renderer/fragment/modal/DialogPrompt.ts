import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export class DialogPrompt extends Vue {

	static readonly TAG = 'dialog-prompt'

	title: string = ""
	text: [string, string] = ["", ""]
	callbackClose: (text: string) => void = () => { }
	callbackCancel: () => void = () => { }

	open(title: string, text: string, callbackClose: (text: string) => void, callbackCancel: () => void) {
		this.title = title
		this.text = [text, text]
		this.callbackClose = callbackClose
		this.callbackCancel = callbackCancel
	}

	updated() {
		setTimeout(() => {
			(<HTMLElement>this.$refs.prompt).focus()
		}, 0)
	}

	private close() {
		this.callbackClose(this.text[0])
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

	private input(input: InputEvent) {
		this.text[0] = (<HTMLDivElement>input.target).innerText
	}

	render(ce: Vue.CreateElement) {
		return ce(DialogPrompt.TAG, {
				class: { "modal-dialog": true },
				attrs: { tabindex: 0 },
				ref: "dialog",
				on: { keydown: this.keydown }
		}, [
			ce("div", { class: { "modal-title": true } }, this.title),
			ce("div", {
				class: { "modal-prompt": true },
				attrs: { contenteditable: true },
				ref: "prompt",
				on: { input: this.input }
			}, this.text[1]),
		])
	}
}
