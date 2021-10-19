import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export class DialogAlert extends Vue {

	static readonly TAG = 'dialog-alert'

	title: string = ""
	text: string = ""
	callbackClose: () => void = () => { }
	callbackCancel: () => void = () => { }

	open(title: string, text: string, callbackClose: () => void, callbackCancel: () => void) {
		this.title = title
		this.text = text
		this.callbackClose = callbackClose
		this.callbackCancel = callbackCancel
	}

	updated() {
		setTimeout(() => {
			(<HTMLElement>this.$refs.dialog).focus()
		}, 0)
	}

	private close() {
		this.callbackClose()
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

	render(ce: Vue.CreateElement) {
		return ce(DialogAlert.TAG, {
			class: { "modal-dialog": true },
			attrs: { tabindex: 0 },
			ref: "dialog",
			on: { keydown: this.keydown }
		}, [
			ce("div", { class: { "modal-title": true }, }, this.title),
			ce("div", { class: { "modal-alert": true } }, this.text),
		])
	}
}
