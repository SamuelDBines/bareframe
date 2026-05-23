import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-combobox',
	styleUrl: 'bf-combobox.css',
	shadow: true,
})
export class BfCombobox {
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
