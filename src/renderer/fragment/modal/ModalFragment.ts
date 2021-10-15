import Vue from 'vue'
import Component from 'vue-class-component'

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import { DialogAlert } from '@renderer/fragment/modal/DialogAlert'
import { DialogPrompt } from '@renderer/fragment/modal/DialogPrompt'
import { DialogFind } from '@renderer/fragment/modal/DialogFind'

@Component({
	components: {
		[DialogAlert.TAG]: DialogAlert,
		[DialogPrompt.TAG]: DialogPrompt,
		[DialogFind.TAG]: DialogFind,
	},
})
export class ModalFragment extends Vue {

	static readonly TAG = 'modal'

	type: "find" | "alert" | "prompt" | null = null

	alert(): DialogAlert {
		return <DialogAlert>this.$refs[DialogAlert.TAG]
	}

	prompt(): DialogPrompt {
		return <DialogPrompt>this.$refs[DialogPrompt.TAG]
	}

	find(): DialogFind {
		return <DialogFind>this.$refs[DialogFind.TAG]
	}

	beforeCreate() {
		root.on(Bridge.Modal.Order.CH, (_index: number, data: Bridge.Modal.Order.Data) => {
			if (data.order == "open") {
				this.open(data.type, data.title, data.text)
			}
			else if (data.order == "cancel") {
				this.cancel()
			}
		})
	}

	private open(type: "find" | "alert" | "prompt", title: string, text: string) {
		root.send<Bridge.Modal.Event.Send>({
			ch: 'modal-event',
			args: [-1, { event: "opened", }],
		})
		this.type = type

		this.$nextTick(() => {
			if (this.type == "alert") {
				this.alert().open(title, text,
					() => {
						this.close({ text: "" })
					},
					() => {
						this.cancel()
					})
			}
			else if (this.type == "prompt") {
				this.prompt().open(title, text,
					(text: string) => {
						this.close({ text: text })
					},
					() => {
						this.cancel()
					})
			}
			else if (this.type == "find") {
				this.find().open(title, text,
					(rg: string, dp: string) => {
						this.close({ rg: rg, dp: dp })
					},
					() => {
						this.cancel()
					})
			}
		})
	}

	private close(result: Bridge.Modal.Event.Result) {
		root.send<Bridge.Modal.Event.Send>({
			ch: 'modal-event',
			args: [-1, { event: "closed", result: result}],
		})
		this.type = null
	}

	private cancel() {
		root.send<Bridge.Modal.Event.Send>({
			ch: 'modal-event',
			args: [-1, { event: "canceled"}],
		})
		this.type = null
	}

	render(ce: Vue.CreateElement) {
		if (this.type == "alert") {
			return ce(ModalFragment.TAG, { class: { "modal-fragment": true } }, [
				ce(DialogAlert.TAG, { ref: DialogAlert.TAG })
			])
		}
		else if (this.type == "prompt") {
			return ce(ModalFragment.TAG, { class: { "modal-fragment": true } }, [
				ce(DialogPrompt.TAG, { ref: DialogPrompt.TAG })
			])
		}
		else if (this.type == "find") {
			return ce(ModalFragment.TAG, { class: { "modal-fragment": true } }, [
				ce(DialogFind.TAG, { ref: DialogFind.TAG })
			])
		}

		return null
	}
}
