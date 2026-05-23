import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-virtual-list',
	styleUrl: 'bf-virtual-list.css',
	shadow: true,
})
export class BfVirtualList {
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
