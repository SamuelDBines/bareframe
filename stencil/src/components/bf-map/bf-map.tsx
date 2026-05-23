import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-map',
	styleUrl: 'bf-map.css',
	shadow: true,
})
export class BfMap {
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
