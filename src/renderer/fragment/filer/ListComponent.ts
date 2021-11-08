import * as vue from "vue"

import * as _ from 'lodash-es'

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import * as FilerProvider from '@renderer/fragment/filer/FilerProvider'
import * as CellComponent from '@renderer/fragment/filer/CellComponent'
import * as SpinnerComponent from '@renderer/fragment/filer/SpinnerComponent'

const TAG = "list"

export const V = vue.defineComponent({

	props: {
		list: {
			required: true,
			type: Object as vue.PropType<FilerProvider.List>,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>()

		const _mounted = () => {
			let r: DOMRect = el.value!.getBoundingClientRect()
			let d: DOMRect = el.value!.getElementsByTagName('data')[0].getBoundingClientRect()
			root.send<Bridge.List.Resize.Send>({
				ch: "filer-resize",
				args: [
					props.list.i,
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

		const _resized = () => {
			let r: DOMRect = el.value!.getBoundingClientRect()
			let d: DOMRect = el.value!.getElementsByTagName('data')[0].getBoundingClientRect()
			root.send<Bridge.List.Resize.Send>({
				ch: "filer-resize",
				args: [
					props.list.i,
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

		vue.onMounted(() => {
			_mounted()
		})

		vue.onBeforeUnmount(() => {
			window.removeEventListener('resize', _resized)
		})

		window.addEventListener('resize', _resized)

		return {
			el,
		}
	},

	render() {
		let active = this.list.data.status == Bridge.Status.active
		let target = this.list.data.status == Bridge.Status.target

		return vue.h(TAG, { ref: "el", class: { "filer-list": true } }, [
			vue.h('info', { class: { "filer-info": true } }, [
				vue.h('dir', { class: { "filer-dir": true } }, `${this.list.data.wd}`),
				vue.h('cnt', { class: { "filer-cnt": true } },
					0 <= this.list.data.length
						? `[${this.list.data.error}] ${this.list.make}/${this.list.data.length}`
						: vue.h(SpinnerComponent.V)
				),
			]),
			vue.h('stat', { class: { "filer-stat": true, "filer-stat-active": active, "filer-stat-target": target } }),
			vue.h('data', { class: { "filer-data": true } }, [
				_.map(this.list.cell, (cell) => {
					return vue.h(CellComponent.V, { cell })
				})
			]),
			vue.h('scroll', { class: { "filer-scroll": true } }, [
				active
					? vue.h('knob', { class: { "filer-knob": true }, style: { top: `${this.list.data.knobPosition}px`, height: `${this.list.data.knobSize}px` } })
					: null
			]),
		])
	}

})
