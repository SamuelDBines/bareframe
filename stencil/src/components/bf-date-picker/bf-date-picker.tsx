import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-date-picker',
	styleUrl: 'bf-date-picker.css',
	shadow: true,
})
export class BfDatePicker {
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
