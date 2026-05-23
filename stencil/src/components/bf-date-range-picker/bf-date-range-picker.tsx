import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-date-range-picker',
	styleUrl: 'bf-date-range-picker.css',
	shadow: true,
})
export class BfDateRangePicker {
	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot />
				</div>
			</Host>
		);
	}
}
