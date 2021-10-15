import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export class SpinnerComponent extends Vue {

	static readonly TAG = 'spinner'

	render(ce: Vue.CreateElement) {
		return ce(SpinnerComponent.TAG, { class: { "spinner": true } })
	}

}