import Vue, { VNodeData, VNodeChildren } from 'vue'
import Component from 'vue-class-component'

import * as _ from 'lodash-es'

import * as Native from '@module/native/ts/renderer'

import { IconComponent } from '@renderer/fragment/filer/IconComponent'
import { SpinnerComponent } from '@renderer/fragment/filer/SpinnerComponent'

export type CellData = {
	class: any
	style: any
	attr: Native.Attributes
}

@Component({
	components: {
		[IconComponent.TAG]: IconComponent,
		[SpinnerComponent.TAG]: SpinnerComponent,
	},
	props: {
		_cell: Object
	}
})
export class CellComponent extends Vue {

	static readonly TAG = 'cell'

	get cell(): CellData {
		return this.$props._cell
	}

	// computed
	get node(): VNodeData {
		return {
			class: this.cell.class,
			style: this.cell.style,
		}
	}

	// computed
	get isEmpty(): boolean {
		return _.isEmpty(this.cell.attr)
	}

	// computed
	get fileType(): Native.AttributeFileType[] {
		return _.map(this.cell.attr, (it) => { return it ? it.file_type : Native.AttributeFileType.none })
	}

	// computed
	get linkTyep(): Native.AttributeLinkType[] {
		return _.map(this.cell.attr, (it) => { return it ? it.link_type : Native.AttributeLinkType.none })
	}

	// computed
	get isLink(): boolean {
		if (this.isEmpty) {
			return false
		}

		let ftype = this.fileType[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			let ltype = this.linkTyep[0] ?? Native.AttributeLinkType.none
			if (ltype == Native.AttributeLinkType.shortcut || ltype == Native.AttributeLinkType.bookmark) {
				return true
			}
		}
		else if (ftype == Native.AttributeFileType.link) {
			return true
		}

		return false
	}

	// computed
	get isSize(): boolean {
		if (this.isEmpty) {
			return false
		}

		let ftype = this.fileType[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			return true
		}

		return false
	}

	// computed
	get isDate(): boolean {
		if (this.isEmpty) {
			return false
		}

		let ftype = this.fileType[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.home || ftype == Native.AttributeFileType.homeuser) {
			return false
		}

		return true
	}

	render(ce: Vue.CreateElement) {
		if (this.isEmpty) {
			// console.log("CellComponent.render empty")
			return ce(CellComponent.TAG, this.node, [ce(SpinnerComponent.TAG)])
		}
		// console.log("CellComponent.render data")

		let name: VNodeData = { class: { "filer-cfile": true } }
		let link: VNodeData = { class: { "filer-clink": true } }
		let trgt: VNodeData = { class: { "filer-ctrgt": true } }

		let ftype = this.fileType[0] ?? Native.AttributeFileType.none
		if (ftype == Native.AttributeFileType.file) {
			let ltype = this.linkTyep[0] ?? Native.AttributeLinkType.none
			if (ltype == Native.AttributeLinkType.shortcut) {
				name.class = _.assign(name.class, { "c-shortcut": true })
			}
			else if (ltype == Native.AttributeLinkType.bookmark) {
				name.class = _.assign(name.class, { "c-bookmark": true })
			}
			else {
				name.class = _.assign(name.class, { "c-file": true })
			}
		}
		else if (ftype == Native.AttributeFileType.link) {
			name.class = _.assign(name.class, { "c-link": true })
		}
		else if (ftype == Native.AttributeFileType.directory) {
			name.class = _.assign(name.class, { "c-directory": true })
		}
		if (this.isLink) {
			let ftype2 = this.fileType[1] ?? Native.AttributeFileType.none
			if (ftype2 == Native.AttributeFileType.none) {
				trgt.class = _.assign(trgt.class, { "c-error": true })
			}
			else if (ftype2 == Native.AttributeFileType.file) {
				let ltype2 = this.linkTyep[1] ?? Native.AttributeLinkType.none
				if (ltype2 == Native.AttributeLinkType.shortcut) {
					trgt.class = _.assign(trgt.class, { "c-shortcut": true })
				}
				else if (ltype2 == Native.AttributeLinkType.bookmark) {
					trgt.class = _.assign(trgt.class, { "c-bookmark": true })
				}
			}
			else if (ftype2 == Native.AttributeFileType.link) {
				trgt.class = _.assign(trgt.class, { "c-link": true })
			}
			else if (ftype2 == Native.AttributeFileType.directory) {
				trgt.class = _.assign(trgt.class, { "c-directory": true })
			}
		}

		let node: VNodeChildren = [
			ce(IconComponent.TAG, { props: { _attr: this.cell.attr[0] } }),
			ce('span', name, this.cell.attr[0].rltv),
			ce('span', link, '->'),
			ce(IconComponent.TAG, { props: { _attr: this.cell.attr[1] } }),
			ce('span', trgt, this.cell.attr[0].link),
		]

		return ce(CellComponent.TAG, this.node, [
			ce('span', { class: { "filer-cname": true } }, this.isLink ? node : node.slice(0, 2)),
			ce('span', { class: { "filer-csize": true } }, this.isSize ? this.cell.attr[0].size.toLocaleString() : null),
			ce('span', { class: { "filer-cdate": true } }, this.isDate ? date(this.cell.attr[0].time) : null),
			ce('span', { class: { "filer-ctime": true } }, this.isDate ? time(this.cell.attr[0].time) : null),
		])
	}
}

function date(sec: number): string {
	if (sec == 0) {
		return '----/--/--'
	}
	let d = new Date(sec * 1000)
	return [
		d.getFullYear(),
		(`0${d.getMonth() + 1}`).slice(-2),
		(`0${d.getDate()}`).slice(-2),
	].join('/')
}

function time(sec: number): string {
	if (sec == 0) {
		return '--:--:--'
	}
	let d = new Date(sec * 1000)
	return [
		(`0${d.getHours()}`).slice(-2),
		(`0${d.getMinutes()}`).slice(-2),
		(`0${d.getSeconds()}`).slice(-2),
	].join(':')
}
