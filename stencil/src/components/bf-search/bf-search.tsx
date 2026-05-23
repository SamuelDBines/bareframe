import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-search',
	styleUrl: 'bf-search.css',
	shadow: true,
})
export class BfSearch {
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
