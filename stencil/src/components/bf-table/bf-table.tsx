import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-table',
	styleUrl: 'bf-table.css',
	shadow: true,
})
export class BfTable {
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
