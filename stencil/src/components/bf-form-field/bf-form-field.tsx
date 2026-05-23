import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-form-field',
	styleUrl: 'bf-form-field.css',
	shadow: true,
})
export class BfFormField {
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
