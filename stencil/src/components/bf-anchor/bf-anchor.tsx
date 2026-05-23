import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-anchor',
	styleUrl: 'bf-anchor.css',
	shadow: true,
})
export class BfAnchor {
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
