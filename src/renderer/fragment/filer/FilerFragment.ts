import Vue from 'vue'
import Component from 'vue-class-component'

import * as _ from 'lodash-es'

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import { ListComponent } from '@renderer/fragment/filer/ListComponent'

@Component({
	components: {
		[ListComponent.TAG]: ListComponent,
	}
})
export class FilerFragment extends Vue {

	static readonly TAG = 'filer'

	ready: boolean = false

	get list(): ListComponent[] {
		return <ListComponent[]>this.$refs[ListComponent.TAG]
	}

	beforeCreate() {
		root
			.on(Bridge.List.Change.CH, (index: number, data: Bridge.List.Change.Data) => {
				this.list[index].updateChange(data)
			})
			.on(Bridge.List.Scan.CH, (index: number, data: Bridge.List.Scan.Data) => {
				this.list[index].updateScan(data)
			})
			.on(Bridge.List.Active.CH, (index: number, data: Bridge.List.Active.Data) => {
				this.list[index].updateActive(data)
			})
			.on(Bridge.List.Cursor.CH, (index: number, data: Bridge.List.Cursor.Data) => {
				this.list[index].updateCursor(data)
			})
			.on(Bridge.List.Attribute.CH, (index: number, data: Bridge.List.Attribute.Data) => {
				this.list[index].updateAttribute(data)
			})
			.on(Bridge.List.Mark.CH, (index: number, data: Bridge.List.Mark.Data) => {
				this.list[index].updateMark(data)
			})
	}

	mounted() {
		let r: DOMRect = this.$el.getBoundingClientRect()
		root
			.invoke<Bridge.Filer.Resize.Send, Bridge.Filer.Style.Data>({
				ch: 'filer-resize',
				args: [
					-1,
					{
						event: "mounted",
						root: {
							x: r.x,
							y: r.y,
							w: r.width,
							h: r.height,
						}
					}
				]
			})
			.then((data: Bridge.Filer.Style.Data) => {
				let e = document.querySelector<HTMLElement>(":root")
				e?.style.setProperty("--dynamic-filer-font-size", data.fontSize)
				e?.style.setProperty("--dynamic-filer-line-height", data.lineHeight)
				this.ready = true
			})
	}

	render(ce: Vue.CreateElement) {
		// console.log("FilerFragment.render")
		return ce(FilerFragment.TAG, { class: { "filer-fragment": true } },
			this.ready
				? _.map(_.range(3), (it) => {
					return ce(ListComponent.TAG, { ref: ListComponent.TAG, refInFor: true, props: { _index: it } })
				})
				: []
		)
	}
}
