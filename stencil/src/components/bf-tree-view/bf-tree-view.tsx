import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-tree-view',
	styleUrl: 'bf-tree-view.css',
	shadow: true,
})
export class BfTreeView {
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
