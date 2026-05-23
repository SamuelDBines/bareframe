import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-fab',
	styleUrl: 'bf-fab.css',
	shadow: true,
})
export class BfFab {
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
