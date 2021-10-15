import Vue from 'vue'
import Component from 'vue-class-component'

import * as _ from 'lodash-es'

import * as Native from '@module/native/ts/renderer'

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import { CellComponent, CellData } from '@renderer/fragment/filer/CellComponent'
import { SpinnerComponent } from '@renderer/fragment/filer/SpinnerComponent'

@Component({
	components: {
		[CellComponent.TAG]: CellComponent,
		[SpinnerComponent.TAG]: SpinnerComponent,
	},
	props: {
		_index: Number
	}
})
export class ListComponent extends Vue {

	static readonly TAG = 'list'

	data: Bridge.List.Data = Bridge.List.InitData()
	make: number = 0
	itrt: CellData[] = []

	get cell(): CellComponent[] {
		return <CellComponent[]>this.$refs[CellComponent.TAG]
	}

	get index(): number {
		return this.$props._index
	}

	updateChange(data: Bridge.List.Change.Data) {
		this.data = data
		this.update()
	}

	updateScan(data: Bridge.List.Scan.Data) {
		this.data = data
		this.data.ls = _.map(_.range(data.length), () => [])
		this.data.mk = _.map(_.range(data.length), () => false)
		this.update()
	}

	updateActive(data: Bridge.List.Active.Data) {
		this.data.status = data.status
		this.update()
	}

	updateCursor(data: Bridge.List.Cursor.Data) {
		this.data.cursor = data.cursor
		this.data.drawCount = data.drawCount
		this.data.drawIndex = data.drawIndex
		this.data.drawPosition = data.drawPosition
		this.data.drawSize = data.drawSize
		this.data.knobPosition = data.knobPosition
		this.data.knobSize = data.knobSize
		this.update()
	}

	updateAttribute(data: Bridge.List.Attribute.Data) {
		if (this.data.update == data.update) {
			_.forEach(data._slice, (v: { ls: Native.Attributes }, i: string) => {
				this.data.ls[Number(i)].length = 0
				this.data.ls[Number(i)].push(...v.ls)
			})
			this.update()
		}
	}

	updateMark(data: Bridge.List.Mark.Data) {
		if (this.data.update == data.update) {
			_.forEach(data._slice, (v: { mk: boolean }, i: string) => {
				this.data.mk[Number(i)] = v.mk
			})
			this.update()
		}
	}

	private update() {
		this.make = _.reduce(this.data.mk, (cnt, mk) => {
			return mk ? cnt + 1 : cnt
		}, 0)
		this.itrt = _.map<number, CellData>(
			_.range(this.data.drawCount),
			(i): CellData => {
				let idx = this.data.drawIndex + i
				let top = this.data.drawPosition + i * this.data.drawSize
				return {
					class: {
						"filer-cell": true,
						"filer-cell-select": this.data.mk[idx],
						"filer-cell-cursor": this.isActive && this.data.cursor == idx,
					},
					style: { top: `${top}px` },
					attr: this.data.ls[idx],
				}
			}
		)
	}

	created() {
		window.addEventListener('resize', this.resized)
	}

	beforeDestroy() {
		window.removeEventListener('resize', this.resized)
	}

	mounted() {
		let r: DOMRect = this.$el.getBoundingClientRect()
		let d: DOMRect = this.$el.getElementsByTagName('data')[0].getBoundingClientRect()
		root.send<Bridge.List.Resize.Send>({
			ch: "filer-resize",
			args: [
				this.index,
				{
					event: "mounted",
					root: {
						x: r.x,
						y: r.y,
						w: r.width,
						h: r.height,
					},
					data: {
						x: d.x,
						y: d.y,
						w: d.width,
						h: d.height,
					}
				}
			]
		})
	}

	private resized(_ev: UIEvent) {
		let r: DOMRect = this.$el.getBoundingClientRect()
		let d: DOMRect = this.$el.getElementsByTagName('data')[0].getBoundingClientRect()
		root.send<Bridge.List.Resize.Send>({
			ch: "filer-resize",
			args: [
				this.index,
				{
					event: "resized",
					root: {
						x: r.x,
						y: r.y,
						w: r.width,
						h: r.height,
					},
					data: {
						x: d.x,
						y: d.y,
						w: d.width,
						h: d.height,
					}
				}
			]
		})
	}

	render(ce: Vue.CreateElement) {
		// console.log(this.index, "ListComponent.render")
		return ce(ListComponent.TAG, { class: { "filer-list": true } }, [
			ce('info', { class: { "filer-info": true } }, [
				ce('dir', { class: { "filer-dir": true } }, `${this.data.wd}`),
				ce('cnt', { class: { "filer-cnt": true } }, 0 <= this.data.length ? `[${this.data.error}] ${this.make}/${this.data.length}` : [ce(SpinnerComponent.TAG)]),
			]),
			ce('stat', { class: { "filer-stat": true, "filer-stat-active": this.isActive, "filer-stat-target": this.isTarget } }),
			ce('data', { class: { "filer-data": true } }, [
				_.map(this.itrt, (it) => {
					return ce(CellComponent.TAG, { ref: CellComponent.TAG, refInFor: true, props: { _cell: it } })
				})
			]),
			ce('scroll', { class: { "filer-scroll": true } },
				this.isActive
					? [ce('knob', { class: { "filer-knob": true }, style: { top: `${this.data.knobPosition}px`, height: `${this.data.knobSize}px` } })]
					: []
			),
		])
	}

	// computed
	get isActive(): boolean {
		return this.data.status == Bridge.Status.active
	}

	// computed
	get isTarget(): boolean {
		return this.data.status == Bridge.Status.target
	}
}
