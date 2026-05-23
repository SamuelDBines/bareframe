import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-data-grid',
	styleUrl: 'bf-data-grid.css',
	shadow: true,
})
export class BfDataGrid {
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
