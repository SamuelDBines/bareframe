import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-empty-state',
	styleUrl: 'bf-empty-state.css',
	shadow: true,
})
export class BfEmptyState {
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
