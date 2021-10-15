import Vue, { VNodeData } from 'vue'
import Component from 'vue-class-component'

import * as Native from '@module/native/ts/renderer'

@Component({
	props: {
		_attr: Object
	}
})
export class IconComponent extends Vue {

	static readonly TAG = 'icon'

	static readonly home = "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z"
	static readonly none = "M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z"
	static readonly directory = "M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"
	static readonly link = "M17,12L12,17V14H8V10H12V7L17,12M3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19M5,19H19V5H5V19Z"
	static readonly file = "M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"

	get attr(): Native.Attribute {
		return this.$props._attr
	}

	get d(): string {
		if (this.attr.file_type == Native.AttributeFileType.home) {
			return IconComponent.home
		}
		else if (this.attr.file_type == Native.AttributeFileType.homeuser) {
			return IconComponent.link
		}
		else if (this.attr.file_type == Native.AttributeFileType.directory) {
			return IconComponent.directory
		}
		else if (this.attr.file_type == Native.AttributeFileType.link) {
			return IconComponent.link
		}
		else if (this.attr.file_type == Native.AttributeFileType.file) {
			return IconComponent.file
		}

		return IconComponent.none
	}

	get svg(): VNodeData {
		return {
			attrs: {
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 24 24"
			}
		}
	}

	get path(): VNodeData {
		return {
			attrs: {
				fill: "#DDD", 
				d: this.d
			}
		}
	}

	render(ce: Vue.CreateElement) {
		return ce(IconComponent.TAG, { class: { "filer-cicon": true } }, [
			ce('svg', this.svg, [
				ce('path', this.path)
			]),
		])
	}
}
