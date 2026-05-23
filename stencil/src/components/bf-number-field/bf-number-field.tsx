import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-number-field',
	styleUrl: 'bf-number-field.css',
	shadow: true,
})
export class BfNumberField {
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
