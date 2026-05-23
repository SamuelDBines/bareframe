import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-filter-bar',
	styleUrl: 'bf-filter-bar.css',
	shadow: true,
})
export class BfFilterBar {
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
