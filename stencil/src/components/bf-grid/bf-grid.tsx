import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-grid',
	styleUrl: 'bf-grid.css',
	shadow: true,
})
export class BfGrid {
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
