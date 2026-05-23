import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-nav',
	styleUrl: 'bf-nav.css',
	shadow: true,
})
export class BfNav {
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
