import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-image',
	styleUrl: 'bf-image.css',
	shadow: true,
})
export class BfImage {
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
